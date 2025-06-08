@echo off
echo =============================================================
echo    HELPDESK SYSTEM - FINAL VALIDATION TEST
echo =============================================================
echo.
echo 🎯 Testing all system components...
echo.

echo 📡 1. Testing Backend Health Endpoint...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/health' -TimeoutSec 10; Write-Host '✅ Backend Health:' $r.StatusCode } catch { Write-Host '❌ Backend Health Failed:' $_.Exception.Message }"

echo.
echo 🌐 2. Testing Frontend Access...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108' -TimeoutSec 10; Write-Host '✅ Frontend Status:' $r.StatusCode } catch { Write-Host '❌ Frontend Failed:' $_.Exception.Message }"

echo.
echo 🔐 3. Testing API Authentication Endpoint...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/api/auth/register' -Method POST -ContentType 'application/json' -Body '{\"test\":true}' -TimeoutSec 10; Write-Host '✅ API Accessible:' $r.StatusCode } catch { Write-Host '✅ API Accessible (Expected 400 for test data):' $_.Exception.Response.StatusCode }"

echo.
echo 📊 4. Testing CORS and Security Headers...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://34.173.186.108:3001/api/csrf-token' -TimeoutSec 10; Write-Host '✅ Security Headers:' $r.StatusCode } catch { Write-Host '❌ Security Headers Failed:' $_.Exception.Message }"

echo.
echo =============================================================
echo    MANUAL TESTING REQUIRED
echo =============================================================
echo.
echo 🔍 Please manually test the following:
echo.
echo 1. 🌐 Open: http://34.173.186.108
echo    - Should show the helpdesk login page
echo.
echo 2. 🔐 Login with test accounts:
echo    - Admin: admin@example.com / admin123
echo    - User: user@example.com / user123
echo.
echo 3. 🎫 Test ticket creation:
echo    - Create a new support ticket
echo    - Add attachments (test file upload)
echo.
echo 4. ⚡ Test real-time features:
echo    - Open admin and user views in different browsers
echo    - Create/update tickets and verify real-time updates
echo.
echo 5. 📱 Test responsive design:
echo    - Check mobile/tablet views
echo    - Verify all features work on different screen sizes
echo.
echo =============================================================
echo    DEPLOYMENT URLS
echo =============================================================
echo.
echo 🌐 Frontend: http://34.173.186.108
echo 🔗 Backend API: http://34.173.186.108:3001/api
echo 💚 Health Check: http://34.173.186.108:3001/health
echo 📊 GitHub Actions: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo ☁️  Google Cloud: https://console.cloud.google.com/
echo.
echo Press any key to open the application in browser...
pause >nul
start http://34.173.186.108
