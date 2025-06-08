@echo off
setlocal enabledelayedexpansion

echo =============================================================
echo    HELPDESK SYSTEM - POST-DEPLOYMENT VALIDATION
echo =============================================================
echo.

echo 🔍 Testing deployment status...
echo.

REM Test if we can reach the VM
echo 📡 Testing VM connectivity...
ping -n 1 34.173.186.108 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ VM is reachable at 34.173.186.108
) else (
    echo ❌ VM is not reachable
)
echo.

REM Test backend health endpoint
echo 🔧 Testing backend health endpoint...
curl -f -m 10 http://34.173.186.108:3001/health 2>nul
if %errorlevel% == 0 (
    echo ✅ Backend health check passed
) else (
    echo ❌ Backend health check failed
    echo ⚠️  This may be because:
    echo    - Containers are still starting up
    echo    - Firewall rules not configured yet
    echo    - Backend container has issues
)
echo.

REM Test frontend
echo 🌐 Testing frontend accessibility...
curl -f -m 10 http://34.173.186.108 2>nul
if %errorlevel% == 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
    echo ⚠️  This may be because:
    echo    - Containers are still starting up
    echo    - Firewall rules not configured yet
    echo    - Frontend container has issues
)
echo.

echo 📋 NEXT STEPS:
echo.
echo If containers are healthy but not accessible:
echo 1. Configure GCP firewall rules:
echo    - Run: configure-gcp-firewall-automated.sh
echo    - Or manually create rules for ports 80 and 3001
echo.
echo 2. If containers are not healthy:
echo    - Check GitHub Actions deployment logs
echo    - SSH to VM and check container status
echo.
echo 3. Access URLs (once firewall is configured):
echo    • Frontend: http://34.173.186.108
echo    • API: http://34.173.186.108:3001/api
echo    • Health: http://34.173.186.108:3001/health
echo.
echo 👤 Default Login:
echo    • Admin: admin@example.com / admin123
echo    • User: user@example.com / user123
echo.

pause
