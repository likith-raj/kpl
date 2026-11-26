@echo off
title KPL Cricket Auction - Backend and Frontend
color 0A
cls
echo.
echo ========================================
echo   KPL CRICKET AUCTION SYSTEM
echo   Starting Services...
echo ========================================
echo.
REM Start Backend on Port 4000
echo Starting Backend (Port 4000)...
start "KPL Backend" cmd /k "cd e:\kpl-github\backend && npm run dev"
timeout /t 3 /nobreak
REM Start Frontend on Port 3000
echo Starting Frontend (Port 3000)...
start "KPL Frontend" cmd /k "cd e:\kpl-github && npm run dev"
echo.
echo Both servers starting...
echo.
echo Admin Control: http://localhost:3000/admin-login
echo Live Auction: http://localhost:3000/auction
echo Home Page: http://localhost:3000
echo.
echo Email: snkth123@gmail.com
echo Password: Shalom@143
echo.
pause
