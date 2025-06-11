@echo off
echo.
echo ===============================================
echo   📊 Helpdesk System - Health Monitor
echo ===============================================
echo.

REM Check Docker containers
echo 🐳 Docker Container Status:
docker-compose ps

echo.
echo 🔍 Service Health Checks:

REM Check database
echo Checking database...
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database: HEALTHY
) else (
    echo ❌ Database: UNHEALTHY
)

REM Check backend API
echo Checking backend API...
curl -f -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API: HEALTHY
) else (
    echo ❌ Backend API: UNHEALTHY
)

REM Check frontend
echo Checking frontend...
curl -f -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: HEALTHY
) else (
    echo ❌ Frontend: UNHEALTHY
)

echo.
echo 💾 Disk Usage:
docker system df

echo.
echo 📈 Resource Usage:
docker stats --no-stream

echo.
echo 📋 Recent Logs (last 10 lines):
echo --- Backend ---
docker-compose logs --tail=10 backend

echo.
echo --- Frontend ---
docker-compose logs --tail=10 frontend

echo.
echo ===============================================
echo   Monitor Complete
echo ===============================================
pause
