// =====================================================
// mapControls.js — Kontrol tampilan peta
// Tanggung jawab: reset tampilan, cetak, toggle tile kampus,
// toggle semua marker gedung, dan transparansi overlay.
// =====================================================
import { map, upiCampusTile } from "./mapCore.js";
import { INITIAL_CENTER, INITIAL_ZOOM } from "./config.js";
import { getVisibleCategoryKeys } from "./categories.js";
import { setCategoryVisible, syncCategoryLayerInputs } from "./markerVisibility.js";

export function resetMap() {
  map.setView(INITIAL_CENTER, INITIAL_ZOOM);
}

export function printMap() {
  window.print();
}

export function toggleCampusTile(checkbox) {
  if (checkbox.checked) {
    upiCampusTile.addTo(map);
  } else {
    map.removeLayer(upiCampusTile);
  }
}

export function toggleBuildingMarkers(checkbox) {
  getVisibleCategoryKeys().forEach(function(categoryKey) {
    setCategoryVisible(categoryKey, checkbox.checked);
  });

  syncCategoryLayerInputs();
}

export function setCampusOpacity(value) {
  upiCampusTile.setOpacity(parseFloat(value));
}
