// =====================================================
// utils.js — Utilitas generik
// Tanggung jawab: helper string & notifikasi UI yang tidak
// terikat domain tertentu.
// =====================================================

export function getInitials(name) {
  return (name || "?").split(" ").slice(0, 2).map(function(w) {
    return w[0] || "";
  }).join("").toUpperCase() || "?";
}

export function showToast(msg) {
  var toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("toast-show");
  setTimeout(function() { toast.classList.remove("toast-show"); }, 3000);
}
