@echo off
echo.
echo ===============================================
echo   🔐 GitHub Secrets Setup Helper
echo ===============================================
echo.

echo This script will help you generate secure values for GitHub Secrets
echo.

echo 📋 Required GitHub Secrets for GCP Deployment:
echo.
echo 1. GCP_SSH_PRIVATE_KEY
echo 2. DOCKER_HUB_USERNAME  
echo 3. DOCKER_HUB_ACCESS_TOKEN
echo 4. DB_PASSWORD
echo 5. REDIS_PASSWORD
echo 6. JWT_SECRET
echo.

REM Check if PowerShell is available for password generation
powershell -Command "Get-Command Add-Type" >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔑 Generating secure passwords...
    echo.
    
    echo DB_PASSWORD (32 characters):
    powershell -Command "[System.Web.Security.Membership]::GeneratePassword(32, 8)"
    echo.
    
    echo REDIS_PASSWORD (24 characters):
    powershell -Command "[System.Web.Security.Membership]::GeneratePassword(24, 6)"
    echo.
    
    echo JWT_SECRET (64 characters):
    powershell -Command "[System.Web.Security.Membership]::GeneratePassword(64, 16)"
    echo.
) else (
    echo ⚠️  PowerShell not available for password generation
    echo Please use online password generators or manual creation
    echo.
)

echo 📝 Manual Setup Instructions:
echo.
echo 1. Go to your GitHub repository
echo 2. Navigate to: Settings → Secrets and variables → Actions
echo 3. Click "New repository secret" for each of the following:
echo.
echo    🔐 GCP_SSH_PRIVATE_KEY
echo       Content: Your private SSH key (entire file content)
echo       Generate with: ssh-keygen -t rsa -b 4096 -C "github-actions"
echo.
echo    🐳 DOCKER_HUB_USERNAME
echo       Content: kovendhan5
echo.
echo    🔑 DOCKER_HUB_ACCESS_TOKEN
echo       Content: Your Docker Hub access token
echo       Create at: Docker Hub → Account Settings → Security
echo.
echo    🗄️  DB_PASSWORD
echo       Content: Generated password above (32+ characters)
echo.
echo    📦 REDIS_PASSWORD  
echo       Content: Generated password above (24+ characters)
echo.
echo    🎫 JWT_SECRET
echo       Content: Generated password above (64+ characters)
echo.

echo 🌐 GCP VM Configuration:
echo    IP: 34.173.186.108
echo    User: kovendhan2535
echo    Zone: us-central1-a
echo.

echo 🔥 Firewall Rules Required:
echo    Port 8080 - Frontend (HTTP)
echo    Port 3001 - Backend API (HTTP)
echo    Port 22   - SSH
echo.

echo 📖 Full Setup Guide: GCP_DEPLOYMENT_GUIDE.md
echo.

pause
