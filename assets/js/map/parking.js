// =====================================================
// parking.js — Fitur layer parkiran (mobil & motor)
// Tanggung jawab: memuat GeoJSON parkir, menggambar area + pola arsir,
// merender daftar/kontrol parkir di sidebar, dan toggle visibilitasnya.
// =====================================================
import { map, parkingRenderer, parkingLayerGroup } from "./mapCore.js";
import { parkingItems, parkingVisibility, parkingPanelState } from "./state.js";
import { renderLocations, renderActiveSidebarTab, closeSidebar } from "./sidebar.js";

export const parkingTypeStyles = {
  car: {
    key: "car",
    label: "Parkiran Mobil",
    fillColor: "#6b7280",
    hatchColor: "#374151",
    borderColor: "#374151",
    patternId: "parking-car-hatch",
    file: "data/parkiran-mobil.geojson"
  },
  motor: {
    key: "motor",
    label: "Parkiran Motor",
    fillColor: "#facc15",
    hatchColor: "#92400e",
    borderColor: "#a16207",
    patternId: "parking-motor-hatch",
    file: "data/parkiran-motor.geojson"
  }
};

function getParkingTypeFromFeature(feature, fallbackType) {
  const properties = feature.properties || {};
  const value = `${properties.jenis_parkir || properties.jenis || properties.tipe || properties.type || properties.name || ""}`.toLowerCase();

  if (value.includes("motor")) {
    return "motor";
  }

  if (value.includes("mobil") || value.includes("car")) {
    return "car";
  }

  return fallbackType;
}

function getParkingTypeConfig(type) {
  return parkingTypeStyles[type] || parkingTypeStyles.car;
}

function injectParkingHatchPatterns() {
  const svg = parkingRenderer && parkingRenderer._container;

  if (!svg || svg.querySelector("#parking-car-hatch")) {
    return;
  }

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <pattern id="parking-car-hatch" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M-2,8 L8,-2 M0,10 L10,0" stroke="#374151" stroke-width="1.4" opacity="0.7"></path>
    </pattern>
    <pattern id="parking-motor-hatch" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M-2,8 L8,-2 M0,10 L10,0" stroke="#92400e" stroke-width="1.4" opacity="0.75"></path>
    </pattern>
  `;

  svg.prepend(defs);
}

function getParkingBaseStyle(feature) {
  const type = getParkingTypeFromFeature(feature, "car");
  const config = getParkingTypeConfig(type);

  return {
    color: config.borderColor,
    weight: 2,
    opacity: 0.95,
    fillColor: config.fillColor,
    fillOpacity: 0.5
  };
}

function getParkingHatchStyle(feature) {
  const type = getParkingTypeFromFeature(feature, "car");
  const config = getParkingTypeConfig(type);

  return {
    color: "transparent",
    weight: 0,
    fillColor: `url(#${config.patternId})`,
    fillOpacity: 1,
    opacity: 1
  };
}

function getParkingTitle(feature, type, index) {
  const properties = feature.properties || {};
  const config = getParkingTypeConfig(type);

  return properties.nama || properties.name || `${config.label} ${properties.id || index + 1}`;
}

function createParkingPopupContent(item) {
  return `
    <div class="popup-card">
      <h3>${item.title}</h3>
      <span class="category">Parking & Transportation</span>
      <p>Jenis: ${item.typeConfig.label}</p>
      <p>ID: ${item.properties.id || "-"}</p>
    </div>
  `;
}

export async function loadParkingGeoJson() {
  injectParkingHatchPatterns();

  try {
    await Promise.all([
      loadParkingType("car"),
      loadParkingType("motor")
    ]);

    renderActiveSidebarTab();
    syncParkingLayerInputs();
  } catch (error) {
    console.warn("GeoJSON parkiran gagal dimuat:", error);
  }
}

