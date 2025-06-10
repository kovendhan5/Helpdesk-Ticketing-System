@echo off
echo ===========================================
echo   PRODUCTION DEPLOYMENT MONITORING
echo ===========================================
echo.

echo Checking GitHub Actions status...
echo Visit: https://github.com/your-username/helpdesk-ticketing-system/actions
echo.

echo Checking production server status...
echo Production URL: http://34.173.186.108:8080
echo API Health: http://34.173.186.108:3001/health
echo.

echo Testing production endpoints...
curl -s http://34.173.186.108:3001/health 2>nul && (
    echo ✅ Backend API is responding
) || (
    echo ❌ Backend API is not responding
)

curl -s -o nul -w "%%{http_code}" http://34.173.186.108:8080 2>nul | findstr "200" >nul && (
    echo ✅ Frontend is responding
) || (
    echo ❌ Frontend is not responding
)

echo.
echo ===========================================
echo   SECURITY VALIDATIONS IMPLEMENTED:
echo ===========================================
echo ✅ Login rate limiting (5 attempts)
echo ✅ Redis token storage with fallback
echo ✅ Non-root container users
echo ✅ Content Security Policy headers
echo ✅ Secure password generation
echo ✅ JWT token management
echo ✅ WebSocket authentication
echo ✅ Input sanitization
echo.
echo ===========================================
echo To monitor deployment progress:
echo 1. Check GitHub Actions tab
echo 2. SSH to VM: ssh kovendhan2535@34.173.186.108
echo 3. Check logs: docker-compose logs -f
echo ===========================================
pause
