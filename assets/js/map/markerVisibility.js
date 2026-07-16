// =====================================================
// markerVisibility.js — Visibilitas marker gedung
// Tanggung jawab: mengatur marker mana yang tampil di peta
// berdasarkan filter kategori (chips) + toggle show/hide kategori,
// serta menyinkronkan input checkbox di tab Layer.
// =====================================================
import { buildingClusterGroup } from "./mapCore.js";
import { buildingMarkers, categoryVisibility, categoryPanelState, activeFilters } from "./state.js";
import { getVisibleCategoryKeys } from "./categories.js";
import { renderLocations } from "./sidebar.js";

export function toggleFilter(categoryKey) {
  if (categoryKey === "all") {
    activeFilters.clear();
  } else if (activeFilters.has(categoryKey)) {
    activeFilters.delete(categoryKey);
  } else {
    activeFilters.add(categoryKey);
  }
  syncMarkersToFilter();
  renderLocations();
}

export function syncMarkersToFilter() {
  buildingMarkers.forEach(function(marker) {
    var key = marker.categoryKey;
    var passesFilter = activeFilters.size === 0 || activeFilters.has(key);
    var categoryAllowed = categoryVisibility[key] !== false;
    if (passesFilter && categoryAllowed) {
      if (!buildingClusterGroup.hasLayer(marker)) buildingClusterGroup.addLayer(marker);
    } else {
      if (buildingClusterGroup.hasLayer(marker)) buildingClusterGroup.removeLayer(marker);
    }
  });
}

export function toggleCategoryGroup(categoryKey) {
  categoryPanelState[categoryKey] = categoryPanelState[categoryKey] === false;
  renderLocations();
}

export function setCategoryVisible(categoryKey, visible) {
  categoryVisibility[categoryKey] = visible;
  syncMarkersToFilter();
}

export function syncCategoryLayerInputs() {
  const allToggle = document.getElementById("allMarkersToggle");
  const categoryToggles = document.querySelectorAll("[data-category-toggle]");
  const visibleKeys = getVisibleCategoryKeys();

  categoryToggles.forEach(function(input) {
    const categoryKey = input.getAttribute("data-category-toggle");
    input.checked = categoryVisibility[categoryKey] !== false;
  });

  if (allToggle) {
    allToggle.checked = visibleKeys.every(function(categoryKey) {
      return categoryVisibility[categoryKey] !== false;
    });
  }
}

export function toggleCategoryMarkers(categoryKey, checkbox) {
  setCategoryVisible(categoryKey, checkbox.checked);
  syncCategoryLayerInputs();
}

export function toggleCategoryVisibilityFromLocations(categoryKey) {
  const nextVisible = categoryVisibility[categoryKey] === false;

  setCategoryVisible(categoryKey, nextVisible);
  syncCategoryLayerInputs();
  renderLocations();
}
