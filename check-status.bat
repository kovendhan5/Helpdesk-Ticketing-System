@echo off
echo ====================================
echo Helpdesk System Status Check
echo ====================================
echo.

echo Checking Frontend (http://34.173.186.108)...
curl -s -o nul -w "%%{http_code}" http://34.173.186.108 > temp_status.txt
set /p FRONTEND_STATUS=<temp_status.txt
if "%FRONTEND_STATUS%"=="200" (
    echo ✅ Frontend: ACCESSIBLE
) else (
    echo ❌ Frontend: NOT ACCESSIBLE (Status: %FRONTEND_STATUS%)
)

echo.
echo Checking Backend (http://34.173.186.108:3001/health)...
curl -s -o nul -w "%%{http_code}" http://34.173.186.108:3001/health > temp_status.txt
set /p BACKEND_STATUS=<temp_status.txt
if "%BACKEND_STATUS%"=="200" (
    echo ✅ Backend: ACCESSIBLE
) else (
    echo ❌ Backend: NOT ACCESSIBLE (Status: %BACKEND_STATUS%)
)

del temp_status.txt 2>nul
echo.
echo ====================================
echo Status check complete
echo ====================================
pause
