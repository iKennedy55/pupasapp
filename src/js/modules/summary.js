import { state, persistSavedOrders } from './state.js';
import { switchView } from './views.js';
import { showToast } from './toast.js';

let ui = {};

export function initSummary(uiRefs) {
    ui = uiRefs;
}

export function calcPersonSubtotal(personOrder) {
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

export function showSummary() {
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

    // totals
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

export function copySummaryToClipboard() {
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

export function saveOrder(goHomeFn) {
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
        showToast("Orden guardada");
    }

    persistSavedOrders();
    goHomeFn();
}

export function viewSavedOrder(index) {
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

export function deleteSavedOrder(goHomeFn) {
    const index = state._viewingOrderIndex;
    if (index === undefined) return;
    if (!confirm("Eliminar esta orden?")) return;

    state.savedOrders.splice(index, 1);
    persistSavedOrders();
    showToast("Orden eliminada");
    goHomeFn();
}
