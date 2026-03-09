import { state } from './state.js';
import { switchView } from './views.js';
import { showToast } from './toast.js';

let ui = {};
let templates = {};

export function initOrder(uiRefs, templateRefs) {
    ui = uiRefs;
    templates = templateRefs;
}

export function startOrder() {
    const name = ui.orderNameInput.value.trim() || "Orden " + (state.savedOrders.length + 1);
    state.orderName = name;
    state.currentOrderId = Date.now();
    state.orders = [];
    state.personNames = Array.from({ length: state.totalPeople }, (_, i) => `Persona ${i + 1}`);
    state.personNotes = Array.from({ length: state.totalPeople }, () => "");
    state.currentPersonIndex = 1;
    state.sessionMode = 'new';

    setupPersonView();
    switchView("order");
}

export function setupPersonView(restore = false) {
    const idx = state.currentPersonIndex - 1;
    ui.personTitle.textContent = state.personNames[idx];
    ui.progressIndicator.textContent = `${state.currentPersonIndex} / ${state.totalPeople}`;

    ui.btnPrev.style.display = state.currentPersonIndex > 1 ? "inline-flex" : "none";
    ui.btnNext.textContent = state.currentPersonIndex < state.totalPeople ? "Siguiente ->" : "Ver Resumen ->";

    ui.personNote.value = state.personNotes[idx] || "";

    ui.pupusasList.innerHTML = "";
    if (restore && state.orders[idx] && state.orders[idx].length > 0) {
        state.orders[idx].forEach(item => addPupusaRow(item));
    } else {
        addPupusaRow();
    }
}

export function addPupusaRow(existingItem = null) {
    const clone = templates.pupusaItem.content.cloneNode(true);
    const row = clone.querySelector(".pupusa-item");

    const id = Date.now() + Math.random();
    row.querySelectorAll("input[type=radio]").forEach(r => r.name = `dough-${id}`);

    const select = row.querySelector(".specialty-select");
    populateDropdown(select);

    if (existingItem) {
        select.value = existingItem.type;
        row.querySelectorAll("input[type=radio]").forEach(r => {
            r.checked = r.value === existingItem.dough;
        });
        row.querySelector(".input-qty").value = existingItem.qty;
    }

    row.querySelector(".btn-remove").addEventListener("click", () => {
        if (ui.pupusasList.children.length > 1) row.remove();
    });

    const inputQty = row.querySelector(".input-qty");
    row.querySelector(".minus").onclick = () => {
        let val = parseInt(inputQty.value) || 0;
        if (val > 1) inputQty.value = val - 1;
    };
    row.querySelector(".plus").onclick = () => {
        let val = parseInt(inputQty.value) || 0;
        inputQty.value = val + 1;
    };

    ui.pupusasList.appendChild(row);
}

export function collectCurrentPerson() {
    const rows = ui.pupusasList.querySelectorAll(".pupusa-item");
    const idx = state.currentPersonIndex - 1;
    const personOrder = [];

    rows.forEach(row => {
        const qty = parseInt(row.querySelector(".input-qty").value) || 1;
        const type = row.querySelector(".specialty-select").value;
        const dough = row.querySelector("input[type=radio]:checked")?.value || "Maiz";
        personOrder.push({ qty, type, dough });
    });

    state.orders[idx] = personOrder;
    state.personNotes[idx] = ui.personNote.value.trim();
}

export function nextPerson(showSummary) {
    collectCurrentPerson();
    if (state.currentPersonIndex < state.totalPeople) {
        state.currentPersonIndex++;
        animateTransition(() => setupPersonView(true));
    } else {
        showSummary();
    }
}

export function prevPerson() {
    collectCurrentPerson();
    if (state.currentPersonIndex > 1) {
        state.currentPersonIndex--;
        animateTransition(() => setupPersonView(true));
    }
}

function animateTransition(fn) {
    ui.pupusasList.style.opacity = "0";
    ui.pupusasList.style.transform = "translateY(8px)";
    setTimeout(() => {
        fn();
        ui.pupusasList.style.opacity = "1";
        ui.pupusasList.style.transform = "translateY(0)";
    }, 180);
}

// modal
export function openEditNameModal() {
    const idx = state.currentPersonIndex - 1;
    ui.modalNameInput.value = state.personNames[idx];
    ui.modalOverlay.classList.remove("hidden");
    ui.modalOverlay.classList.add("active");
    setTimeout(() => ui.modalNameInput.focus(), 100);
    ui.modalNameInput.onkeydown = (e) => { if (e.key === "Enter") confirmEditName(); };
}

export function closeModal() {
    ui.modalOverlay.classList.add("hidden");
    ui.modalOverlay.classList.remove("active");
}

export function confirmEditName() {
    const val = ui.modalNameInput.value.trim();
    const idx = state.currentPersonIndex - 1;
    if (val) {
        state.personNames[idx] = val;
        ui.personTitle.textContent = val;
    }
    closeModal();
}

export function editSavedOrder(index) {
    const order = state.savedOrders[index];
    state.currentOrderId = order.id;
    state.orderName = order.name;
    state.totalPeople = order.totalPeople;
    state.personNames = [...order.personNames];
    state.personNotes = [...order.personNotes];
    state.orders = JSON.parse(JSON.stringify(order.orders));
    state.currentPersonIndex = 1;
    state.sessionMode = 'edit';
    state.editingOrderIndex = index;

    setupPersonView(true);
    switchView("order");
}

function populateDropdown(selectElement) {
    selectElement.innerHTML = "";
    state.specialties.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.name;
        opt.textContent = s.name;
        selectElement.appendChild(opt);
    });
}
