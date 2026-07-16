@echo off
REM ============================================================
REM  Dobel-klik file ini untuk membuka WebGIS UPI di browser.
REM  (Menjalankan server lokal karena peta butuh http://, bukan file://)
REM ============================================================
title WebGIS UPI - Server Lokal
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0serve.ps1"
pause
