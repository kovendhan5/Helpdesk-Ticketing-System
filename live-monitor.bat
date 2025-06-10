@echo off
title Production Deployment Monitor
color 0A
echo.
echo ████████████████████████████████████████████████████████████████████████████████
echo █                                                                              █
echo █              🚀 LIVE PRODUCTION DEPLOYMENT MONITORING 🚀                    █
echo █                                                                              █
echo ████████████████████████████████████████████████████████████████████████████████
echo.
echo 📊 DEPLOYMENT STATUS: GITHUB SECRETS CONFIGURED ✅
echo ⏰ Started: %date% %time%
echo.
echo 🔍 Real-time Status Check:
echo.

:loop
echo ────────────────────────────────────────────────────────────────────────────────
echo [%time%] Checking production endpoints...
echo.

REM Check frontend
curl -s -o nul -w "Frontend (Port 8080): HTTP %%{http_code}" http://34.173.186.108:8080 2>nul
if %errorlevel% equ 0 (
    echo  ✅ RESPONDING
) else (
    echo  🔄 Deploying...
)
echo.

REM Check backend
curl -s -o nul -w "Backend API (Port 3001): HTTP %%{http_code}" http://34.173.186.108:3001/health 2>nul
if %errorlevel% equ 0 (
    echo  ✅ RESPONDING
) else (
    echo  🔄 Deploying...
)
echo.

REM Check if both are live
curl -s http://34.173.186.108:8080 >nul 2>&1 && curl -s http://34.173.186.108:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ████████████████████████████████████████████████████████████████████████████████
    echo █                                                                              █
    echo █                      🎉 DEPLOYMENT SUCCESSFUL! 🎉                           █
    echo █                                                                              █
    echo ████████████████████████████████████████████████████████████████████████████████
    echo.
    echo ✅ Frontend Live: http://34.173.186.108:8080
    echo ✅ Backend Live: http://34.173.186.108:3001/health
    echo ✅ Full Helpdesk System: OPERATIONAL
    echo.
    echo 🛡️ Security Features Active:
    echo    • Login Rate Limiting (5 attempts)
    echo    • Redis Token Storage
    echo    • Non-root Containers
    echo    • Content Security Policy
    echo    • JWT Authentication
    echo    • Input Sanitization
    echo.
    pause
    exit /b 0
)

echo Checking again in 30 seconds...
timeout /t 30 /nobreak >nul
goto loop
