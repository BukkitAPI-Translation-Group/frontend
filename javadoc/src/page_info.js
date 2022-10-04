window.isTypePage = () => {
    return document.querySelector(".type-signature") !== null;
}

window.getTypeSimpleName = () => {
    let url = window.location.pathname;
    let page = url.slice(url.lastIndexOf("/") + 1);
    let i = page.lastIndexOf(".html");
    if (i !== -1) {
        return page.slice(0, i);
    }
    return "";
};

window.getPackageName = () => {
    let url = window.location.pathname;
    let page = url.slice(url.lastIndexOf("/") + 1);
    if (page === "package-summary.html") {
        return $(".package-signature .element-name").text();
    }
    return $(".package-label-in-type").next().text();
};

window.getTypeName = () => {
    return getPackageName() + "." + getTypeSimpleName();
};

window.getMemberType = detailSection => {
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