async function loadParkingType(type) {
  const config = getParkingTypeConfig(type);
  const response = await fetch(config.file);

  if (!response.ok) {
    throw new Error(`${config.file} tidak dapat dimuat`);
  }

  const data = await response.json();

  data.features.forEach(function(feature, index) {
    feature.properties = feature.properties || {};
    feature.properties.jenis_parkir = feature.properties.jenis_parkir || config.label;
    feature.properties.kategori = feature.properties.kategori || "Parking & Transportation";

    const detectedType = getParkingTypeFromFeature(feature, type);
    const typeConfig = getParkingTypeConfig(detectedType);
    const title = getParkingTitle(feature, detectedType, index);
    let popupLayer = null;

    const item = {
      id: `${detectedType}-${feature.properties.id || index + 1}`,
      type: detectedType,
      typeConfig: typeConfig,
      title: title,
      properties: feature.properties,
      feature: feature,
      baseLayer: null,
      hatchLayer: null,
      popupLayer: null
    };

    const baseLayer = L.geoJSON(feature, {
      renderer: parkingRenderer,
      style: getParkingBaseStyle,
      onEachFeature: function(_, layer) {
        popupLayer = layer;
        layer.bindPopup(createParkingPopupContent(item));
      }
    });

    const hatchLayer = L.geoJSON(feature, {
      renderer: parkingRenderer,
      interactive: false,
      style: getParkingHatchStyle
    });

    item.baseLayer = baseLayer;
    item.hatchLayer = hatchLayer;
    item.popupLayer = popupLayer;

    parkingLayerGroup.addLayer(baseLayer);
    parkingLayerGroup.addLayer(hatchLayer);
    parkingItems.push(item);
  });
}

function getParkingItemsByType(type) {
  return parkingItems.filter(function(item) {
    return item.type === type;
  });
}

