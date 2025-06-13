@echo off
cls
echo =============================================
echo   HELPDESK DEPLOYMENT - FIXED VERSION
echo =============================================

set SERVER_IP=34.55.113.9
set SSH_USER=helpdesk-production-user-2025
set SSH_KEY=production_key
set REPO_URL=https://github.com/kovendhan5/Helpdesk-Ticketing-System.git

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
echo [2] Preparing server environment...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "sudo apt update && sudo apt install -y git docker.io docker-compose"

echo.
echo [3] Cloning from GitHub to server...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "rm -rf helpdesk-app"
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "git clone %REPO_URL% helpdesk-app"
if %errorlevel% neq 0 (
    echo ❌ Git clone failed. Checking server...
    ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "pwd && ls -la && git --version"
    pause
    exit /b 1
)
echo ✅ Repository cloned

echo.
echo [4] Setting up environment file...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && cp .env.example .env"
echo ✅ Environment file created

echo.
echo [5] Starting Docker deployment...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && sudo docker-compose down --remove-orphans && sudo docker-compose up -d --build"

echo.
echo [6] Waiting for services to start...
timeout /t 90

echo.
echo [7] Checking deployment status...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "cd helpdesk-app && sudo docker-compose ps"

echo.
echo [8] Checking if ports are accessible...
ssh -i %SSH_KEY% %SSH_USER%@%SERVER_IP% "sudo netstat -tlnp | grep ':8080\|:3001' || echo 'Ports not yet bound'"

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
