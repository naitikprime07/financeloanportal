@echo off
echo ========================================
echo Starting BOTH Hindi and English Sites
echo ========================================
echo.
echo This will open TWO command windows:
echo.
echo Window 1: Hindi Site (localhost:5173)
echo Window 2: English Site (localhost:5174)
echo.
echo Press any key to continue...
pause >nul

start "Hindi Site - Port 5173" cmd /k "npm run dev"
timeout /t 3 >nul
start "English Site - Port 5174" cmd /k "npm run dev -- --port 5174"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Hindi:   http://localhost:5173
echo English: http://localhost:5174
echo.
echo Close each window to stop the servers
echo ========================================
