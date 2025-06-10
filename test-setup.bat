@echo off
echo ===================================
echo  Testing Helpdesk Setup
echo ===================================
echo.

echo Step 1: Checking for Docker...
docker --version
if %errorlevel% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker and try again.
    pause
    exit /b 1
)
echo Docker found.

echo.
echo Step 2: Building containers...
docker-compose build
if %errorlevel% NEQ 0 (
    echo Docker build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Step 3: Starting services...
docker-compose up -d
if %errorlevel% NEQ 0 (
    echo Docker compose failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Step 4: Checking container status...
docker-compose ps
echo.

echo Step 5: Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo Step 6: Checking Redis connection...
docker-compose exec redis redis-cli -a %REDIS_PASSWORD% ping
if %errorlevel% NEQ 0 (
    echo Redis connection failed. Please check if the Redis password is set correctly.
    echo You can find the password in your .env file.
)

echo.
echo Step 7: Checking backend health...
curl -s http://localhost:3001/health
echo.

echo.
echo Step 8: Checking frontend accessibility...
curl -s -I http://localhost:8080
echo.

echo ===================================
echo  Setup Test Complete
echo ===================================
echo.
echo If all tests passed, your application should be running at:
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3001
echo.
echo To view application logs:
echo docker-compose logs -f
echo.

pause
