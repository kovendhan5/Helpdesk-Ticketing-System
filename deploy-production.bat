@echo off
echo.
echo ===============================================
echo   🚀 Helpdesk Ticketing System - Production Deploy
echo ===============================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker daemon is not running
    echo Please start Docker Desktop and try again
    echo.
    echo 💡 Steps to start Docker Desktop:
    echo    1. Open Docker Desktop application
    echo    2. Wait for it to fully start
    echo    3. Run this script again
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Stop existing containers if any
echo.
echo 🛑 Stopping existing containers...
docker-compose down

REM Pull latest images
echo.
echo 📥 Pulling latest images...
docker-compose pull

REM Build and start services
echo.
echo 🏗️  Building and starting services...
docker-compose up -d --build

REM Wait for services to be ready
echo.
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo.
echo 🔍 Checking service health...

REM Check database
docker-compose exec -T postgres pg_isready -U postgres
if %errorlevel% neq 0 (
    echo ❌ Database is not ready
    goto cleanup
)
echo ✅ Database is ready

REM Check backend
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is not responding
    goto cleanup
)
echo ✅ Backend is ready

REM Check frontend
curl -f http://localhost:8080 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend is not responding
    goto cleanup
)
echo ✅ Frontend is ready

echo.
echo ===============================================
echo   🎉 DEPLOYMENT SUCCESSFUL!
echo ===============================================
echo.
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:3001
echo 📊 Health Check: http://localhost:3001/health
echo.
echo 👤 Default admin: admin@example.com
echo 👤 Default user: user@example.com
echo ⚠️  Use secure setup script for production passwords
echo.
goto end

:cleanup
echo.
echo ❌ Deployment failed! Check logs:
echo docker-compose logs
echo.

:end
pause
