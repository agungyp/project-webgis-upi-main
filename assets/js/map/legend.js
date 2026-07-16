// =====================================================
// legend.js — Legenda kategori pada peta
// Tanggung jawab: merender & menampilkan/menyembunyikan panel legenda.
// =====================================================
import { categoryIconStyles, categoryDisplayOrder } from "./categories.js";

// Render legenda kategori (dipanggil sekali saat init)
export function renderLegendItems() {
  var container = document.getElementById("mapLegendItems");
  if (!container) return;
  var html = "";
  categoryDisplayOrder.forEach(function(key) {
    var cfg = categoryIconStyles[key];
    if (!cfg) return;
    html += `
      <div class="map-legend-item">
        <span class="map-legend-dot" style="background:${cfg.color}">
          <i class="fa-solid ${cfg.icon}"></i>
        </span>
        <span class="map-legend-label">${cfg.label}</span>
      </div>`;
  });
  container.innerHTML = html;
}

export function toggleLegend() {
  var el = document.getElementById("mapLegend");
  if (el) el.classList.toggle("map-legend-expanded");
}
