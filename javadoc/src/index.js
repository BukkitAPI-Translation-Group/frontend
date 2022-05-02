import Swal from 'sweetalert2/dist/sweetalert2.js';
import tippy from 'tippy.js';
import './jquery.hoverIntent.js';

const API_ENDPOINT = "https://bukkit.windit.net/api";

window.getTypeSimpleName = function () {
    return $(".type-name-label").text();
};

window.getPackageName = function () {
    let url = window.location.pathname;
    let page = url.substring(url.lastIndexOf("/") + 1);
    if (page == "package-summary.html") {
        return $(".package-signature .element-name").text();
    }
    return $(".package-label-in-type").next().text();
};

window.getTypeName = function () {
    return getPackageName() + "." + getTypeSimpleName();
};

window.getMemberType = function (detailSection) {
    let id = $(detailSection).parents("section").attr("id");
    switch (id) {
        case "method-detail":
            return "method";
        case "field-detail":
            return "field";
        case "constructor-detail":
            return "constructor";
        case "enum-constant-detail":
            return "enum_constant";
        default:
            return "";
    }
};

window.showAnnouncement = function (force) {
    if (!force && window.location.protocol == "file:") {
        return;
    }
    let show = function (resp, callback) {
        Swal.fire({
            title: resp.title,
            html: resp.message,
            confirmButtonText: 'OK✅',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(callback);
    };
    $.ajax(API_ENDPOINT + "/announcement").done(function (resp) {
        if (force) {
            return show(resp);
        }
        if (!resp.showAnnouncement) {
            return;
        }
        if (window.localStorage.getItem("last_announcement_read") == resp.lastUpdated) {
            return;
        }
        show(resp, function () {
            window.localStorage.setItem("last_announcement_read", resp.lastUpdated);
        });
    });
};

$(function () {
    showAnnouncement(false);
    let tippyInstances = new Map();
    $("section.detail h3").append('<button class="support">支持的版本</button>');
    $("section.detail button.support").hoverIntent(function (e) {
        let ele = this;
        let detailSection = $(ele).parents("section.detail");
        let id = $(ele).parents("section.detail").attr("id").replace("<init>", getTypeSimpleName());
        let memberType = getMemberType(detailSection);
        $.post(API_ENDPOINT + "/doc/supported_versions", {
            queryType: memberType,
            package: getPackageName(),
            type: getTypeSimpleName(),
            member: id
        }, function (data, status) {
            if (status != "success") {
                return;
            }
            let tl = function (status) {
                if (status == "draft") {
                    return "草案";
                } else if (status == "deprecated") {
                    return "已过时";
                } else {
                    return "稳定支持";
                }
            };
            let content = "";

            for (let i = 0; i < data.length; i++) {
                let vers = data[i].versions;
                let status = tl(data[i].support_status);
                content += status + ": ";
                for (let i = 0; i < vers.length; i++) {
                    content += '<span class="ver">' + vers[i] + '</span>';
                    if ((i + 1) % 5 == 0 && i != vers.length - 1) {
                        content += '<br/>';
                    }
                }
                content += "<br/>";
            }

            let ins;
            if (!tippyInstances.has(id)) {
                ins = tippy(e.target, {
                    allowHTML: true,
                    theme: "light",
                    trigger: "manual"
                });
                tippyInstances.set(id, ins);
            } else {
                ins = tippyInstances.get(id);
            }
            ins.setContent(content);
            ins.show();
        });

    }, function () {
        let id = $(this).parents("section.detail").attr("id").replace("<init>", getTypeSimpleName());
        if (tippyInstances.has(id)) {
            let ins = tippyInstances.get(id);
            ins.hide();
        }
    });
    $("*section.detail").hoverIntent(function () {
        $(this).find(".support").fadeIn();
    }, function () {
        $(this).find(".support").fadeOut();
    });
});
