import tippy from "tippy.js";
import * as databind from "./data_bind";
import * as api from "./api";
import * as settings from "./local_settings";

let allver;

export function getVersions() {
    return new Promise((resolve, reject) => {
        if (allver) {
            return resolve(allver);
        }
        return api.doRequest("/doc/versions").then(resp => {
            allver = resp.all;
            return resolve(allver);
        }).catch(reason => reject(reason));
    });
}

let memberCompatibilityInfo = new Map();

function getMemberCompatibility(memberInfo) {
    return new Promise((resolve, reject) => {
        let {ver, package:pkg, type, member, memberType} = memberInfo;
        let key = `${pkg}.${type}.${member}:${memberType}:${ver}`;
        let info = memberCompatibilityInfo.get(key);
        if (info) {
            return resolve(info);
        }
        return api.doRequest("/doc/compatibility/single_member", memberInfo).then(resp => {
            memberCompatibilityInfo.set(key, resp);
            return resolve(resp);
        }).catch(reason => reject(reason));
    })
}

let summary;

function getMembersCompatibilitySummary(typeName) {
    return new Promise((resolve, reject) => {
        if (summary) {
            return resolve(summary);
        }
        return api.doRequest("/doc/compatibility/all_members_summary", {
            ver: docver,
            package: getPackageName(),
            type: typeName,
        }).then(resp => {
            summary = resp;
            return resolve(summary);
        }).catch(reason => reject(reason));
    });
}

export function initCompatibilityHelper() {
    if (!isTypePage()) {
        return;
    }
    $("section.detail h3").append('<span class="compatibility-tip"></span>');
    let typeName = getTypeSimpleName();
    getMembersCompatibilitySummary(typeName).then(resp => {
        for (let member in resp) {
            let ret = resp[member];
            if (member.startsWith(typeName)) {
                member = member.replace(typeName, "<init>");
            }
            $(`#${CSS.escape(member)} .compatibility-tip`).text(`兼容:${ret}`);
        }
        let settingTargetVersion = settings.get(settings.COMPATIBILITY_TARGET_VERSION);
        let settingHideAction = settings.get(settings.COMPATIBILITY_HIDE_ACTION);
        if (settingTargetVersion !== null && settingHideAction !== null) {
            hideIncompatibleMembers(settingTargetVersion, settingHideAction);
        }
    }).catch((xhr) => {
        // todo:细致处理返回的错误
        console.warn(xhr);
    });
    tippy("span.compatibility-tip", {
        content: "加载中...",
        theme: "light",
        delay: 200,
        interactive: true,
        allowHTML: true,
        // 提示框显示时取消掉 section.detail 的 position 样式, 这样提示框才能显示在鼠标上方
        onShow(instance) {
            let ele = $(instance.reference);
            let detailSection = ele.parents("section.detail");
            detailSection.css("position", "unset");
            let id = ele.parents("section.detail").attr("id").replace("<init>", getTypeSimpleName());
            let memberType = getMemberType(detailSection);
            getMemberCompatibility({
                // todo:ver应由服务器回传 (针对使用离线版文档和第三方部署文档的用户)
                ver: docver,
                memberType: memberType,
                package: getPackageName(),
                type: getTypeSimpleName(),
                member: id
            }).then(resp => {
                let tl = function (status) {
                    if (status === "draft") {
                        return "草案";
                    } else if (status === "deprecated") {
                        return "已过时";
                    } else {
                        return "稳定支持";
                    }
                };
                let content = "";

                for (let i = 0; i < resp.length; i++) {
                    let vers = resp[i].versions;
                    let status = tl(resp[i].support_status);
                    content += status + ": ";
                    for (let i = 0; i < vers.length; i++) {
                        content += '<span class="ver">' + vers[i] + '</span>';
                        if ((i + 1) % 5 === 0 && i !== vers.length - 1) {
                            content += '<br/>';
                        }
                    }
                    content += "<br/>";
                }

                instance.setContent(content);
            });
        },
        onHidden(instance) {
            let ele = $(instance.reference);
            let detailSection = ele.parents("section.detail");
            detailSection.css("position", "");
        },
    });
}

let prevHideAction, prevTarget;

export function hideIncompatibleMembers(targetVersion, action = "hide") {
    if (prevTarget === targetVersion && prevHideAction === action) {
        return;
    }
    prevTarget = targetVersion;
    prevHideAction = action;
    getMembersCompatibilitySummary(getTypeSimpleName()).then(resp => {
        $("section.detail").each(function () {
            let id = $(this).attr("id").replace("<init>", getTypeSimpleName());
            let minVersion = resp[id];
            if (minVersion !== undefined) {
                let plusSymbolIndex = minVersion.lastIndexOf("+");
                if (plusSymbolIndex !== -1) {
                    minVersion = minVersion.slice(0, plusSymbolIndex);
                }
            }
            if (minVersion > targetVersion) {
                databind.data["target-version"] = targetVersion;
                $(this).find(".incompatible-warning").remove();
                if (action === "blur") {
                    if (hasIncompatibleOverlay(this)) {
                        return;
                    }
                    $(this).show();
                    $(this).find(".incompatible-overlay").remove();
                    let classNames = "incompatible-overlay";
                    $(this).children("h3").after(`<div class="${classNames}">
<div style="font-size: 40px;margin-bottom: 50px;">⚠️</div>
<div>不兼容<span data-value="target-version"></span></div>
</div>`);
                } else if (action === "hide") {
                    $(this).find(".incompatible-overlay").remove();
                    $(this).fadeOut();
                } else if (action === "warning") {
                    $(this).show();
                    fadeOutIncompatibleOverlay(this);
                    $(this).find(".member-signature").after(`
                    <div class="incompatible-warning deprecation-block">
                    <span class="deprecated-label">不兼容警告</span>
                    <div class="deprecation-comment">此 API 不兼容您所选的目标版本:<strong><span data-value="target-version"></span></strong></div>
                    </div>
                    `);
                }
            } else {
                $(this).find(".incompatible-warning").remove();
                $(this).fadeIn();
                fadeOutIncompatibleOverlay(this);
            }
        });
    });
}

function fadeOutIncompatibleOverlay(detailSection) {
    let overlay = $(detailSection).find(".incompatible-overlay");
    overlay.html("").addClass("incompatible-overlay-fade-out");
    setTimeout(() => overlay.remove(), 400);
}

function hasIncompatibleOverlay(element) {
    return $(element).find(".incompatible-overlay").length !== 0;
}
