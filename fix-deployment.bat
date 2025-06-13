@echo off
echo =============================================
echo   FIXING CURRENT DEPLOYMENT
echo =============================================

set SERVER_IP=34.55.113.9
set SSH_USER=helpdesk-production-user-2025
set SSH_KEY=production_key

echo [1] Installing git on server if needed...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "sudo apt update && sudo apt install -y git"

echo.
echo [2] Cloning repository with correct URL...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "rm -rf helpdesk-app && git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git helpdesk-app"

echo.
echo [3] Checking if clone was successful...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "ls -la helpdesk-app"

echo.
echo [4] Setting up environment...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && cp .env.example .env"

echo.
echo [5] Starting deployment...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && sudo docker-compose down && sudo docker-compose up -d --build"

echo.
echo [6] Checking status...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && sudo docker-compose ps"

echo.
echo =============================================
echo   FIXED DEPLOYMENT COMPLETE!
echo =============================================

pause
