import { state } from './modules/state.js';
import { initToast, showToast } from './modules/toast.js';
import { initViews, switchView, currentViewName, goHome } from './modules/views.js';
import { initOrder, startOrder, setupPersonView, addPupusaRow, nextPerson, prevPerson, openEditNameModal, closeModal, confirmEditName, editSavedOrder } from './modules/order.js';
import { initSummary, showSummary, copySummaryToClipboard, saveOrder, viewSavedOrder, deleteSavedOrder } from './modules/summary.js';
import { initSettings, addSpecialty, renderSpecialtiesList } from './modules/settings.js';

// dom refs
const views = {
    home: document.getElementById("home-view"),
    name: document.getElementById("name-view"),
    order: document.getElementById("order-view"),
    summary: document.getElementById("summary-view"),
    settings: document.getElementById("settings-view"),
    savedOrder: document.getElementById("saved-order-view"),
};

const ui = {
    btnNewOrder: document.getElementById("btn-new-order"),
    ordersHistorySection: document.getElementById("orders-history-section"),
    ordersHistoryList: document.getElementById("orders-history-list"),
    orderNameInput: document.getElementById("order-name-input"),
    peopleDisplay: document.getElementById("people-display"),
    btnStart: document.getElementById("btn-start"),
    btnBackHome: document.getElementById("btn-back-home"),
    progressIndicator: document.getElementById("progress-indicator"),
    personTitle: document.getElementById("person-title"),
    btnEditName: document.getElementById("btn-edit-name"),
    pupusasList: document.getElementById("pupusas-list"),
    btnAddPupusa: document.getElementById("btn-add-pupusa"),
    personNote: document.getElementById("person-note"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnBackToOrder: document.getElementById("btn-back-to-order"),
    summaryOrderTitle: document.getElementById("summary-order-title"),
    summaryByPerson: document.getElementById("summary-by-person"),
    summaryTotals: document.getElementById("summary-totals"),
    grandTotal: document.getElementById("grand-total"),
    moneyTotalRow: document.getElementById("money-total-row"),
    grandMoney: document.getElementById("grand-money"),
    btnCopySummary: document.getElementById("btn-copy-summary"),
    btnSaveOrder: document.getElementById("btn-save-order"),
    btnOpenSettings: document.getElementById("btn-open-settings"),
    btnCloseSettings: document.getElementById("btn-close-settings"),
    newSpecialtyInput: document.getElementById("new-specialty-input"),
    newSpecialtyPrice: document.getElementById("new-specialty-price"),
    btnAddSpecialty: document.getElementById("btn-add-specialty"),
    specialtiesList: document.getElementById("specialties-list"),
    btnDeleteSaved: document.getElementById("btn-delete-saved"),
    savedOrderTitle: document.getElementById("saved-order-title"),
    savedOrderDate: document.getElementById("saved-order-date"),
    savedOrderContent: document.getElementById("saved-order-content"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalNameInput: document.getElementById("modal-name-input"),
    modalCancel: document.getElementById("modal-cancel"),
    modalConfirm: document.getElementById("modal-confirm"),
};

const templates = {
    pupusaItem: document.getElementById("pupusa-item-template"),
};

// helpers
function _goHome() {
    goHome(renderOrdersHistory);
}

window.goHome = _goHome;
window.adjustPeople = function (delta) {
    let val = state.totalPeople + delta;
    if (val < 1) val = 1;
    if (val > 50) val = 50;
    state.totalPeople = val;
    ui.peopleDisplay.textContent = val;
};

function renderOrdersHistory() {
    const list = state.savedOrders;
    if (list.length === 0) {
        ui.ordersHistorySection.classList.add("hidden");
        return;
    }

    ui.ordersHistorySection.classList.remove("hidden");
    ui.ordersHistoryList.innerHTML = "";

    list.forEach((order, index) => {
        const totalPupusas = order.orders.reduce((sum, p) => sum + (p ? p.reduce((s, i) => s + i.qty, 0) : 0), 0);
        const date = new Date(order.date);
        const dateStr = date.toLocaleDateString("es-SV", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

        const card = document.createElement("div");
        card.className = "order-history-card";
        card.innerHTML = `
            <div class="order-history-info" data-index="${index}">
                <span class="order-history-name">${order.name}</span>
                <span class="order-history-meta">${order.totalPeople} persona${order.totalPeople > 1 ? "s" : ""} - ${totalPupusas} pupusa${totalPupusas !== 1 ? "s" : ""}</span>
                <span class="order-history-date">${dateStr}</span>
            </div>
            <button class="btn-edit-order" data-index="${index}" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
        `;

        card.querySelector(".order-history-info").addEventListener("click", () => viewSavedOrder(index));
        card.querySelector(".btn-edit-order").addEventListener("click", (e) => {
            e.stopPropagation();
            editSavedOrder(index);
        });

        ui.ordersHistoryList.appendChild(card);
    });
}

// init
function init() {
    initViews(views);
    initToast(document.getElementById("toast"));
    initOrder(ui, templates);
    initSummary(ui);
    initSettings(ui);

    renderSpecialtiesList();
    renderOrdersHistory();

    // settings
    ui.btnOpenSettings.addEventListener("click", () => {
        state._settingsReturnView = currentViewName();
        switchView("settings");
    });
    ui.btnCloseSettings.addEventListener("click", () => {
        switchView(state._settingsReturnView || "home");
    });
    ui.btnAddSpecialty.addEventListener("click", addSpecialty);
    ui.newSpecialtyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addSpecialty(); });

    // home
    ui.btnNewOrder.addEventListener("click", () => {
        ui.orderNameInput.value = "";
        state.totalPeople = 1;
        ui.peopleDisplay.textContent = "1";
        switchView("name");
    });

    // name view
    ui.btnStart.addEventListener("click", startOrder);
    ui.orderNameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") startOrder(); });

    // order view
    ui.btnBackHome.addEventListener("click", () => {
        if (confirm("Salir? Perderas el progreso de esta orden.")) _goHome();
    });
    ui.btnAddPupusa.addEventListener("click", () => addPupusaRow());
    ui.btnNext.addEventListener("click", () => nextPerson(showSummary));
    ui.btnPrev.addEventListener("click", prevPerson);

    // edit person name
    ui.btnEditName.addEventListener("click", openEditNameModal);
    ui.modalCancel.addEventListener("click", closeModal);
    ui.modalConfirm.addEventListener("click", confirmEditName);
    ui.modalOverlay.addEventListener("click", (e) => { if (e.target === ui.modalOverlay) closeModal(); });

    // summary
    ui.btnBackToOrder.addEventListener("click", () => {
        state.currentPersonIndex = state.totalPeople;
        setupPersonView(true);
        switchView("order");
    });
    ui.btnCopySummary.addEventListener("click", copySummaryToClipboard);
    ui.btnSaveOrder.addEventListener("click", () => saveOrder(_goHome));

    // saved order
    ui.btnDeleteSaved.addEventListener("click", () => deleteSavedOrder(_goHome));

    // back buttons
    document.getElementById("btn-back-name").addEventListener("click", _goHome);
    document.getElementById("btn-back-saved").addEventListener("click", _goHome);
}

init();
