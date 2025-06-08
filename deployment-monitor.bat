@echo off
title Deployment Monitor - Frontend Fix
color 0E
echo.
echo ================================================================
echo           DEPLOYMENT MONITOR - FRONTEND BUILD FIX
echo ================================================================
echo.
echo 🕒 Current Time: %date% %time%
echo 🌐 Environment: Google Cloud Platform VM (34.173.186.108)
echo.
echo ================================================================
echo                     DEPLOYMENT STATUS
echo ================================================================
echo.
echo 📊 Previous Deployment Results:
echo    ✅ Database (PostgreSQL): HEALTHY
echo    🟡 Backend (Node.js): STARTING (health check pending)
echo    ❌ Frontend (React): BUILD FAILED (npm timeout)
echo.
echo 🛠️ Applied Fixes:
echo    ✅ Enhanced npm retry configuration
echo    ✅ Alternative registry fallback
echo    ✅ Increased timeout to 300 seconds
echo    ✅ Verbose logging for diagnostics
echo.
echo ================================================================
echo                    MONITORING OPTIONS
echo ================================================================
echo.
echo [1] 📊 Check GitHub Actions Status
echo [2] 🌐 Test Frontend Access
echo [3] 🔧 Test Backend Health
echo [4] 📋 View Container Status Guide
echo [5] 🔄 Refresh Status
echo [6] ❌ Exit
echo.
set /p choice="Select option (1-6): "

if "%choice%"=="1" (
    echo.
    echo 📊 Opening GitHub Actions...
    start https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
    echo.
    echo ✅ GitHub Actions opened in browser
    echo.
    echo 📋 What to look for:
    echo    • Latest workflow run should be "in progress" or "completed"
    echo    • Build logs will show frontend npm install progress
    echo    • Should complete in 5-8 minutes from push time
    goto :menu
)

if "%choice%"=="2" (
    echo.
    echo 🌐 Testing Frontend Access...
    echo Opening: http://34.173.186.108
    start http://34.173.186.108
    echo.
    echo 🔍 Expected Results:
    echo    ✅ If deployment completed: React application loads
    echo    ❌ If still deploying: Connection refused or error
    goto :menu
)

if "%choice%"=="3" (
    echo.
    echo 🔧 Testing Backend Health...
    echo Opening: http://34.173.186.108:3001/health
    start http://34.173.186.108:3001/health
    echo.
    echo 🔍 Expected Results:
    echo    ✅ Should show: {"status":"ok","timestamp":"..."}
    echo    ❌ If not ready: Connection refused
    goto :menu
)

if "%choice%"=="4" (
    echo.
    echo 📋 Container Status Commands for VM:
    echo.
    echo Run these via Google Cloud Console Terminal:
    echo.
    echo    # Check all containers
    echo    docker ps -a
    echo.
    echo    # Check specific container logs
    echo    docker logs helpdesk-frontend-prod
    echo    docker logs helpdesk-backend-prod  
    echo    docker logs helpdesk-postgres-prod
    echo.
    echo    # Check deployment logs
    echo    docker-compose -f docker-compose.prod.yml --env-file .env.production logs
    echo.
    echo    # Restart if needed
    echo    docker-compose -f docker-compose.prod.yml --env-file .env.production restart
    echo.
    pause
    goto :menu
)

if "%choice%"=="5" (
    echo.
    echo 🔄 Refreshing status...
    echo.
    powershell -Command "try { $frontend = Invoke-WebRequest -Uri 'http://34.173.186.108/' -TimeoutSec 5 -UseBasicParsing; Write-Host '✅ Frontend: ONLINE (Status:' $frontend.StatusCode ')' } catch { Write-Host '❌ Frontend: OFFLINE (' $_.Exception.Message ')' }"
    powershell -Command "try { $backend = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/health' -TimeoutSec 5 -UseBasicParsing; Write-Host '✅ Backend: ONLINE (Status:' $backend.StatusCode ')' } catch { Write-Host '❌ Backend: OFFLINE (' $_.Exception.Message ')' }"
    echo.
    goto :menu
)

if "%choice%"=="6" (
    echo.
    echo 👋 Monitoring session ended.
    echo.
    echo 📝 Next Steps:
    echo    1. Wait for GitHub Actions to complete (~5-8 minutes)
    echo    2. Test application access once deployment finishes
    echo    3. Monitor container logs if issues persist
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
echo                    CONTINUE MONITORING?
echo ================================================================
echo.
set /p return="Press Enter to return to menu or type 'exit' to quit: "
if /i "%return%"=="exit" (
    echo.
    echo 👋 Monitoring ended. Good luck with the deployment!
    exit /b 0
)
cls
goto :start

:start
goto :eof
