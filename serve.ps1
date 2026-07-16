# ==========================================================
#  Server statis lokal untuk WebGIS UPI
#  Dipakai karena aplikasi memuat GeoJSON via fetch() yang
#  DIBLOKIR bila dibuka langsung (file://). Jalankan ini agar
#  peta bisa dibuka lewat http://localhost.
#
#  Cara pakai:  dobel-klik  start-server.bat
#  atau:        powershell -ExecutionPolicy Bypass -File serve.ps1
# ==========================================================

$Root = $PSScriptRoot
$ports = 8000, 8001, 8080, 5500, 3000
$listener = $null
$Port = $null

foreach ($p in $ports) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    $l.Start()
    $listener = $l
    $Port = $p
    break
  } catch {
    if ($l) { $l.Close() }
  }
}

if (-not $listener) {
  Write-Host "Semua port ($($ports -join ', ')) sedang dipakai." -ForegroundColor Red
  Write-Host "Tutup server lain lalu jalankan ulang."
  Read-Host "Tekan Enter untuk keluar"
  exit 1
}

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript";
  ".json"="application/json"; ".geojson"="application/json"; ".png"="image/png";
  ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".gif"="image/gif"; ".svg"="image/svg+xml";
  ".ico"="image/x-icon"; ".txt"="text/plain"; ".webp"="image/webp"
}

Write-Host ""
Write-Host "  ==================================================" -ForegroundColor Cyan
Write-Host "   WebGIS Kampus UPI - server lokal AKTIF" -ForegroundColor Cyan
Write-Host "  ==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Beranda :  http://localhost:$Port/" -ForegroundColor Green
Write-Host "   Peta    :  http://localhost:$Port/map.html" -ForegroundColor Green
Write-Host ""
Write-Host "   Biarkan jendela ini TERBUKA selama memakai peta."
Write-Host "   Tutup jendela / tekan Ctrl+C untuk menghentikan server."
Write-Host ""

# Buka peta otomatis di browser default
Start-Process "http://localhost:$Port/map.html"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $rel = $rel -replace '/', '\'
    $path = Join-Path $Root $rel

    if (Test-Path $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.StatusCode = 200
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    # Abaikan error koneksi sesekali agar server tetap hidup
  }
}
