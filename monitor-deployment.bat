@echo off
:loop
cls
echo ====================================
echo Helpdesk Deployment Monitor
echo ====================================
echo Time: %time%
echo.

echo Checking Frontend (http://34.173.186.108)...
curl -s -o nul -w "%%{http_code}" http://34.173.186.108 > temp_status.txt 2>nul
set /p FRONTEND_STATUS=<temp_status.txt
if "%FRONTEND_STATUS%"=="200" (
    echo ✅ Frontend: ONLINE and ACCESSIBLE
) else (
    echo 🔄 Frontend: Building... (Status: %FRONTEND_STATUS%)
)

echo.
echo Checking Backend (http://34.173.186.108:3001/health)...
curl -s -o nul -w "%%{http_code}" http://34.173.186.108:3001/health > temp_status.txt 2>nul
set /p BACKEND_STATUS=<temp_status.txt
if "%BACKEND_STATUS%"=="200" (
    echo ✅ Backend: ONLINE and ACCESSIBLE
) else (
    echo 🔄 Backend: Starting... (Status: %BACKEND_STATUS%)
)

del temp_status.txt 2>nul

echo.
if "%FRONTEND_STATUS%"=="200" if "%BACKEND_STATUS%"=="200" (
    echo 🎉 DEPLOYMENT SUCCESSFUL! 
    echo 📱 Frontend: http://34.173.186.108
    echo 🔌 Backend API: http://34.173.186.108:3001/health
    echo.
    echo Press any key to exit...
    pause >nul
    goto :end
)

echo Rechecking in 10 seconds...
echo Press Ctrl+C to stop monitoring
timeout /t 10 /nobreak >nul
goto loop

:end
