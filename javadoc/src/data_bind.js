// 数据绑定(单向)

export const data = new Proxy({}, {
    set(target, key, value) {
        startObserver();
        target[key] = value;
        for (let elem of document.querySelectorAll(`*[data-value="${key}"]`)) {
            elem.textContent = value;
        }
    }
});

let observing = false;

function startObserver() {
    if (observing) {
        return;
    }
    observing = true;
    const observer = new MutationObserver(records => {
        function apply(node) {
            function applyValue(elem) {
                let dataKey = elem.getAttribute("data-value");
                if (dataKey !== "") {
                    elem.textContent = data[dataKey];
                }
            }

            if (!(node instanceof HTMLElement)) {
                return;
            }
            if (node.matches("*[data-value]")) {
                applyValue(node);
            }
            for (let elem of node.querySelectorAll("*[data-value]")) {
                applyValue(elem);
            }
        }

        for (let record of records) {
            if (record.addedNodes.length !== 0) {
                for (let node of record.addedNodes) {
                    apply(node);
                }
            }
            if (record.attributeName !== null && record.attributeName !== "") {
                apply(record.target);
            }
        }
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-value"]
    });
    observing = true;
}
