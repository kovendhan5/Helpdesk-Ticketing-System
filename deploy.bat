@echo off
cls
echo =============================================
echo   HELPDESK DEPLOYMENT - CLEAN START
echo =============================================

set SERVER_IP=34.55.113.9
set SSH_USER=helpdesk-production-user-2025
set SSH_KEY=production_key

echo [1] Testing SSH connection...
ssh -i %SSH_KEY% -o ConnectTimeout=10 %SSH_USER%@%SERVER_IP% "echo 'SSH SUCCESS'"
if %errorlevel% neq 0 (
    echo ❌ SSH failed. Please add the SSH key first.
    echo See SSH_SETUP.md for instructions.
    pause
    exit /b 1
)
echo ✅ SSH working

echo.
echo [2] Cloning from GitHub to server...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "rm -rf helpdesk-app && git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git helpdesk-app"

echo.
echo [3] Creating environment file on server...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && cp .env.example .env"

echo.
echo [4] Starting deployment...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && docker-compose down && docker-compose up -d --build"

echo.
echo [5] Waiting for services to start...
timeout /t 60

echo.
echo [6] Checking status...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && docker-compose ps"

echo.
echo =============================================
echo   DEPLOYMENT COMPLETE!
echo =============================================
echo Frontend: http://%SERVER_IP%:8080
echo Backend:  http://%SERVER_IP%:3001
echo.

echo Opening application...
start http://%SERVER_IP%:8080

pause
