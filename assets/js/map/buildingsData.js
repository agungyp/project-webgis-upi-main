// =====================================================
// buildingsData.js — Pemuatan data gedung dari GeoJSON
// Tanggung jawab: fetch & parse gedung, membuat marker,
// mengelola overlay loading/error + retry, dan deep-link ?building=.
// =====================================================
import { buildingClusterGroup } from "./mapCore.js";
import {
  buildings, buildingMarkers,
  categoryPanelState, categoryVisibility
} from "./state.js";
import {
  getIconByCategory, getCategoryKeyByBuilding, getVisibleCategoryKeys
} from "./categories.js";
import { openBuildingDetail, focusBuildingByName } from "./buildingDetail.js";
import { renderActiveSidebarTab } from "./sidebar.js";
import { initSearchAutocomplete } from "./search.js";

export function showMapLoading() {
  var ov = document.getElementById("mapLoadingOverlay");
  if (ov) ov.style.display = "flex";
}
export function hideMapLoading() {
  var ov = document.getElementById("mapLoadingOverlay");
  if (ov) ov.style.display = "none";
}
export function showMapError(msg) {
  var ov = document.getElementById("mapErrorOverlay");
  var txt = document.getElementById("mapErrorText");
  if (txt && msg) txt.textContent = msg;
  if (ov) ov.style.display = "flex";
}
export function hideMapError() {
  var ov = document.getElementById("mapErrorOverlay");
  if (ov) ov.style.display = "none";
}

export async function loadBuildingsGeoJson() {
  try {
    const response = await fetch("data/gedung-upi-point.geojson");
    if (!response.ok) throw new Error("GeoJSON tidak dapat dimuat");
    const data = await response.json();

    const parsed = data.features
      .filter(function(f) { return f.geometry && f.geometry.type === "Point"; })
      .map(function(f) {
        var p = f.properties || {};
        var coords = f.geometry.coordinates;
        return {
          name:        p.name        || p.Nama        || "Tidak diketahui",
          category:    p.category    || p.Kategori    || "Fasilitas",
          description: p.description || p.Deskripsi   || "",
          image:       p.image       || (p.Gambar ? p.Gambar + ".jpg" : "images/banner.png"),
          hours:       p.hours       || "",
          floors:      p.floors      || null,
          phone:       p.phone       || "",
          facilities:  p.facilities  || [],
          linkWeb:     p.LinkWeb     || p.linkWeb     || null,
          coords:      [coords[1], coords[0]]
        };
      });

    // Mutasi in-place agar binding `buildings` tetap valid di modul lain
    buildings.length = 0;
    parsed.forEach(function(b) { buildings.push(b); });

    getVisibleCategoryKeys().forEach(function(categoryKey) {
      if (categoryPanelState[categoryKey] === undefined) {
        categoryPanelState[categoryKey] = true;
      }
      if (categoryVisibility[categoryKey] === undefined) {
        categoryVisibility[categoryKey] = true;
      }
    });

    buildings.forEach(function(building) {
      var marker = L.marker(building.coords, {
        icon: getIconByCategory(building.category, building.name)
      });

      marker.on("click", function() {
        openBuildingDetail(building.name);
      });

      marker.buildingData = building;
      marker.categoryKey = getCategoryKeyByBuilding(building);
      buildingMarkers.push(marker);
      buildingClusterGroup.addLayer(marker);
    });

    handleUrlBuildingParam();
    renderActiveSidebarTab();
    initSearchAutocomplete();

    hideMapLoading();

  } catch (err) {
    console.error("Gagal memuat data gedung:", err);
    hideMapLoading();
    showMapError(err && err.message ? err.message : "Periksa koneksi internet Anda lalu coba lagi.");
  }
}

export function retryLoadBuildings() {
  hideMapError();
  showMapLoading();
  // Reset state
  buildingMarkers.forEach(function(m) {
    if (buildingClusterGroup.hasLayer(m)) buildingClusterGroup.removeLayer(m);
  });
  buildingMarkers.length = 0;
  buildings.length = 0;
  loadBuildingsGeoJson();
}

export function handleUrlBuildingParam() {
  var params = new URLSearchParams(window.location.search);
  var buildingName = params.get("building");
  if (buildingName) {
    setTimeout(function() {
      focusBuildingByName(decodeURIComponent(buildingName));
    }, 600);
  }
}
