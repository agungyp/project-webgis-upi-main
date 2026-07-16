// =====================================================
// buildingDetail.js — Detail gedung, fokus peta, dan share
// Tanggung jawab: membuka & merender panel detail gedung di sidebar,
// menerbangkan peta ke gedung, efek highlight marker, dan berbagi tautan.
// =====================================================
import { map } from "./mapCore.js";
import { buildings, buildingMarkers, categoryVisibility } from "./state.js";
import { getIconConfigByCategory } from "./categories.js";
import { getInitials, showToast } from "./utils.js";
import { setCategoryVisible, syncCategoryLayerInputs } from "./markerVisibility.js";
import { updateSidebarChrome } from "./sidebar.js";

export function highlightMarker(marker) {
  var el = marker._icon;
  if (!el) return;
  el.classList.add("marker-pulse");
  setTimeout(function() { el.classList.remove("marker-pulse"); }, 2000);
}

export function showCategoryForMarker(marker) {
  if (marker && categoryVisibility[marker.categoryKey] === false) {
    setCategoryVisible(marker.categoryKey, true);
    syncCategoryLayerInputs();
  }
}

export function focusBuildingByName(name) {
  var marker = buildingMarkers.find(function(item) {
    return item.buildingData.name === name;
  });

  if (marker) {
    showCategoryForMarker(marker);
    map.flyTo(marker.getLatLng(), 19, { duration: 0.8 });
    setTimeout(function() {
      highlightMarker(marker);
    }, 850);
  }
}

export function openBuildingDetail(name) {
  var building = buildings.find(function(b) { return b.name === name; });
  if (!building) return;

  var marker = buildingMarkers.find(function(m) { return m.buildingData.name === name; });
  if (marker) {
    showCategoryForMarker(marker);
    map.flyTo(marker.getLatLng(), 19, { duration: 0.8 });
    setTimeout(function() { highlightMarker(marker); }, 850);
  }

  // Mobile: buka sidebar agar detail terlihat
  if (window.innerWidth <= 700) {
    var sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("closed")) {
      sidebar.classList.remove("closed");
      updateSidebarChrome();
      setTimeout(function() { map.invalidateSize(); }, 300);
    }
  }

  renderBuildingDetail(building);
}

export function renderBuildingDetail(building) {
  var container = document.getElementById("sidebarContent");
  var iconConfig = getIconConfigByCategory(building.category, building.name);
  var safeName = building.name.replace(/'/g, "\\'");
  var coords = building.coords;

  var imgSrc = building.image || "images/banner.png";
  var initials = getInitials(building.name);
  var badgeColor = iconConfig ? iconConfig.color : "#6b7280";
  var badgeLabel = iconConfig ? iconConfig.label : building.category;
  var badgeIcon  = iconConfig ? iconConfig.icon : "fa-building";

  // Info rows
  var infoRows = "";
  if (building.hours) {
    infoRows += `<div class="detail-info-row"><i class="fa-regular fa-clock"></i><span>${building.hours}</span></div>`;
  }
  if (building.floors) {
    infoRows += `<div class="detail-info-row"><i class="fa-solid fa-layer-group"></i><span>${building.floors} lantai</span></div>`;
  }
  if (building.phone) {
    infoRows += `<div class="detail-info-row"><i class="fa-solid fa-phone"></i><a href="tel:${building.phone}">${building.phone}</a></div>`;
  }

  // Facilities chips
  var facilitiesHtml = "";
  if (building.facilities && building.facilities.length > 0) {
    var chips = building.facilities.map(function(f) {
      return `<span class="detail-facility-chip">${f}</span>`;
    }).join("");
    facilitiesHtml = `
      <div class="detail-section">
        <div class="detail-section-title"><i class="fa-solid fa-list-check"></i> Fasilitas</div>
        <div class="detail-facilities">${chips}</div>
      </div>`;
  }

  container.innerHTML = `
    <div class="building-detail-panel">
      <button class="detail-back-btn" onclick="showTab('locations', document.querySelector('.sidebar-tabs button'))">
        <i class="fa-solid fa-arrow-left"></i> Kembali ke Daftar
      </button>

      <div class="detail-img-wrap">
        <img src="${imgSrc}" alt="${building.name}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="detail-img-fallback" style="display:none;background:${badgeColor}22;color:${badgeColor};">
          ${initials}
        </div>
      </div>

      <div class="detail-body">
        <span class="detail-category-badge" style="background:${badgeColor}18;color:${badgeColor};border:1px solid ${badgeColor}40;">
          <i class="fa-solid ${badgeIcon}"></i> ${badgeLabel}
        </span>

        <h2 class="detail-building-name">${building.name}</h2>

        ${building.description ? `<p class="detail-description">${building.description}</p>` : ""}

        ${infoRows ? `<div class="detail-info-section">${infoRows}</div>` : ""}

        ${facilitiesHtml}

        <div class="detail-actions">
          ${building.linkWeb ? `
          <a class="detail-btn detail-btn-website" href="${building.linkWeb}" target="_blank" rel="noopener">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Kunjungi Website
          </a>` : ""}
          <button class="detail-btn detail-btn-share" onclick="shareBuilding('${safeName}', [${coords[0]},${coords[1]}])">
            <i class="fa-solid fa-share-nodes"></i> Bagikan Lokasi
          </button>
        </div>
      </div>
    </div>
  `;

  // Tandai tab Lokasi sebagai aktif
  document.querySelectorAll(".sidebar-tabs button").forEach(function(btn) {
    btn.classList.toggle("active", btn.textContent.trim() === "Lokasi");
  });
}

export function shareBuilding(name, coordsOrUrl) {
  var url;
  if (typeof coordsOrUrl === "string") {
    url = coordsOrUrl;
  } else {
    url = window.location.origin + window.location.pathname + "?building=" + encodeURIComponent(name);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      showToast("Tautan lokasi disalin!");
    }).catch(function() {
      showToast("Gagal menyalin tautan.");
    });
  } else {
    showToast("Salin: " + url);
  }
}
