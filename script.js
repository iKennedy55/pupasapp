// State
let state = {
    totalPeople: 1,
    currentPersonIndex: 1,
    orders: [], // [[{qty, type, dough}, ...]]
    specialties: ["Revuelta", "Frijol con Queso", "Queso sin Loroco", "Queso con Loroco", "Chicharrón", "Ayote", "Ajo", "Jamón", "Birria", "Camarón", "Pollo"],
    theme: localStorage.getItem("theme") || "light"
};

// DOM Elements
const views = {
    setup: document.getElementById("setup-view"),
    order: document.getElementById("order-view"),
    summary: document.getElementById("summary-view"),
    settings: document.getElementById("settings-view")
};

const ui = {
    peopleDisplay: document.getElementById("people-display"),
    btnStart: document.getElementById("btn-start"),
    btnNext: document.getElementById("btn-next"),
    btnAddPupusa: document.getElementById("btn-add-pupusa"),
    btnRestart: document.getElementById("btn-restart"),
    btnTheme: document.getElementById("btn-theme-toggle"),
    btnOpenSettings: document.getElementById("btn-open-settings"),
    btnCloseSettings: document.getElementById("btn-close-settings"),
    btnBackHome: document.getElementById("btn-back-home"),
    pupusasList: document.getElementById("pupusas-list"),
    personTitle: document.getElementById("person-title"),
    progressIndicator: document.getElementById("progress-indicator"),
    summaryList: document.getElementById("summary-list"),
    grandTotal: document.getElementById("grand-total"),

    // Settings
    newSpecialtyInput: document.getElementById("new-specialty-input"),
    btnAddSpecialty: document.getElementById("btn-add-specialty"),
    specialtiesList: document.getElementById("specialties-list")
};

const templates = {
    pupusaItem: document.getElementById("pupusa-item-template")
};

// Initialization
function init() {
    applyTheme(state.theme);
    updatePeopleDisplay();
    renderSpecialtiesList();

    // Listeners
    ui.btnStart.addEventListener("click", startOrder);
    ui.btnNext.addEventListener("click", nextPerson);
    ui.btnAddPupusa.addEventListener("click", () => addPupusaRow());
    ui.btnRestart.addEventListener("click", resetApp);
    ui.btnBackHome.addEventListener("click", resetApp);

    ui.btnTheme.addEventListener("click", toggleTheme);
    ui.btnOpenSettings.addEventListener("click", () => switchView('settings'));
    ui.btnCloseSettings.addEventListener("click", () => switchView('setup'));

    ui.btnAddSpecialty.addEventListener("click", addSpecialty);
}

// Logic: Setup & People Count
window.adjustPeople = function (delta) {
    let newVal = state.totalPeople + delta;
    if (newVal < 1) newVal = 1;
    if (newVal > 50) newVal = 50;
    state.totalPeople = newVal;
    updatePeopleDisplay();
};

function updatePeopleDisplay() {
    ui.peopleDisplay.textContent = state.totalPeople;
}

function startOrder() {
    state.orders = [];
    state.currentPersonIndex = 1;
    setupPersonView();
    switchView('order');
}

// Logic: Order View
function setupPersonView() {
    ui.personTitle.textContent = `Persona ${state.currentPersonIndex}`;
    ui.progressIndicator.textContent = `${state.currentPersonIndex} / ${state.totalPeople}`;
    ui.pupusasList.innerHTML = "";
    addPupusaRow();
}

