@echo off
echo =============================================================
echo    HELPDESK TICKETING SYSTEM - DEPLOYMENT STATUS CHECK
echo =============================================================
echo.
echo 🔍 Checking deployment status...
echo.
echo 📋 LATEST COMMIT:
git log --oneline -1
echo.
echo 🌐 GitHub Actions URL:
echo https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.
echo ⏰ Current Time: %date% %time%
echo.
echo 📝 EXPECTED DEPLOYMENT STEPS:
echo.
echo 1. ✅ Git push completed (Docker permission fixes)
echo 2. 🔄 GitHub Actions workflow triggered automatically
echo 3. 🔄 SSH connection to VM (34.173.186.108)
echo 4. 🔄 File upload and environment setup
echo 5. 🔄 Docker build with fixed Dockerfiles
echo 6. 🔄 Container startup with proper permissions
echo 7. 🔄 Health checks validation
echo 8. ✅ Deployment completion
echo.
echo 🔧 FIXES APPLIED:
echo ✅ Backend: uploads directory created in Dockerfile
echo ✅ Frontend: health check endpoint corrected (/health)
echo ✅ Docker compose: service names aligned
echo.
echo 🚀 Once deployment completes, access:
echo • Frontend: http://34.173.186.108
echo • Backend API: http://34.173.186.108:3001/api
echo • Health Check: http://34.173.186.108:3001/health
echo.
echo 👀 Monitor deployment progress at the GitHub Actions URL above
echo.
pause
