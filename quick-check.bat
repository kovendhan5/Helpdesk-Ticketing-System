@echo off
cls
echo.
echo ===============================================
echo 🚀 SIMPLIFIED HELPDESK DEPLOYMENT - STATUS
echo ===============================================
echo Time: %DATE% %TIME%
echo.

echo 📊 TESTING ENDPOINTS:
echo ===============================================
echo.

echo 🌐 Frontend Test:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://34.173.186.108' -TimeoutSec 10; Write-Host 'Status:' $response.StatusCode '| Frontend:' $response.StatusDescription } catch { Write-Host 'Frontend: Not responding' }"

echo.
echo 🔧 Backend Health Test:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/health' -TimeoutSec 10; Write-Host 'Status:' $response.StatusCode '| Backend:' $response.StatusDescription } catch { Write-Host 'Backend: Not responding' }"

echo.
echo 🔗 Quick Access Links:
echo ===============================================
echo Frontend: http://34.173.186.108
echo Backend:  http://34.173.186.108:3001/health
echo GitHub:   https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.

echo 🔐 Test Credentials:
echo ===============================================
echo Admin: admin@example.com / admin123
echo User:  user@example.com / user123
echo.

echo ✅ Expected Result: Both endpoints return Status: 200
echo.

echo Press any key to open application in browser...
pause >nul

start "" "http://34.173.186.108"
start "" "https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions"

echo.
echo Application opened! Check deployment status in GitHub Actions.
echo.
pause
