import tippy from "tippy.js";
import {getVersions, hideIncompatibleMembers} from "./compatibility_helper";
import * as settings from "./local_settings";

export function addSideButtons() {
    $("main").after(`<div class="sidebar-container-outer">
<div class="sidebar-container">
    <div class="sidebar-buttons">
        <button class="sidebar-button sidebar-button-compatibility-helper" style="display:none">兼容助手</button>
        <button class="sidebar-button sidebar-button-top">返回顶部</button>
    </div>
</div>
</div>`);
    if (isTypePage()) {
        $(".sidebar-button-compatibility-helper").show();
        const vers = "#compatibility-helper-box .allvers";
        const actionItems = "#incompatible-action li";
        let verInfoAppended = false;
        tippy(".sidebar-button-compatibility-helper", {
            content: `
<div id="compatibility-helper-box" style="text-align:left;width: 150px;height: 150px;padding-left: 10px;padding-top: 10px;pointer-events: auto">
    <span>目标版本:</span>
    <select name="version" class="allvers">
    <option value="none">请选择...</option>
    </select>
    <br>
    <span>对不兼容的API：</span>
    <ul class="check-items" id="incompatible-action">
        <li data-option="hide">隐藏</li>
        <li data-option="blur" style="display:none">模糊</li>
        <li data-option="warning">显示警告</li>
    </ul>
</div>
        `,
            interactive: true,
            allowHTML: true,
            placement: "left",
            theme: "light",
            trigger: "click",
            onMount(instance) {
                if (CSS.supports("backdrop-filter","blur(0)")) {
                    $(`#compatibility-helper-box li[data-option="blur"]`).show();
                }
                getVersions().then(allver => {
                    if (!verInfoAppended) {
                        verInfoAppended = true;
                        for (let v of allver) {
                            $("#compatibility-helper-box .allvers").append(`<option value="${v}">${v}</option>`);
                        }
                    }
                    let settingTargetVersion = settings.get(settings.COMPATIBILITY_TARGET_VERSION, "none");
                    $(vers).val(settingTargetVersion);
                });
                let settingHideAction = settings.get(settings.COMPATIBILITY_HIDE_ACTION, "hide");
                $(`#compatibility-helper-box li[data-option="${settingHideAction}"]`).addClass("check-items-checked");
                $(vers).on('change', function () {
                    if (this.value !== "none") {
                        settings.set(settings.COMPATIBILITY_TARGET_VERSION, this.value);
                        hideIncompatibleMembers(this.value, $("#incompatible-action .check-items-checked").data("option"));
                    }
                });
                $(actionItems).click(function () {
                    let prevChecked = $(this).parent().find(".check-items-checked");
                    let prevOption = prevChecked.data("option");
                    let clickedOption = this.dataset.option;
                    settings.set(settings.COMPATIBILITY_HIDE_ACTION, clickedOption);
                    if (prevOption === clickedOption) {
                        return;
                    }
                    prevChecked.removeClass("check-items-checked");
                    $(this).addClass("check-items-checked");
                    let target = $(vers).val();
                    if (target !== "none") {
                        hideIncompatibleMembers(target, clickedOption);
                    }
                });
            },
            onHide(instance) {
                $(vers).unbind();
                $(actionItems).unbind();
            }
        });
    }
    toggleButtonTop(false);
    $(".sidebar-button-top").click(() => {
        $(".flex-content").animate({
            scrollTop: 0
        });
    });
    $(".flex-content").scroll(() => toggleButtonTop(true));
}

function toggleButtonTop(animation) {
    let toggle;
    if (animation) {
        toggle = (element, show) => {
            show ? element.fadeIn() : element.fadeOut();
        };
    } else {
        toggle = (element, show) => {
            show ? element.show() : element.hide();
        };
    }
    if ($(".flex-content").scrollTop() > $(".summary").position()?.top) {
        toggle($(".sidebar-button-top"), true);
    } else {
        toggle($(".sidebar-button-top"), false);
    }
}
