let _views = {};
let _currentView = "home";

export function initViews(viewsMap) {
    _views = viewsMap;
}

export function currentViewName() {
    return _currentView;
}

export function switchView(viewName) {
    _currentView = viewName;
    Object.keys(_views).forEach(name => {
        const el = _views[name];
        if (name === viewName) {
            el.classList.remove("hidden");
            el.classList.add("active");
        } else {
            el.classList.remove("active");
            el.classList.add("hidden");
        }
    });
}

export function goHome(renderOrdersHistory) {
    renderOrdersHistory();
    switchView("home");
}
