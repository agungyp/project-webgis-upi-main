// =====================================================
// sidebar.js — Render & tata letak sidebar
// Tanggung jawab: merender isi tab (Lokasi/Layer/Info), skeleton,
// berpindah tab, serta mengatur buka/tutup & chrome sidebar (mobile/desktop).
// Handler onclick pada HTML yang dihasilkan diselesaikan lewat window.*
// (di-wire di main.js), sehingga modul ini tidak perlu meng-import-nya.
// =====================================================
import { map } from "./mapCore.js";
import { activeFilters, categoryPanelState, categoryVisibility } from "./state.js";
import {
  categoryIconStyles, getGroupedBuildings, getVisibleCategoryKeys, getCategoryIconHtml
} from "./categories.js";
import { renderParkingGroupHtml, renderParkingLayerControls } from "./parking.js";

export function renderLocations() {
  const container = document.getElementById("sidebarContent");
  const grouped = getGroupedBuildings();
  const visibleKeys = getVisibleCategoryKeys();

  // — Filter Chips bar —
  let filterHtml = `<div class="filter-chips-bar">`;
  filterHtml += `<button class="filter-chip ${activeFilters.size === 0 ? "filter-chip-active" : ""}" onclick="toggleFilter('all')">
    <i class="fa-solid fa-border-all"></i> Semua
  </button>`;
  visibleKeys.forEach(function(key) {
    var cfg = categoryIconStyles[key];
    var isActive = activeFilters.has(key);
    filterHtml += `<button
      class="filter-chip ${isActive ? "filter-chip-active" : ""}"
      style="${isActive ? "--chip-color:" + cfg.color : ""}"
      onclick="toggleFilter('${key}')"
      title="${cfg.label}"
    >
      <i class="fa-solid ${cfg.icon}"></i>
      <span>${cfg.label}</span>
    </button>`;
  });
  filterHtml += `</div>`;

  let html = filterHtml + `
    <div class="layer-group-title">
      Lokasi Gedung per Kategori
      ${activeFilters.size > 0 ? `<span class="filter-active-badge">${activeFilters.size} filter aktif</span>` : ""}
    </div>
  `;

  const keysToShow = activeFilters.size > 0
    ? visibleKeys.filter(function(k) { return activeFilters.has(k); })
    : visibleKeys;

  keysToShow.forEach(function(categoryKey) {
    const categoryConfig = categoryIconStyles[categoryKey];
    const groupBuildings = grouped[categoryKey];
    if (!groupBuildings || !groupBuildings.length) return;
    const isOpen = categoryPanelState[categoryKey] !== false;
    const isVisible = categoryVisibility[categoryKey] !== false;

    html += `
      <div class="category-group">
        <div class="category-group-header">
          <button class="category-group-main" onclick="toggleCategoryGroup('${categoryKey}')">
            <span class="category-group-title">
              ${getCategoryIconHtml(categoryConfig.label, categoryConfig.label, "category-sidebar-icon")}
              <span>${categoryConfig.label}</span>
              <span class="category-group-count">${groupBuildings.length}</span>
            </span>
            <span class="category-group-actions">
              <i class="fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}"></i>
            </span>
          </button>
          <button
            class="category-visibility-toggle ${isVisible ? "" : "is-hidden"}"
            onclick="toggleCategoryVisibilityFromLocations('${categoryKey}')"
            title="${isVisible ? "Sembunyikan kategori" : "Tampilkan kategori"}"
          >
            <i class="fa-solid ${isVisible ? "fa-eye" : "fa-eye-slash"}"></i>
            <span>${isVisible ? "Tampil" : "Sembunyi"}</span>
          </button>
        </div>
        <div class="category-group-body ${isOpen ? "" : "collapsed"}">
    `;

    groupBuildings.forEach(function(building) {
      html += `
        <div class="building-item" onclick="openBuildingDetail('${building.name.replace(/'/g, "\\'")}')">
          <div class="building-label">
            ${getCategoryIconHtml(building.category, building.name, "category-sidebar-icon")}
            <div>
              <div>${building.name}</div>
              <div class="building-category">${building.category}</div>
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
  });

  html += renderParkingGroupHtml();

  container.innerHTML = html;
}

function renderCategoryLayerControls() {
  const grouped = getGroupedBuildings();
  let html = `
    <div class="layer-group-title">Kategori Marker</div>
  `;

  getVisibleCategoryKeys().forEach(function(categoryKey) {
    const categoryConfig = categoryIconStyles[categoryKey];
    const groupBuildings = grouped[categoryKey];
    const checked = categoryVisibility[categoryKey] !== false ? "checked" : "";

    html += `
      <div class="layer-item">
        <div class="category-filter-row">
          <label>
            <input
              type="checkbox"
              data-category-toggle="${categoryKey}"
              ${checked}
              onchange="toggleCategoryMarkers('${categoryKey}', this)"
            >
            ${getCategoryIconHtml(categoryConfig.label, categoryConfig.label, "category-sidebar-icon")}
            <span>${categoryConfig.label}</span>
          </label>
          <span class="category-filter-count">${groupBuildings.length}</span>
        </div>
      </div>
    `;
  });

  return html;
}

export function renderLayers() {
  const container = document.getElementById("sidebarContent");

  container.innerHTML = `
    <div class="layer-group-title">Layer Peta</div>

    <div class="layer-item">
      <label class="layer-label">
        <input type="checkbox" checked onchange="toggleCampusTile(this)">
        <i class="fa-solid fa-map"></i>
        Peta Kampus UPI
      </label>
    </div>

    <div class="layer-item">
      <label class="layer-label">
        <input type="checkbox" checked onchange="toggleBuildingMarkers(this)" id="allMarkersToggle">
        <i class="fa-solid fa-building"></i>
        Semua Marker Gedung
      </label>
    </div>

    ${renderCategoryLayerControls()}
    ${renderParkingLayerControls()}

    <div class="layer-group-title">Transparansi Overlay</div>

    <div class="layer-item">
      <div style="width: 100%;">
        <label style="font-size: 13px;">Transparansi Peta Kampus</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value="0.95"
          style="width: 100%; margin-top: 8px;"
          oninput="setCampusOpacity(this.value)"
        >
      </div>
    </div>
  `;
}

export function renderInfo() {
  const container = document.getElementById("sidebarContent");

  container.innerHTML = `
    <div class="layer-group-title">Tentang WebGIS Ini</div>

    <div style="padding: 14px 16px; line-height: 1.65; color: #444; font-size: 13.5px;">
      <p style="margin:0 0 10px">
        WebGIS Kampus UPI menampilkan peta kampus Universitas Pendidikan Indonesia
        secara interaktif — hasil georeferencing peta raster kampus.
      </p>
      <p style="margin:0 0 8px;font-weight:600;color:#1e293b;">Fitur tersedia:</p>
      <ul style="padding-left: 18px; margin:0; display:flex; flex-direction:column; gap:5px;">
        <li>Peta kampus interaktif dengan marker kategori</li>
        <li>Pencarian gedung dengan autocomplete</li>
        <li>Detail gedung lengkap (jam, fasilitas, telepon)</li>
        <li>Filter kategori multi-select</li>
        <li>Deteksi posisi pengguna (GPS)</li>
        <li>Layer parkir mobil & motor</li>
      </ul>
      <p style="margin:14px 0 0; font-size:12px; color:#94a3b8;">
        Universitas Pendidikan Indonesia<br>
        Jl. Dr. Setiabudi No. 229, Bandung
      </p>
    </div>
  `;
}

export function renderActiveSidebarTab() {
  const activeButton = document.querySelector(".sidebar-tabs button.active");
  const activeLabel = activeButton ? activeButton.textContent.trim() : "Lokasi";

  if (activeLabel === "Layer") {
    renderLayers();
  } else if (activeLabel === "Info") {
    renderInfo();
  } else {
    renderLocations();
  }
}

export function renderSidebarSkeleton() {
  var container = document.getElementById("sidebarContent");
  if (!container) return;
  var rows = "";
  for (var i = 0; i < 6; i++) {
    rows += `
      <div class="skeleton-row">
        <div class="skeleton-circle"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line skeleton-line-long"></div>
          <div class="skeleton-line skeleton-line-short"></div>
        </div>
      </div>`;
  }
  container.innerHTML = `<div class="skeleton-wrap">${rows}</div>`;
}

export function showTab(tabName, button) {
  const buttons = document.querySelectorAll(".sidebar-tabs button");

  buttons.forEach(function(btn) {
    btn.classList.remove("active");
  });

  button.classList.add("active");
  updateMobileSheetTitle(button.textContent.trim());

  if (tabName === "locations") {
    renderLocations();
  } else if (tabName === "layers") {
    renderLayers();
  } else if (tabName === "info") {
    renderInfo();
  }
}

export function isMobileLayout() {
  return window.matchMedia("(max-width: 700px)").matches;
}

export function updateMobileSheetTitle(title) {
  const sheetTitle = document.getElementById("mobileSheetTitle");

  if (sheetTitle && title) {
    sheetTitle.textContent = title;
  }
}

export function updateSidebarChrome() {
  const sidebar = document.getElementById("sidebar");
  const desktopIcon = document.getElementById("toggleIcon");
  const sheetAction = document.getElementById("mobileSheetAction");
  const sheetIcon = document.getElementById("mobileSheetIcon");
  const isClosed = sidebar.classList.contains("closed");

  if (desktopIcon) {
    if (isMobileLayout()) {
      desktopIcon.className = isClosed ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
    } else {
      desktopIcon.className = isClosed ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left";
    }
  }

  if (sheetAction) {
    sheetAction.textContent = isClosed ? "Tampilkan" : "Sembunyikan";
  }

  if (sheetIcon) {
    sheetIcon.className = isClosed ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
  }
}

export function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  sidebar.classList.toggle("closed");
  updateSidebarChrome();

  setTimeout(function() {
    map.invalidateSize();
  }, 300);
}

export function closeSidebar() {
  const sidebar = document.getElementById("sidebar");

  sidebar.classList.add("closed");
  updateSidebarChrome();

  setTimeout(function() {
    map.invalidateSize();
  }, 300);
}
