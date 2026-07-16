// =====================================================
// state.js — State runtime bersama antar-modul
// Tanggung jawab: menyimpan state aplikasi yang dipakai lintas fitur.
// Semua array/objek/Set di sini dimutasi IN-PLACE (tidak di-reassign)
// agar binding ES Module tetap valid di seluruh importer.
// =====================================================
export const buildings = [];
export const buildingMarkers = [];
export const parkingItems = [];

export const parkingVisibility = {
  car: true,
  motor: true
};

export const parkingPanelState = {
  main: true,
  car: true,
  motor: true
};

export const categoryPanelState = {};
export const categoryVisibility = {};
export const activeFilters = new Set(); // filter multi-select kategori di sidebar
