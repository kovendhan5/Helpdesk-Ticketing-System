@echo off
echo.
echo ================================================================
echo 🚨 EMERGENCY DEPLOYMENT FIXER
echo ================================================================
echo This will directly connect to your VM and force restart everything
echo.

echo 📋 What this script does:
echo 1. Stops all running containers
echo 2. Downloads latest code
echo 3. Builds and starts containers immediately
echo 4. Shows status
echo.

echo 🔗 Manual Steps (if needed):
echo.
echo SSH to VM: ssh kovendhan2535@34.173.186.108
echo Then run these commands:
echo.
echo   docker kill $(docker ps -q)
echo   docker rm $(docker ps -aq)
echo   cd /home/kovendhan2535/helpdesk-app
echo   git clone --depth 1 https://github.com/kovendhan5/Helpdesk-Ticketing-System.git . || git pull
echo   docker-compose -f docker-compose.simple.yml up -d --build --force-recreate
echo   docker ps
echo.

echo 🌐 Check these URLs after 2-3 minutes:
echo   Frontend: http://34.173.186.108
echo   Backend:  http://34.173.186.108:3001/health
echo   GitHub:   https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.

echo Press any key to open GitHub Actions (to monitor the fast deployment)...
pause >nul

start "" "https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions"
start "" "http://34.173.186.108"

echo.
echo ⏱️ The new deployment should complete in 2-3 minutes (not 1.5 hours!)
echo.
pause
