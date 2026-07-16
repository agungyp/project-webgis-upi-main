# WebGIS Kampus UPI

Peta kampus interaktif Universitas Pendidikan Indonesia (UPI) berbasis **Leaflet.js**.
Menampilkan gedung, fasilitas, parkir, jalur evakuasi, dan jalur pejalan kaki di atas
peta kampus hasil *georeferencing* (tile XYZ lokal).

## Menjalankan secara lokal

> **PENTING:** Aplikasi memuat data lewat `fetch()` (GeoJSON). Jika `map.html` dibuka
> langsung dengan klik-dua-kali (`file://`), browser **memblokir** pemuatan data dan
> muncul pesan *"Gagal memuat data gedung / Failed to fetch"*. Jadi **harus** lewat
> HTTP server (localhost).

### Cara termudah (Windows, tanpa install apa pun)

**Dobel-klik `start-server.bat`.** Skrip ini menjalankan server lokal (memakai PowerShell
bawaan Windows) lalu membuka peta otomatis di browser. Biarkan jendela hitamnya terbuka
selama memakai peta; tutup jendela untuk menghentikan server.

### Alternatif

```bash
npx serve .                 # jika punya Node.js
python -m http.server 8000  # jika punya Python asli
```

Atau di VS Code: klik kanan `index.html` → **Open with Live Server**.

Lalu buka `http://localhost:<port>/` (beranda) atau `.../map.html` (peta).

## Struktur folder

```
.
├── index.html              # Landing page
├── map.html                # Halaman WebGIS (struktur DOM)
├── assets/
│   ├── css/
│   │   ├── landing.css      # Style landing page
│   │   └── map.css          # Style halaman peta
│   └── js/
│       ├── landing.js       # Toggle menu mobile (landing)
│       └── map.js           # Seluruh logika peta (Leaflet, marker, sidebar, dst.)
├── data/                   # Data GeoJSON runtime (di-fetch aplikasi)
│   ├── gedung-upi-point.geojson
│   ├── parkiran-mobil.geojson
│   └── parkiran-motor.geojson
├── images/                 # Aset gambar UI (logo, banner, dsb.)
├── tiles/upi/{z}/{x}/{y}.png   # Tile peta kampus hasil georeferencing
├── data-source/            # Artifact QGIS mentah (TIDAK di-serve, di-gitignore)
│   ├── raster/             #   raster .tif sumber
│   ├── qmd/                #   sidecar style QGIS (.qmd)
│   └── shapefile/          #   shapefile WIP (under-construction.*)
└── docs/
    └── ROADMAP.md
```

> **Catatan:** Karena ini situs statis tanpa bundler, root repo = web root. Aset yang
> di-*serve* (`images/`, `tiles/`, `data/`) sengaja berada di root agar URL-nya stabil.

## Dependency (via CDN)

- [Leaflet](https://leafletjs.com/) 1.9.4
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) 1.5.3
- [Font Awesome](https://fontawesome.com/) 6.6.0
- Google Fonts (Oswald)

Semua dimuat dari CDN, jadi butuh koneksi internet saat pertama kali render.

## Data

- **`data/`** — dipakai aplikasi saat runtime. Format GeoJSON (WGS84, `[lng, lat]`).
- **`data-source/`** — bahan mentah dari QGIS (raster, style, shapefile). Tidak dipakai
  browser; disimpan untuk reproduksi proses pemetaan. Folder ini di-*ignore* git.

### Meng-untrack `data-source/` yang sudah ter-commit (opsional)

Jika artifact QGIS sebelumnya sudah masuk ke git, hapus dari pelacakan tanpa menghapus
file lokal:

```bash
git rm -r --cached data-source/
git commit -m "chore: stop tracking QGIS source artifacts"
```

## Deploy

Cukup host folder ini sebagai situs statis (GitHub Pages, Netlify, Vercel, atau server
apa pun). Tidak ada langkah build.
