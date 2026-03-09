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
        try { return JSON.parse(saved); }
        catch (e) { /* corrupted */ }
    }
    return DEFAULT_SPECIALTIES.map(s => ({ ...s }));
}

function loadSavedOrders() {
    const saved = localStorage.getItem("savedOrders");
    if (saved) {
        try { return JSON.parse(saved); }
        catch (e) { /* corrupted */ }
    }
    return [];
}

export const state = {
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

export function saveSpecialties() {
    localStorage.setItem("specialties", JSON.stringify(state.specialties));
}

export function persistSavedOrders() {
    localStorage.setItem("savedOrders", JSON.stringify(state.savedOrders));
}
