import * as api from "./api";
import * as modal from "./modal";
import * as settings from "./local_settings";

window.showAnnouncement = force => {
    if (!force && window.location.protocol === "file:") {
        return;
    }
    let show = (resp, callback) => modal.show(resp.title, resp.message, callback, true);
    api.doRequest("/announcement").then(resp => {
        if (force) {
            return show(resp);
        }
        if (!resp.showAnnouncement) {
            return;
        }
        if (settings.get(settings.ANNOUNCEMENT_LAST_READ) === resp.lastUpdated.toString()) {
            return;
        }
        show(resp, () => settings.set(settings.ANNOUNCEMENT_LAST_READ, resp.lastUpdated));
    });
};
