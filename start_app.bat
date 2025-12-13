@echo off
echo 🚀 Launching the Backend and Frontend in separate windows...
echo.

:: Tentukan port yang akan dimatikan
set "PORT_NUM=3000"
set "PORT_CLEANED=0"

:: Cari koneksi LISTENING di Port 3000, lalu ambil PID (token 5)
for /f "tokens=5" %%a in ('netstat -ano ^| find "LISTENING" ^| findstr :%PORT_NUM%') do (
    if %%a neq 0 (
        echo [INFO] Mematikan PID %%a yang menggunakan port %PORT_NUM%...
        :: Taskkill dengan /F (Forcefully)
        taskkill /PID %%a /F >nul
        set "PORT_CLEANED=1"
    )
)

if "%PORT_CLEANED%"=="0" (
    echo [INFO] Port %PORT_NUM% sudah bersih.
) else (
    echo ✅ Pembersihan Port 3000 Selesai.
)

:: Start Backend in a new window
echo Starting Backend (http://localhost:3000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Start Frontend in a new window
echo Starting Frontend (http://localhost:5173)...
start "Frontend Application" cmd /k "cd frontend && npm run dev"

echo Both servers are launching. Close the new windows to stop the servers. 