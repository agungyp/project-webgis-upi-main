// =====================================================
// search.js — Pencarian gedung + autocomplete
// Tanggung jawab: input pencarian, dropdown saran, pesan hasil,
// dan mengarahkan ke gedung terpilih.
// =====================================================
import { buildings, buildingMarkers } from "./state.js";
import { getIconConfigByCategory } from "./categories.js";
import { focusBuildingByName, openBuildingDetail } from "./buildingDetail.js";

export function hideSuggestions() {
  var el = document.getElementById("searchSuggestions");
  if (el) { el.innerHTML = ""; el.style.display = "none"; }
}

export function showSearchMessage(text, type) {
  var msg = document.getElementById("searchMessage");
  if (!msg) return;
  msg.textContent = text;
  msg.className = "search-message search-message-" + type;
  msg.style.display = "block";
  clearTimeout(msg._hideTimer);
  msg._hideTimer = setTimeout(function() { msg.style.display = "none"; }, 4000);
}

export function hideSearchMessage() {
  var msg = document.getElementById("searchMessage");
  if (msg) msg.style.display = "none";
}

export function initSearchAutocomplete() {
  var input = document.getElementById("searchInput");
  var suggestions = document.getElementById("searchSuggestions");
  if (!input || !suggestions) return;

  input.addEventListener("input", function() {
    var keyword = this.value.toLowerCase().trim();
    if (!keyword || keyword.length < 2) { hideSuggestions(); return; }

    var matches = buildings.filter(function(b) {
      return b.name.toLowerCase().includes(keyword);
    }).slice(0, 7);

    if (!matches.length) { hideSuggestions(); return; }

    suggestions.innerHTML = matches.map(function(b) {
      var iconConfig = getIconConfigByCategory(b.category, b.name);
      var safeName = b.name.replace(/'/g, "\\'");
      return `<div class="search-suggestion-item" onclick="selectSuggestion('${safeName}')">
        <span class="suggestion-icon" style="background:${iconConfig.color}">
          <i class="fa-solid ${iconConfig.icon}"></i>
        </span>
        <div class="suggestion-text">
          <div class="suggestion-name">${b.name}</div>
          <div class="suggestion-cat">${b.category}</div>
        </div>
      </div>`;
    }).join("");
    suggestions.style.display = "block";
  });

  document.addEventListener("click", function(e) {
    if (!e.target.closest(".search-section")) hideSuggestions();
  });
}

export function selectSuggestion(name) {
  document.getElementById("searchInput").value = name;
  hideSuggestions();
  hideSearchMessage();
  focusBuildingByName(name);
}

export function searchBuilding() {
  var keyword = document.getElementById("searchInput").value.toLowerCase().trim();
  hideSuggestions();

  if (!keyword) {
    showSearchMessage("Masukkan nama gedung terlebih dahulu.", "warning");
    return;
  }

  var result = buildingMarkers.find(function(marker) {
    return marker.buildingData.name.toLowerCase().includes(keyword);
  });

  if (result) {
    hideSearchMessage();
    openBuildingDetail(result.buildingData.name);
  } else {
    showSearchMessage("Gedung tidak ditemukan. Coba kata kunci lain.", "error");
  }
}
