const DEFAULT_SPECIALTIES = [
    { name: "Revuelta", price: 1.25 },
    { name: "Frijol con Queso", price: 1.25 },
    { name: "Chicharron con queso", price: 1.25 },
    { name: "Queso sin Loroco", price: 1.25 },
    { name: "Queso con Loroco", price: 1.25 },
    { name: "Chicharron", price: 1.25 },
    { name: "Ayote", price: 1.25 },
    { name: "Ajo", price: 1.25 },
    { name: "Jamon", price: 1.25 },
    { name: "Birria", price: 1.25 },
    { name: "Camaron", price: 1.25 },
    { name: "Pollo", price: 1.25 },
    { name: "Jalapeno", price: 1.25 },
];

function loadSpecialties() {
    const saved = localStorage.getItem("specialties");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.warn("Specialties corrupted in localStorage, resetting.");
            localStorage.removeItem("specialties");
        }
    }
    return DEFAULT_SPECIALTIES.map(s => ({ ...s }));
}

function loadSavedOrders() {
    const saved = localStorage.getItem("savedOrders");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.warn("SavedOrders corrupted in localStorage, resetting.");
            localStorage.removeItem("savedOrders");
        }
    }
    return [];
}

const state = {
    specialties: loadSpecialties(),
    currentOrderId: null,
    orderName: "",
    totalPeople: 1,
    currentPersonIndex: 1,
    personNames: [],
    personNotes: [],
    orders: [],
    savedOrders: loadSavedOrders(),
    sessionMode: 'new',
    editingOrderIndex: null,
    _settingsReturnView: null,
    _viewingOrderIndex: null,
};

function saveSpecialties() {
    localStorage.setItem("specialties", JSON.stringify(state.specialties));
}

function persistSavedOrders() {
    localStorage.setItem("savedOrders", JSON.stringify(state.savedOrders));
}

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
    toast: document.getElementById("toast"),
};

const templates = {
    pupusaItem: document.getElementById("pupusa-item-template"),
};

let _currentView = "home";

function currentViewName() {
    return _currentView;
}

function switchView(viewName) {
    _currentView = viewName;
    Object.keys(views).forEach(name => {
        const el = views[name];
        if (!el) return;
        if (name === viewName) {
            el.classList.remove("hidden");
            el.classList.add("active");
        } else {
            el.classList.remove("active");
            el.classList.add("hidden");
        }
    });
}

function goHome() {
    renderOrdersHistory();
    switchView("home");
}

window.goHome = goHome;
window.adjustPeople = function (delta) {
    let val = state.totalPeople + delta;
    if (val < 1) val = 1;
    if (val > 50) val = 50;
    state.totalPeople = val;
    ui.peopleDisplay.textContent = val;
};

let _toastTimeout;
function showToast(msg) {
    clearTimeout(_toastTimeout);
    ui.toast.textContent = msg;
    ui.toast.classList.remove("hidden");
    ui.toast.classList.add("show");
    _toastTimeout = setTimeout(() => {
        ui.toast.classList.remove("show");
        setTimeout(() => ui.toast.classList.add("hidden"), 300);
    }, 2200);
}

function startOrder() {
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

function setupPersonView(restore = false) {
    const idx = state.currentPersonIndex - 1;
    ui.personTitle.textContent = state.personNames[idx];
    ui.progressIndicator.textContent = `${state.currentPersonIndex} / ${state.totalPeople}`;

    ui.btnPrev.style.display = state.currentPersonIndex > 1 ? "inline-flex" : "none";
    const iconRight = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
    ui.btnNext.innerHTML = state.currentPersonIndex < state.totalPeople ? `Siguiente ${iconRight}` : `Ver Resumen ${iconRight}`;

    ui.personNote.value = state.personNotes[idx] || "";

    ui.pupusasList.innerHTML = "";
    if (restore && state.orders[idx] && state.orders[idx].length > 0) {
        state.orders[idx].forEach(item => addPupusaRow(item));
    } else {
        addPupusaRow();
    }
}

function addPupusaRow(existingItem = null) {
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
        if (val < 99) inputQty.value = val + 1;
    };

    ui.pupusasList.appendChild(row);
}

