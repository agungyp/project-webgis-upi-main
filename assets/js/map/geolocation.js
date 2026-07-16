// =====================================================
// geolocation.js — Deteksi posisi pengguna ("Posisi Saya")
// Tanggung jawab: mengambil lokasi GPS, menandai posisi + lingkaran
// akurasi di peta, dan memberi tahu bila di luar area kampus.
// =====================================================
import { map } from "./mapCore.js";
import { campusBounds } from "./config.js";
import { showToast } from "./utils.js";

var userLocationMarker = null;
var userAccuracyCircle = null;

export function locateMe() {
  if (!navigator.geolocation) {
    showToast("Browser tidak mendukung geolokasi.");
    return;
  }

  var btn = document.getElementById("locateMeBtn");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      var accuracy = pos.coords.accuracy;

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
        map.removeLayer(userAccuracyCircle);
      }

      var userIcon = L.divIcon({
        html: '<span class="user-location-dot"></span>',
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userLocationMarker = L.marker([lat, lng], { icon: userIcon })
        .bindPopup("<b>Posisi Anda</b><br>Akurasi: ~" + Math.round(accuracy) + " meter")
        .addTo(map);

      userAccuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.12,
        weight: 2
      }).addTo(map);

      map.flyTo([lat, lng], 18, { duration: 1.2 });
      userLocationMarker.openPopup();

      if (!campusBounds.contains([lat, lng])) {
        setTimeout(function() {
          showToast("Kamu sedang berada di luar area kampus UPI.");
        }, 1300);
      }

      var removeBtn = document.getElementById("removeLocationBtn");
      if (removeBtn) removeBtn.style.display = "inline-flex";
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>'; }
    },
    function(err) {
      console.warn("Geolokasi gagal:", err.message);
      showToast("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>'; }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

export function removeUserLocation() {
  if (userLocationMarker) { map.removeLayer(userLocationMarker); userLocationMarker = null; }
  if (userAccuracyCircle) { map.removeLayer(userAccuracyCircle); userAccuracyCircle = null; }
  var removeBtn = document.getElementById("removeLocationBtn");
  if (removeBtn) removeBtn.style.display = "none";
}
