@echo off
echo Checking Docker container status...
docker ps -a
echo.
echo Stopping helpdesk containers...
docker stop helpdesk-backend helpdesk-postgres helpdesk-frontend 2>nul
echo.
echo Removing stopped containers...
docker rm helpdesk-backend helpdesk-postgres helpdesk-frontend 2>nul
echo.
echo Container cleanup completed.
pause