function addPupusaRow() {
    const clone = templates.pupusaItem.content.cloneNode(true);
    const row = clone.querySelector(".pupusa-item");

    // Unique ID for radios
    const id = Date.now() + Math.random();
    row.querySelectorAll("input[type=radio]").forEach(r => r.name = `dough-${id}`);

    // Populate Dropdown
    const select = row.querySelector(".specialty-select");
    populateDropdown(select);

    // Remove logic
    row.querySelector(".btn-remove").addEventListener("click", () => {
        if (ui.pupusasList.children.length > 1) {
            row.remove();
        }
    });

    // Stepper Logic
    const inputQty = row.querySelector(".input-qty");
    const btnMinus = row.querySelector(".minus");
    const btnPlus = row.querySelector(".plus");

    btnMinus.onclick = () => {
        let val = parseInt(inputQty.value) || 0;
        if (val > 1) inputQty.value = val - 1;
    };

    btnPlus.onclick = () => {
        let val = parseInt(inputQty.value) || 0;
        inputQty.value = val + 1;
    };

    ui.pupusasList.appendChild(row);
}

function nextPerson() {
    // Validate
    const rows = ui.pupusasList.querySelectorAll(".pupusa-item");
    const personOrder = [];

    rows.forEach(row => {
        const qty = parseInt(row.querySelector(".input-qty").value);
        const type = row.querySelector(".specialty-select").value;
        const dough = row.querySelector("input[type=radio]:checked").value;

        personOrder.push({ qty, type, dough });
    });

    state.orders.push(personOrder);

    if (state.currentPersonIndex < state.totalPeople) {
        state.currentPersonIndex++;

        // Transition effect
        ui.pupusasList.style.opacity = "0";
        setTimeout(() => {
            setupPersonView();
            ui.pupusasList.style.opacity = "1";
        }, 200);

    } else {
        showSummary();
    }
}

// Logic: Summary
function showSummary() {
    const totals = {};
    let grandTotal = 0;

    state.orders.forEach(person => {
        person.forEach(item => {
            const key = `${item.type}|${item.dough}`;
            totals[key] = (totals[key] || 0) + item.qty;
            grandTotal += item.qty;
        });
    });

    ui.summaryList.innerHTML = "";
    Object.keys(totals).sort().forEach(key => {
        const [type, dough] = key.split("|");
        const qty = totals[key];

        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
            <span><strong>${qty}</strong> ${type} <small>(${dough})</small></span>
        `;
        ui.summaryList.appendChild(div);
    });

    ui.grandTotal.textContent = grandTotal;
    switchView('summary');
}

// Logic: Settings
function addSpecialty() {
    const val = ui.newSpecialtyInput.value.trim();
    if (val && !state.specialties.includes(val)) {
        state.specialties.push(val);
        ui.newSpecialtyInput.value = "";
        renderSpecialtiesList();
    }
}

function removeSpecialty(name) {
    state.specialties = state.specialties.filter(s => s !== name);
    renderSpecialtiesList();
}

function renderSpecialtiesList() {
    ui.specialtiesList.innerHTML = "";
    state.specialties.forEach(s => {
        const li = document.createElement("li");
        li.className = "specialty-list-item";
        li.innerHTML = `
            <span>${s}</span>
            <button class="delete-specialty" onclick="removeSpecialty('${s}')">Eliminar</button>
        `;
        ui.specialtiesList.appendChild(li);
    });
}

function populateDropdown(selectElement) {
    selectElement.innerHTML = "";
    state.specialties.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        selectElement.appendChild(opt);
    });
}

// Utils
function switchView(viewName) {
    Object.values(views).forEach(el => {
        el.classList.remove("active");
        el.classList.add("hidden");
    });

    // Small delay to allow 'hidden' to take effect before removing it for fade in
    requestAnimationFrame(() => {
        const target = views[viewName];
        target.classList.remove("hidden");
        // Force reflow
        void target.offsetWidth;
        target.classList.add("active");
    });
}

function resetApp() {
    switchView('setup');
    state.totalPeople = 1;
    updatePeopleDisplay();
}

// Themes
function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", state.theme);
    applyTheme(state.theme);
}

function applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);

    // Icon Logic
    const icon = themeName === "light"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` // Moon
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`; // Sun

    ui.btnTheme.innerHTML = icon;
}

// Expose globals for onclick handlers in HTML
window.removeSpecialty = removeSpecialty;

init();
