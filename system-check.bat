@echo off
echo.
echo ===============================================
echo   🔍 Helpdesk System - Pre-Deployment Check
echo ===============================================
echo.

echo 📋 Checking prerequisites...
echo.

REM Check Docker installation
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is installed
    
    REM Check Docker daemon
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Docker daemon is running
    ) else (
        echo ❌ Docker daemon is not running
        echo    Please start Docker Desktop
        goto not_ready
    )
) else (
    echo ❌ Docker is not installed
    echo    Please install Docker Desktop from https://docker.com/products/docker-desktop
    goto not_ready
)

REM Check for .env file
if exist ".env" (
    echo ✅ Environment file found
) else (
    echo ❌ Environment file not found
    echo    Please copy .env.example to .env and configure it
    goto not_ready
)

REM Check for docker-compose.yml
if exist "docker-compose.yml" (
    echo ✅ Docker Compose configuration found
) else (
    echo ❌ docker-compose.yml not found
    goto not_ready
)

REM All checks passed
echo.
echo ===============================================
echo   🎉 System is READY for deployment!
echo ===============================================
echo.
echo 🚀 To deploy, run: deploy-production.bat
echo 📊 To monitor, run: monitor-system.bat
echo 💾 To backup, run: backup-system.bat
echo.
echo 📱 Application URLs (after deployment):
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3001/api
echo    • Health Check: http://localhost:3001/health
echo.
goto end

:not_ready
echo.
echo ===============================================
echo   ❌ System is NOT ready for deployment
echo ===============================================
echo.
echo 📝 Please resolve the issues above and try again
echo.

:end
pause