function renderParkingSubGroup(type) {
  const config = getParkingTypeConfig(type);
  const items = getParkingItemsByType(type);
  const isOpen = parkingPanelState[type] !== false;
  const isVisible = parkingVisibility[type] !== false;

  if (!items.length) {
    return "";
  }

  let html = `
    <div class="parking-subcategory">
      <div class="parking-subcategory-header">
        <button class="category-group-main" onclick="toggleParkingSubGroup('${type}')">
          <span class="parking-subcategory-title">
            <span
              class="parking-swatch"
              style="--parking-fill: ${config.fillColor}; --parking-border: ${config.borderColor}; --parking-hatch: ${config.hatchColor};"
            ></span>
            <span>${config.label}</span>
            <span class="parking-subcategory-count">${items.length}</span>
          </span>
          <span class="category-group-actions">
            <i class="fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}"></i>
          </span>
        </button>
        <button
          class="category-visibility-toggle ${isVisible ? "" : "is-hidden"}"
          onclick="toggleParkingVisibilityFromLocations('${type}')"
          title="${isVisible ? "Sembunyikan parkiran" : "Tampilkan parkiran"}"
        >
          <i class="fa-solid ${isVisible ? "fa-eye" : "fa-eye-slash"}"></i>
          <span>${isVisible ? "Tampil" : "Sembunyi"}</span>
        </button>
      </div>
      <div class="category-group-body ${isOpen ? "" : "collapsed"}">
  `;

  items.forEach(function(item) {
    html += `
      <div class="building-item parking-item" onclick="focusParkingItem('${item.id}')">
        <div class="building-label">
          <span
            class="parking-swatch"
            style="--parking-fill: ${config.fillColor}; --parking-border: ${config.borderColor}; --parking-hatch: ${config.hatchColor};"
          ></span>
          <div>
            <div>${item.title}</div>
            <div class="building-category">${config.label}</div>
          </div>
        </div>
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

export function renderParkingGroupHtml() {
  if (!parkingItems.length) {
    return `
      <div class="category-group">
        <div class="category-group-header">
          <span class="category-group-title">
            <span class="category-sidebar-icon" style="--marker-color: #475569;">
              <i class="fa-solid fa-square-parking"></i>
            </span>
            <span>Parking & Transportation</span>
          </span>
          <span class="category-filter-count">Memuat...</span>
        </div>
      </div>
    `;
  }

  const isOpen = parkingPanelState.main !== false;
  const isVisible = parkingVisibility.car !== false || parkingVisibility.motor !== false;

  return `
    <div class="category-group">
      <div class="category-group-header">
        <button class="category-group-main" onclick="toggleParkingMainGroup()">
          <span class="category-group-title">
            <span class="category-sidebar-icon" style="--marker-color: #475569;">
              <i class="fa-solid fa-square-parking"></i>
            </span>
            <span>Parking & Transportation</span>
            <span class="category-group-count">${parkingItems.length}</span>
          </span>
          <span class="category-group-actions">
            <i class="fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}"></i>
          </span>
        </button>
        <button
          class="category-visibility-toggle ${isVisible ? "" : "is-hidden"}"
          onclick="toggleAllParkingVisibilityFromLocations()"
          title="${isVisible ? "Sembunyikan semua parkiran" : "Tampilkan semua parkiran"}"
        >
          <i class="fa-solid ${isVisible ? "fa-eye" : "fa-eye-slash"}"></i>
          <span>${isVisible ? "Tampil" : "Sembunyi"}</span>
        </button>
      </div>
      <div class="category-group-body ${isOpen ? "" : "collapsed"}">
        ${renderParkingSubGroup("car")}
        ${renderParkingSubGroup("motor")}
      </div>
    </div>
  `;
}

export function renderParkingLayerControls() {
  if (!parkingItems.length) {
    return "";
  }

  let html = `
    <div class="layer-group-title">Parking & Transportation</div>
    <div class="layer-item">
      <label class="layer-label">
        <input type="checkbox" id="allParkingToggle" checked onchange="toggleAllParkingLayers(this)">
        <i class="fa-solid fa-square-parking"></i>
        Semua Area Parkiran
      </label>
    </div>
  `;

  ["car", "motor"].forEach(function(type) {
    const config = getParkingTypeConfig(type);
    const items = getParkingItemsByType(type);
    const checked = parkingVisibility[type] !== false ? "checked" : "";

    if (!items.length) {
      return;
    }

    html += `
      <div class="layer-item">
        <div class="category-filter-row">
          <label>
            <input
              type="checkbox"
              data-parking-toggle="${type}"
              ${checked}
              onchange="toggleParkingLayer('${type}', this)"
            >
            <span
              class="parking-swatch"
              style="--parking-fill: ${config.fillColor}; --parking-border: ${config.borderColor}; --parking-hatch: ${config.hatchColor};"
            ></span>
            <span>${config.label}</span>
          </label>
          <span class="category-filter-count">${items.length}</span>
        </div>
      </div>
    `;
  });

  return html;
}

function setParkingVisible(type, visible) {
  parkingVisibility[type] = visible;

  parkingItems.forEach(function(item) {
    if (item.type !== type) {
      return;
    }

    if (visible) {
      parkingLayerGroup.addLayer(item.baseLayer);
      parkingLayerGroup.addLayer(item.hatchLayer);
    } else {
      parkingLayerGroup.removeLayer(item.baseLayer);
      parkingLayerGroup.removeLayer(item.hatchLayer);
    }
  });
}

function syncParkingLayerInputs() {
  const allParkingToggle = document.getElementById("allParkingToggle");
  const parkingToggles = document.querySelectorAll("[data-parking-toggle]");

  parkingToggles.forEach(function(input) {
    const type = input.getAttribute("data-parking-toggle");
    input.checked = parkingVisibility[type] !== false;
  });

  if (allParkingToggle) {
    allParkingToggle.checked = parkingVisibility.car !== false && parkingVisibility.motor !== false;
  }
}

export function toggleParkingMainGroup() {
  parkingPanelState.main = parkingPanelState.main === false;
  renderLocations();
}

export function toggleParkingSubGroup(type) {
  parkingPanelState[type] = parkingPanelState[type] === false;
  renderLocations();
}

export function toggleParkingVisibilityFromLocations(type) {
  const nextVisible = parkingVisibility[type] === false;

  setParkingVisible(type, nextVisible);
  syncParkingLayerInputs();
  renderLocations();
}

export function toggleAllParkingVisibilityFromLocations() {
  const nextVisible = parkingVisibility.car === false && parkingVisibility.motor === false;

  setParkingVisible("car", nextVisible);
  setParkingVisible("motor", nextVisible);
  syncParkingLayerInputs();
  renderLocations();
}

export function toggleParkingLayer(type, checkbox) {
  setParkingVisible(type, checkbox.checked);
  syncParkingLayerInputs();
}

export function toggleAllParkingLayers(checkbox) {
  setParkingVisible("car", checkbox.checked);
  setParkingVisible("motor", checkbox.checked);
  syncParkingLayerInputs();
}

export function focusParkingItem(itemId) {
  const item = parkingItems.find(function(parkingItem) {
    return parkingItem.id === itemId;
  });

  if (!item || !item.popupLayer) {
    return;
  }

  if (parkingVisibility[item.type] === false) {
    setParkingVisible(item.type, true);
    syncParkingLayerInputs();
    renderLocations();
  }

  if (!map.hasLayer(parkingLayerGroup)) {
    parkingLayerGroup.addTo(map);
  }

  const bounds = item.popupLayer.getBounds();
  map.fitBounds(bounds, {
    padding: [40, 40],
    maxZoom: 20
  });
  item.popupLayer.openPopup(bounds.getCenter());

  if (window.innerWidth <= 700) {
    closeSidebar();
  }
}
