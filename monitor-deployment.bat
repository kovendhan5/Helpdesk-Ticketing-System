@echo off
echo =============================================================
echo    HELPDESK SYSTEM - REAL-TIME STATUS MONITOR
echo =============================================================
echo.
echo 📅 Current Time: %date% %time%
echo 🌐 VM IP: 34.173.186.108
echo.
echo 🔍 Testing application endpoints...
echo.

echo 1. 🌐 Testing Frontend (Port 80)...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108' -TimeoutSec 5; Write-Host '✅ Frontend Status:' $r.StatusCode } catch { Write-Host '❌ Frontend Error:' $_.Exception.Message }"

echo.
echo 2. 💚 Testing Backend Health (Port 3001)...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/health' -TimeoutSec 5; Write-Host '✅ Backend Health:' $r.StatusCode } catch { Write-Host '❌ Backend Error:' $_.Exception.Message }"

echo.
echo 3. 🔌 Testing Backend API (Port 3001)...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/api/csrf-token' -TimeoutSec 5; Write-Host '✅ API Status:' $r.StatusCode } catch { Write-Host '❌ API Error:' $_.Exception.Message }"

echo.
echo =============================================================
echo    STATUS SUMMARY
echo =============================================================
echo.
echo 📊 Latest Fixes Applied:
echo    ✅ Backend: Absolute path /app/uploads (fixes EACCES)
echo    ✅ Frontend: nginx port 80 (fixes health check)
echo.
echo 🔗 Monitoring URLs:
echo    📱 GitHub Actions: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo    ☁️  Google Cloud: https://console.cloud.google.com/
echo.
echo 🎯 Success Indicators:
echo    ✅ Frontend: HTTP 200 response
echo    ✅ Backend Health: HTTP 200 with "status": "healthy"
echo    ✅ API: HTTP 200 with CSRF token
echo.
echo ⏱️  Expected Results: 2-5 minutes after latest deployment
echo.
echo Press any key to open application in browser...
pause >nul
start http://34.173.186.108
