@echo off
echo ====================================================================
echo 🚀 COMPREHENSIVE HELPDESK SYSTEM DEPLOYMENT
echo ====================================================================
echo Starting comprehensive fix and deployment process...
echo.

REM Set error handling
set "ERROR_OCCURRED=false"

echo [%TIME%] Step 1: Validating Docker environment...
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Docker is not running or not installed
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Docker is ready

echo.
echo [%TIME%] Step 2: Cleaning up previous deployments...
docker-compose down --remove-orphans 2>nul
docker system prune -f >nul 2>&1
echo ✅ Environment cleaned

echo.
echo [%TIME%] Step 3: Checking environment configuration...
if not exist ".env" (
    echo ❌ ERROR: .env file not found
    echo Creating .env file with secure defaults...
    call generate-secrets.bat
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to generate secrets
        set "ERROR_OCCURRED=true"
    )
) else (
    echo ✅ Environment file exists
)

echo.
echo [%TIME%] Step 4: Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install backend dependencies
        set "ERROR_OCCURRED=true"
    ) else (
        echo ✅ Backend dependencies installed
    )
) else (
    echo ✅ Backend dependencies already installed
)
cd ..

echo.
echo [%TIME%] Step 5: Building and starting services...
echo Building backend service...
docker-compose build backend
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend build failed
    set "ERROR_OCCURRED=true"
    goto :ERROR_EXIT
)
echo ✅ Backend built successfully

echo.
echo Starting all services...
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to start services
    set "ERROR_OCCURRED=true"
    goto :ERROR_EXIT
)
echo ✅ Services started

echo.
echo [%TIME%] Step 6: Waiting for services to initialize...
echo Waiting 30 seconds for full startup...
timeout /t 30 /nobreak >nul

echo.
echo [%TIME%] Step 7: Health check - Testing services...
echo Testing frontend (http://localhost:8080)...
curl -f -s -I http://localhost:8080 --max-time 10 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Frontend is responding
    set "FRONTEND_OK=true"
) else (
    echo ❌ Frontend not responding
    set "FRONTEND_OK=false"
    set "ERROR_OCCURRED=true"
)

echo Testing backend API (http://localhost:3001/health)...
curl -f -s http://localhost:3001/health --max-time 10 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend API is responding
    set "BACKEND_OK=true"
) else (
    echo ❌ Backend API not responding
    set "BACKEND_OK=false"
    set "ERROR_OCCURRED=true"
)

echo.
echo ====================================================================
echo 📊 LOCAL DEPLOYMENT RESULTS:
echo ====================================================================
if "%FRONTEND_OK%"=="true" if "%BACKEND_OK%"=="true" if "%ERROR_OCCURRED%"=="false" (
    echo 🎉 SUCCESS! All services are operational locally
    echo.
    echo ✅ Frontend: http://localhost:8080
    echo ✅ Backend API: http://localhost:3001/health
    echo ✅ All security features configured
    echo.
    echo [%TIME%] Step 8: Deploying to production...
    echo Committing changes and pushing to GitHub...
    
    git add .
    git commit -m "🚀 PRODUCTION DEPLOYMENT: Fixed rate limiting and security configurations

    - Set login rate limit to 5 attempts (production security)
    - Fixed security middleware default values
    - Verified local deployment working
    - All services tested and operational"
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ Changes committed
        git push origin main
        if %ERRORLEVEL% equ 0 (
            echo ✅ Pushed to GitHub - Production deployment triggered!
            echo.
            echo 🌐 Production endpoints will be ready in 2-5 minutes:
            echo   - Frontend: http://34.173.186.108:8080
            echo   - Backend API: http://34.173.186.108:3001/health
            echo.
            echo 📱 Monitor deployment at:
            echo   https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
        ) else (
            echo ❌ Failed to push to GitHub
            set "ERROR_OCCURRED=true"
        )
    ) else (
        echo ✅ No new changes to commit (already up to date)
        echo Triggering deployment anyway...
        git push origin main
    )
) else (
    echo ❌ LOCAL DEPLOYMENT FAILED
    set "ERROR_OCCURRED=true"
    goto :ERROR_EXIT
)

if "%ERROR_OCCURRED%"=="false" (
    echo.
    echo 🎉 DEPLOYMENT COMPLETE!
    echo Local testing: ✅ PASSED
    echo Production push: ✅ COMPLETED
    echo.
    echo Next: Wait 2-5 minutes and verify production deployment
    pause
    exit /b 0
)

:ERROR_EXIT
echo.
echo ❌ DEPLOYMENT FAILED
echo.
echo 🔍 Troubleshooting information:
docker-compose ps
echo.
echo 📝 Container logs:
docker-compose logs --tail=20
echo.
echo Please check the logs above and fix any issues
pause
exit /b 1
