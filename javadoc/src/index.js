import './page_info';
import './announcement';
import {initCompatibilityHelper} from "./compatibility_helper";
import {addSideButtons} from "./side_button";

$(function () {
    showAnnouncement(false);
    initCompatibilityHelper();
    addSideButtons();
});
