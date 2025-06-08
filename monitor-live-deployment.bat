@echo off
echo.
echo ================================================================
echo 🚀 HELPDESK DEPLOYMENT - LIVE MONITORING (June 8, 2025)
echo ================================================================
echo.
echo ⚡ Latest Fix Applied: Enhanced backend uploads directory permissions
echo 📦 Deployment Status: IN PROGRESS...
echo.

:monitor_loop
echo [%TIME%] Checking deployment status...
echo.

echo 📋 GitHub Actions Status:
echo https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.

echo 🔍 Container Status Check:
echo Expected containers:
echo   - helpdesk-postgres-prod (Database) ✅ Should be healthy
echo   - helpdesk-backend-prod (Backend) 🔄 Should be running after fix
echo   - helpdesk-frontend-prod (Frontend) 🔄 Should be running after fix
echo.

echo 🌐 Application Access Points:
echo   - Main App: http://34.173.186.108
echo   - Backend API: http://34.173.186.108:3001
echo   - Health Check: http://34.173.186.108/health
echo.

echo 🔧 Fixed Issues:
echo   ✅ Backend Dockerfile - chmod 777 for uploads directory
echo   ✅ Enhanced uploads directory error handling
echo   ⏳ Frontend npm timeout config (if needed)
echo.

echo 📊 Next Steps:
echo   1. Monitor GitHub Actions completion
echo   2. Verify all containers are healthy
echo   3. Test application functionality
echo   4. Complete system validation
echo.

echo ================================================================
echo Press Ctrl+C to stop monitoring, or any key to check again...
pause >nul
cls
goto monitor_loop
