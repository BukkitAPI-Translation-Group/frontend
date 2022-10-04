export const ANNOUNCEMENT_LAST_READ = "announcement.last_read";
export const COMPATIBILITY_HIDE_ACTION = "compatibility_helper.hide_action";
export const COMPATIBILITY_TARGET_VERSION = "compatibility_helper.target_version";

export function get(key, defaultValue) {
    let value = window.localStorage.getItem(key);
    if (value === null && defaultValue !== undefined) {
        return defaultValue;
    }
    return value;
}

export function set(key, value) {
    window.localStorage.setItem(key, value);
}
