@echo off
title Helpdesk System - Quick Launch
color 0A
echo.
echo ================================================================
echo           HELPDESK TICKETING SYSTEM - QUICK LAUNCHER
echo ================================================================
echo.
echo 🚀 System Status: PRODUCTION READY
echo 🌐 Environment: Google Cloud Platform
echo 📍 Server: 34.173.186.108 (helpdesk-vm)
echo.
echo ================================================================
echo                        QUICK ACCESS
echo ================================================================
echo.
echo [1] 🌐 Open Main Application
echo [2] 🔧 Open API Health Check
echo [3] 📊 View GitHub Actions
echo [4] 🐳 Check Container Status Guide
echo [5] 📋 View Deployment Status
echo [6] ❌ Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🌐 Opening Helpdesk Application...
    start http://34.173.186.108
    echo.
    echo ✅ Application opened in browser
    echo 👤 Test Credentials:
    echo    Admin: admin@example.com / admin123
    echo    User:  user@example.com / user123
    goto :menu
)

if "%choice%"=="2" (
    echo.
    echo 🔧 Opening API Health Check...
    start http://34.173.186.108:3001/health
    echo.
    echo ✅ Health check opened in browser
    goto :menu
)

if "%choice%"=="3" (
    echo.
    echo 📊 Opening GitHub Actions...
    start https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
    echo.
    echo ✅ GitHub Actions opened in browser
    goto :menu
)

if "%choice%"=="4" (
    echo.
    echo 🐳 Container Status Commands:
    echo.
    echo Run these commands on the VM via Google Cloud Console:
    echo.
    echo   docker ps -a
    echo   docker-compose -f docker-compose.prod.yml --env-file .env.production logs
    echo   docker-compose -f docker-compose.prod.yml --env-file .env.production ps
    echo.
    echo 🔗 Google Cloud Console: https://console.cloud.google.com/
    echo.
    pause
    goto :menu
)

if "%choice%"=="5" (
    echo.
    echo 📋 Opening Deployment Status...
    start notepad DEPLOYMENT_COMPLETE_FINAL.md
    goto :menu
)

if "%choice%"=="6" (
    echo.
    echo 👋 Thank you for using the Helpdesk System Launcher!
    echo.
    exit /b 0
)

echo.
echo ❌ Invalid choice. Please select 1-6.
echo.
pause

:menu
echo.
echo ================================================================
echo                    RETURN TO MAIN MENU
echo ================================================================
echo.
set /p return="Press Enter to return to main menu or type 'exit' to quit: "
if /i "%return%"=="exit" (
    echo.
    echo 👋 Goodbye!
    exit /b 0
)
cls
goto :start

:start
goto :eof
