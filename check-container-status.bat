@echo off
echo =============================================================
echo    HELPDESK SYSTEM - CONTAINER STATUS CHECK  
echo =============================================================
echo.
echo 🔍 Checking container status on VM...
echo.
echo 📡 Connecting to VM to check Docker containers...
echo.
echo VM IP: 34.173.186.108
echo User: kovendhan2535
echo.
echo ⚠️  Note: This requires SSH access to the VM
echo    If you don't have direct SSH access, use Google Cloud Console
echo.
echo 🔗 Google Cloud Console: https://console.cloud.google.com/
echo 🔗 GitHub Actions: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.
echo 📋 Commands to run on VM via Cloud Console:
echo    docker ps -a
echo    docker-compose -f docker-compose.prod.yml --env-file .env.production logs
echo    docker-compose -f docker-compose.prod.yml --env-file .env.production ps
echo.
echo 🌐 Test URLs:
echo    Frontend: http://34.173.186.108
echo    Backend API: http://34.173.186.108:3001/api  
echo    Health Check: http://34.173.186.108:3001/health
echo.
pause