function collectCurrentPerson() {
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

function nextPerson() {
    collectCurrentPerson();
    if (state.currentPersonIndex < state.totalPeople) {
        state.currentPersonIndex++;
        animateTransition(() => setupPersonView(true));
    } else {
        showSummary();
    }
}

function prevPerson() {
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

function openEditNameModal() {
    const idx = state.currentPersonIndex - 1;
    ui.modalNameInput.value = state.personNames[idx];
    ui.modalOverlay.classList.remove("hidden");
    ui.modalOverlay.classList.add("active");
    setTimeout(() => ui.modalNameInput.focus(), 100);
    ui.modalNameInput.onkeydown = (e) => { if (e.key === "Enter") confirmEditName(); };
}

function closeModal() {
    ui.modalOverlay.classList.add("hidden");
    ui.modalOverlay.classList.remove("active");
}

function confirmEditName() {
    const val = ui.modalNameInput.value.trim();
    const idx = state.currentPersonIndex - 1;
    if (val) {
        state.personNames[idx] = val;
        ui.personTitle.textContent = val;
    }
    closeModal();
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

function editSavedOrder(index) {
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

function calcPersonSubtotal(personOrder) {
    let subtotal = 0;
    let hasPrice = false;
    if (!personOrder) return { subtotal: 0, hasPrice: false };
    personOrder.forEach(item => {
        const sp = state.specialties.find(s => s.name === item.type);
        if (sp && sp.price > 0) {
            subtotal += sp.price * item.qty;
            hasPrice = true;
        }
    });
    return { subtotal, hasPrice };
}

function showSummary() {
    ui.summaryOrderTitle.textContent = state.orderName;
    renderSummary();
    switchView("summary");
}

function renderSummary() {
    ui.summaryByPerson.innerHTML = "";

    state.orders.forEach((personOrder, idx) => {
        if (!personOrder || personOrder.length === 0) return;

        const section = document.createElement("div");
        section.className = "summary-person-section";

        const headerRow = document.createElement("div");
        headerRow.className = "summary-person-header";

        const nameEl = document.createElement("p");
        nameEl.className = "summary-person-name";
        nameEl.textContent = state.personNames[idx];
        headerRow.appendChild(nameEl);

        const { subtotal, hasPrice } = calcPersonSubtotal(personOrder);
        if (hasPrice) {
            const subtotalEl = document.createElement("span");
            subtotalEl.className = "summary-person-subtotal";
            subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            headerRow.appendChild(subtotalEl);
        }

        section.appendChild(headerRow);

        personOrder.forEach(item => {
            const sp = state.specialties.find(s => s.name === item.type);
            const itemPrice = sp && sp.price > 0 ? `$${(sp.price * item.qty).toFixed(2)}` : "";
            const row = document.createElement("div");
            row.className = "summary-person-item";
            row.innerHTML = `
                <span class="qty-pill">${item.qty}</span>
                <span class="person-item-name">${item.type} <small>(${item.dough})</small></span>
                ${itemPrice ? `<span class="person-item-price">${itemPrice}</span>` : ""}
            `;
            section.appendChild(row);
        });

        const note = state.personNotes[idx];
        if (note) {
            const noteEl = document.createElement("p");
            noteEl.className = "summary-note";
            noteEl.innerHTML = `Nota: ${note}`;
            section.appendChild(noteEl);
        }

        ui.summaryByPerson.appendChild(section);
    });

    const totals = {};
    let grandTotal = 0;
    let grandMoney = 0;
    let hasPrices = false;

    state.orders.forEach(personOrder => {
        if (!personOrder) return;
        personOrder.forEach(item => {
            const key = `${item.type}|${item.dough}`;
            totals[key] = (totals[key] || 0) + item.qty;
            grandTotal += item.qty;
            const sp = state.specialties.find(s => s.name === item.type);
            if (sp && sp.price > 0) { grandMoney += sp.price * item.qty; hasPrices = true; }
        });
    });

    ui.summaryTotals.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.className = "section-label";
    h3.textContent = "Total por Tipo";
    ui.summaryTotals.appendChild(h3);

    Object.keys(totals).sort().forEach(key => {
        const [type, dough] = key.split("|");
        const qty = totals[key];
        const sp = state.specialties.find(s => s.name === type);
        const priceStr = sp && sp.price > 0 ? `$${(sp.price * qty).toFixed(2)}` : "";
        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
            <span><strong>${qty}</strong> ${type} <small>(${dough})</small></span>
            ${priceStr ? `<span class="summary-price">${priceStr}</span>` : ""}
        `;
        ui.summaryTotals.appendChild(div);
    });

    ui.grandTotal.textContent = grandTotal;

    if (hasPrices) {
        ui.moneyTotalRow.style.display = "flex";
        ui.grandMoney.textContent = `$${grandMoney.toFixed(2)}`;
    } else {
        ui.moneyTotalRow.style.display = "none";
    }
}

function copySummaryToClipboard() {
    let text = `${state.orderName}\n`;
    text += `${"-".repeat(25)}\n`;

    let grandTotal = 0;
    let grandMoney = 0;
    let hasPrices = false;
    const totals = {};

    state.orders.forEach((personOrder, idx) => {
        if (!personOrder || personOrder.length === 0) return;

        const { subtotal, hasPrice } = calcPersonSubtotal(personOrder);
        const personLabel = hasPrice
            ? `${state.personNames[idx]} - $${subtotal.toFixed(2)}`
            : `${state.personNames[idx]}`;

        text += `\n${personLabel}\n`;
        personOrder.forEach(item => {
            const sp = state.specialties.find(s => s.name === item.type);
            const itemPrice = sp && sp.price > 0 ? ` ($${(sp.price * item.qty).toFixed(2)})` : "";
            text += `  - ${item.qty}x ${item.type} (${item.dough})${itemPrice}\n`;

            const key = `${item.type} (${item.dough})`;
            totals[key] = (totals[key] || 0) + item.qty;
            grandTotal += item.qty;
            if (sp && sp.price > 0) { grandMoney += sp.price * item.qty; hasPrices = true; }
        });
        if (state.personNotes[idx]) text += `  Nota: ${state.personNotes[idx]}\n`;
    });

    text += `\n${"-".repeat(25)}\n`;
    text += `Totales:\n`;
    Object.keys(totals).sort().forEach(key => { text += `  - ${totals[key]}x ${key}\n`; });
    text += `\nTotal: ${grandTotal} pupusas`;
    if (hasPrices) text += ` - $${grandMoney.toFixed(2)} total`;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Copiado al portapapeles");
    }).catch(() => {
        showToast("No se pudo copiar");
    });
}

function saveOrder() {
    const orderData = {
        id: state.currentOrderId || Date.now(),
        name: state.orderName,
        date: new Date().toISOString(),
        totalPeople: state.totalPeople,
        personNames: [...state.personNames],
        personNotes: [...state.personNotes],
        orders: JSON.parse(JSON.stringify(state.orders)),
    };

    if (state.sessionMode === 'edit' && state.editingOrderIndex !== null) {
        state.savedOrders[state.editingOrderIndex] = orderData;
        showToast("Orden actualizada");
    } else {
        state.savedOrders.unshift(orderData);
        if (state.savedOrders.length > 50) {
            state.savedOrders = state.savedOrders.slice(0, 50);
        }
        showToast("Orden guardada");
    }

    persistSavedOrders();
    goHome();
}

function viewSavedOrder(index) {
    const order = state.savedOrders[index];
    state._viewingOrderIndex = index;

    ui.savedOrderTitle.textContent = order.name;
    const date = new Date(order.date);
    ui.savedOrderDate.textContent = date.toLocaleDateString("es-SV", {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    });

    ui.savedOrderContent.innerHTML = "";

    order.orders.forEach((personOrder, idx) => {
        if (!personOrder || personOrder.length === 0) return;
        const section = document.createElement("div");
        section.className = "summary-person-section";

        const headerRow = document.createElement("div");
        headerRow.className = "summary-person-header";

        const nameEl = document.createElement("p");
        nameEl.className = "summary-person-name";
        nameEl.textContent = order.personNames[idx];
        headerRow.appendChild(nameEl);

        const { subtotal, hasPrice } = calcPersonSubtotal(personOrder);
        if (hasPrice) {
            const subtotalEl = document.createElement("span");
            subtotalEl.className = "summary-person-subtotal";
            subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            headerRow.appendChild(subtotalEl);
        }
        section.appendChild(headerRow);

        personOrder.forEach(item => {
            const sp = state.specialties.find(s => s.name === item.type);
            const itemPrice = sp && sp.price > 0 ? `$${(sp.price * item.qty).toFixed(2)}` : "";
            const row = document.createElement("div");
            row.className = "summary-person-item";
            row.innerHTML = `
                <span class="qty-pill">${item.qty}</span>
                <span class="person-item-name">${item.type} <small>(${item.dough})</small></span>
                ${itemPrice ? `<span class="person-item-price">${itemPrice}</span>` : ""}
            `;
            section.appendChild(row);
        });

        const note = order.personNotes[idx];
        if (note) {
            const noteEl = document.createElement("p");
            noteEl.className = "summary-note";
            noteEl.innerHTML = `Nota: ${note}`;
            section.appendChild(noteEl);
        }

        ui.savedOrderContent.appendChild(section);
    });

    // totals
    const totals = {};
    let grandTotal = 0;
    let grandMoney = 0;
    let hasPrices = false;

    order.orders.forEach(personOrder => {
        if (!personOrder) return;
        personOrder.forEach(item => {
            const key = `${item.type}|${item.dough}`;
            totals[key] = (totals[key] || 0) + item.qty;
            grandTotal += item.qty;
            const sp = state.specialties.find(s => s.name === item.type);
            if (sp && sp.price > 0) { grandMoney += sp.price * item.qty; hasPrices = true; }
        });
    });

    const divider = document.createElement("div");
    divider.className = "summary-divider";
    ui.savedOrderContent.appendChild(divider);

    const totalSection = document.createElement("div");
    totalSection.className = "summary-totals";
    const h3 = document.createElement("h3");
    h3.className = "section-label";
    h3.textContent = "Total por Tipo";
    totalSection.appendChild(h3);

    Object.keys(totals).sort().forEach(key => {
        const [type, dough] = key.split("|");
        const qty = totals[key];
        const sp = state.specialties.find(s => s.name === type);
        const priceStr = sp && sp.price > 0 ? `$${(sp.price * qty).toFixed(2)}` : "";
        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `<span><strong>${qty}</strong> ${type} <small>(${dough})</small></span>${priceStr ? `<span class="summary-price">${priceStr}</span>` : ""}`;
        totalSection.appendChild(div);
    });

    ui.savedOrderContent.appendChild(totalSection);

    const totalRow = document.createElement("div");
    totalRow.className = "total-row grand-total-row";
    totalRow.innerHTML = `<span class="total-label">Total Pupusas</span><span class="big-number">${grandTotal}</span>`;
    ui.savedOrderContent.appendChild(totalRow);

    if (hasPrices) {
        const moneyRow = document.createElement("div");
        moneyRow.className = "total-row money-total-row";
        moneyRow.innerHTML = `<span class="total-label">Total Estimado</span><span class="big-number money-big">$${grandMoney.toFixed(2)}</span>`;
        ui.savedOrderContent.appendChild(moneyRow);
    }

    switchView("savedOrder");
}

function deleteSavedOrder() {
    const index = state._viewingOrderIndex;
    if (index === undefined) return;
    if (!confirm("Eliminar esta orden?")) return;

    state.savedOrders.splice(index, 1);
    persistSavedOrders();
    showToast("Orden eliminada");
    goHome();
}

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

function addSpecialty() {
    const name = ui.newSpecialtyInput.value.trim();
    const priceStr = String(ui.newSpecialtyPrice.value).replace(/[^0-9]/g, '');
    const price = priceStr ? parseInt(priceStr) / 100 : 0;

    if (!name) {
        showToast("Escribe un nombre");
        return;
    }

    const existing = state.specialties.find(s => s.name.toLowerCase() === name.toLowerCase());

    if (existing) {
        existing.price = price;
        saveSpecialties();
        renderSpecialtiesList();
        ui.newSpecialtyInput.value = "";
        ui.newSpecialtyPrice.value = "";
        showToast("Precio actualizado");
    } else {
        state.specialties.push({ name, price });
        saveSpecialties();
        renderSpecialtiesList();
        ui.newSpecialtyInput.value = "";
        ui.newSpecialtyPrice.value = "";
        showToast("Especialidad agregada");
    }
}

function removeSpecialty(name) {
    state.specialties = state.specialties.filter(s => s.name !== name);
    saveSpecialties();
    renderSpecialtiesList();
}

function updateSpecialtyPrice(name, newPrice) {
    const sp = state.specialties.find(s => s.name === name);
    if (sp) {
        sp.price = parseFloat(newPrice) || 0;
        saveSpecialties();
    }
}

function renderSpecialtiesList() {
    ui.specialtiesList.innerHTML = "";
    state.specialties.forEach(s => {
        const li = document.createElement("li");
        li.className = "specialty-list-item";
        li.innerHTML = `
            <span class="specialty-name-text">${s.name}</span>
            <div class="specialty-controls">
                <div class="price-input-wrapper">
                    <span class="price-symbol">$</span>
                    <input type="text" inputmode="numeric" class="price-inline-input" value="${s.price.toFixed(2)}" data-name="${s.name}">
                </div>
                <button class="delete-specialty" data-name="${s.name}">x</button>
            </div>
        `;
        const priceInput = li.querySelector(".price-inline-input");
        priceInput.addEventListener("input", (e) => {
            let val = String(e.target.value).replace(/[^0-9]/g, '');
            if (!val) {
                e.target.value = "";
                updateSpecialtyPrice(s.name, 0);
                return;
            }
            let cents = parseInt(val) || 0;
            if (cents > 1000) cents = 1000;
            const formatted = (cents / 100).toFixed(2);
            e.target.value = formatted;
            updateSpecialtyPrice(s.name, cents / 100);
        });
        li.querySelector(".delete-specialty").addEventListener("click", () => {
            removeSpecialty(s.name);
        });
        ui.specialtiesList.appendChild(li);
    });
}

function init() {
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
    ui.newSpecialtyPrice.addEventListener("input", (e) => {
        let val = String(e.target.value).replace(/[^0-9]/g, '');
        if (!val) {
            e.target.value = "";
            return;
        }
        let cents = parseInt(val) || 0;
        if (cents > 1000) cents = 1000;
        e.target.value = (cents / 100).toFixed(2);
    });

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
        if (confirm("Salir? Perderas el progreso de esta orden.")) goHome();
    });
    ui.btnAddPupusa.addEventListener("click", () => addPupusaRow());
    ui.btnNext.addEventListener("click", nextPerson);
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
    ui.btnSaveOrder.addEventListener("click", saveOrder);

    // saved order
    ui.btnDeleteSaved.addEventListener("click", deleteSavedOrder);

    // back buttons from HTML
    const backNameBtn = document.getElementById("btn-back-name");
    if (backNameBtn) backNameBtn.addEventListener("click", goHome);

    const backSavedBtn = document.getElementById("btn-back-saved");
    if (backSavedBtn) backSavedBtn.addEventListener("click", goHome);
}

init();
