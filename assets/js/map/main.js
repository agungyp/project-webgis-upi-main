// =====================================================
// main.js — Composition root aplikasi peta
// Tanggung jawab: menyatukan semua modul, mengekspos handler ke
// window (agar atribut onclick/onchange/oninput di HTML tetap jalan),
// memasang listener global, dan menjalankan urutan inisialisasi.
// =====================================================
import { map } from "./mapCore.js";
import { renderLegendItems, toggleLegend } from "./legend.js";
import {
  renderSidebarSkeleton, showTab, toggleSidebar, updateSidebarChrome
} from "./sidebar.js";
import { searchBuilding, selectSuggestion } from "./search.js";
import { locateMe, removeUserLocation } from "./geolocation.js";
import {
  resetMap, printMap, toggleCampusTile, toggleBuildingMarkers, setCampusOpacity
} from "./mapControls.js";
import {
  toggleFilter, toggleCategoryGroup,
  toggleCategoryVisibilityFromLocations, toggleCategoryMarkers
} from "./markerVisibility.js";
import { openBuildingDetail, shareBuilding } from "./buildingDetail.js";
import {
  loadParkingGeoJson,
  toggleParkingMainGroup, toggleParkingSubGroup,
  toggleParkingVisibilityFromLocations, toggleAllParkingVisibilityFromLocations,
  focusParkingItem, toggleParkingLayer, toggleAllParkingLayers
} from "./parking.js";
import {
  loadBuildingsGeoJson, showMapLoading, retryLoadBuildings
} from "./buildingsData.js";

// ---------------------------------------------------------------
// Ekspos handler yang dipanggil dari atribut onclick/onchange/oninput
// di map.html maupun di HTML yang dihasilkan modul (innerHTML).
// ---------------------------------------------------------------
Object.assign(window, {
  // topbar & sidebar
  locateMe, removeUserLocation, resetMap, printMap, toggleSidebar, showTab, toggleLegend,
  // pencarian
  searchBuilding, selectSuggestion,
  // data gedung
  retryLoadBuildings, openBuildingDetail, shareBuilding,
  // filter & visibilitas kategori
  toggleFilter, toggleCategoryGroup, toggleCategoryVisibilityFromLocations, toggleCategoryMarkers,
  // kontrol peta / layer
  toggleCampusTile, toggleBuildingMarkers, setCampusOpacity,
  // parkir
  toggleParkingMainGroup, toggleParkingSubGroup, toggleParkingVisibilityFromLocations,
  toggleAllParkingVisibilityFromLocations, focusParkingItem, toggleParkingLayer, toggleAllParkingLayers
});

// ---------------------------------------------------------------
// Orkestrasi inisialisasi
// ---------------------------------------------------------------
async function initApp() {
  showMapLoading();
  renderSidebarSkeleton();
  await loadBuildingsGeoJson();
  loadParkingGeoJson();
}

// Legenda kategori (sekali saat load)
renderLegendItems();

// Enter pada input pencarian
document.getElementById("searchInput").addEventListener("keyup", function(e) {
  if (e.key === "Enter") searchBuilding();
});

// Sesuaikan sidebar & peta saat ukuran layar berubah
window.addEventListener("resize", function() {
  updateSidebarChrome();
  map.invalidateSize();
});

updateSidebarChrome();
initApp();
