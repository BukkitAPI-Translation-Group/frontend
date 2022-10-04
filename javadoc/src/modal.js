export function show(title = "", content = "", closeCallback, html = false) {
    let container = document.getElementsByClassName("modal-container");
    if (container.length > 0) {
        destroy(container[0]).then(() => create(title, content, closeCallback, html));
    } else {
        create(title, content, closeCallback, html);
    }
}

window.showModal = show;

function create(title = "", content = "", closeCallback, html = false) {
    const template = `
<div class="modal-container">
    <div class="modal">
        <div class="modal-title" id="modal-title"></div>
        <div class="modal-content" id="modal-content"></div>
        <div class="modal-action">
            <button type="button" class="modal-button modal-button-confirm">OK✅</button>
        </div>
    </div>
</div>
`;
    document.body.insertAdjacentHTML("beforeend", template);
    let container = document.getElementsByClassName("modal-container")[0];
    let confirmButton = document.getElementsByClassName("modal-button-confirm")[0];
    let elemTitle = document.getElementById("modal-title");
    let elemContent = document.getElementById("modal-content");
    if (html) {
        elemTitle.innerHTML = title;
        elemContent.innerHTML = content;
    } else {
        elemTitle.textContent = title;
        elemContent.textContent = content;
    }
    confirmButton.addEventListener("click", () => destroy(container).then(() => {
        if (closeCallback) {
            closeCallback();
        }
    }));
    container.style.display = "flex";
}

function destroy(container) {
    return new Promise(resolve => {
        container.style.background = "unset";
        let elemModal = container.getElementsByClassName("modal")[0];
        elemModal.style.animation = "modal-hide 0.1s forwards";
        elemModal.addEventListener("animationend", () => {
            container.remove();
            resolve();
        });
    });
}
