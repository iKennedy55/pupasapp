let _toastEl = null;
let _toastTimeout;

export function initToast(el) {
    _toastEl = el;
}

export function showToast(msg) {
    clearTimeout(_toastTimeout);
    _toastEl.textContent = msg;
    _toastEl.classList.remove("hidden");
    _toastEl.classList.add("show");
    _toastTimeout = setTimeout(() => {
        _toastEl.classList.remove("show");
        setTimeout(() => _toastEl.classList.add("hidden"), 300);
    }, 2200);
}
