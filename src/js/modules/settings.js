import { state, saveSpecialties } from './state.js';
import { showToast } from './toast.js';

let ui = {};

export function initSettings(uiRefs) {
    ui = uiRefs;
}

export function addSpecialty() {
    const name = ui.newSpecialtyInput.value.trim();
    const price = parseFloat(ui.newSpecialtyPrice.value) || 0;

    if (name && !state.specialties.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        state.specialties.push({ name, price });
        ui.newSpecialtyInput.value = "";
        ui.newSpecialtyPrice.value = "";
        saveSpecialties();
        renderSpecialtiesList();
        showToast("Especialidad agregada");
    } else if (!name) {
        showToast("Escribe un nombre");
    } else {
        showToast("Ya existe esa especialidad");
    }
}

export function removeSpecialty(name) {
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

export function renderSpecialtiesList() {
    ui.specialtiesList.innerHTML = "";
    state.specialties.forEach(s => {
        const li = document.createElement("li");
        li.className = "specialty-list-item";
        li.innerHTML = `
            <span class="specialty-name-text">${s.name}</span>
            <div class="specialty-controls">
                <div class="price-input-wrapper">
                    <span class="price-symbol">$</span>
                    <input type="number" class="price-inline-input" value="${s.price.toFixed(2)}" min="0" step="0.25" data-name="${s.name}">
                </div>
                <button class="delete-specialty" data-name="${s.name}">x</button>
            </div>
        `;
        li.querySelector(".price-inline-input").addEventListener("change", (e) => {
            updateSpecialtyPrice(s.name, e.target.value);
        });
        li.querySelector(".delete-specialty").addEventListener("click", () => {
            removeSpecialty(s.name);
        });
        ui.specialtiesList.appendChild(li);
    });
}
