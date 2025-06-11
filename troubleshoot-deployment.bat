@echo off
echo ========================================
echo 🔧 DEPLOYMENT TROUBLESHOOTING SCRIPT
echo ========================================
echo.

echo 📋 Step 1: Check GitHub Repository Status
echo ----------------------------------------
git status
echo.
git log --oneline -5
echo.

echo 📋 Step 2: Verify Local Files are Ready
echo ----------------------------------------
if exist ".github\workflows\deploy-production.yml" (
    echo ✅ Main deployment workflow exists
) else (
    echo ❌ Main deployment workflow missing
)

if exist ".github\workflows\validate-secrets.yml" (
    echo ✅ Secrets validation workflow exists
) else (
    echo ❌ Secrets validation workflow missing
)

if exist "backend\Dockerfile" (
    echo ✅ Backend Dockerfile exists
) else (
    echo ❌ Backend Dockerfile missing
)

if exist "frontend\Dockerfile" (
    echo ✅ Frontend Dockerfile exists
) else (
    echo ❌ Frontend Dockerfile missing
)
echo.

echo 📋 Step 3: Docker Hub Status Check
echo ----------------------------------
echo Checking if Docker images are available...
docker manifest inspect kovendhan5/helpdesk-backend:latest >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend image available on Docker Hub
) else (
    echo ❌ Backend image not found on Docker Hub
)

docker manifest inspect kovendhan5/helpdesk-frontend:latest >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend image available on Docker Hub
) else (
    echo ❌ Frontend image not found on Docker Hub
)
echo.

echo 📋 Step 4: Required GitHub Secrets Checklist
echo ----------------------------------------------
echo The following secrets MUST be configured in GitHub:
echo.
echo 🔑 SSH_PRIVATE_KEY
echo    └── Your SSH private key for accessing the GCP VM
echo    └── Must start with: -----BEGIN OPENSSH PRIVATE KEY-----
echo    └── Must end with: -----END OPENSSH PRIVATE KEY-----
echo.
echo 🔑 DB_PASSWORD
echo    └── Database password for PostgreSQL
echo    └── Should be at least 12 characters long
echo.
echo 🔑 JWT_SECRET
echo    └── Secret for JWT token signing
echo    └── Should be at least 32 characters long
echo.
echo 🔑 REDIS_PASSWORD
echo    └── Password for Redis authentication
echo    └── Should be at least 12 characters long
echo.
echo 🔑 DOCKER_HUB_USERNAME (should already exist)
echo    └── Your Docker Hub username: kovendhan5
echo.
echo 🔑 DOCKER_HUB_ACCESS_TOKEN (should already exist)
echo    └── Your Docker Hub access token
echo.

echo 📋 Step 5: Test GCP VM Connection Locally
echo ------------------------------------------
echo Testing SSH connection to GCP VM...
echo Target: kovendhan2535@34.173.186.108
echo.

ssh -o ConnectTimeout=10 -o BatchMode=yes kovendhan2535@34.173.186.108 "echo 'SSH test successful'" 2>nul
if %errorlevel%==0 (
    echo ✅ SSH connection successful
) else (
    echo ❌ SSH connection failed
    echo 💡 Make sure:
    echo    1. Your SSH key is added to the GCP VM
    echo    2. The GCP VM is running
    echo    3. Firewall allows SSH (port 22)
)
echo.

echo 📋 Step 6: Quick Fixes
echo ----------------------
echo 🔧 To fix common issues:
echo.
echo 1. SSH Key Issues:
echo    - Go to GitHub → Settings → Secrets and Variables → Actions
echo    - Add/Update SSH_PRIVATE_KEY with your COMPLETE private key
echo    - Include the header and footer lines
echo.
echo 2. Missing Secrets:
echo    - Generate strong passwords for DB_PASSWORD, JWT_SECRET, REDIS_PASSWORD
echo    - Use: openssl rand -base64 32
echo.
echo 3. Re-run Deployment:
echo    - Go to GitHub → Actions tab
echo    - Click "Re-run failed jobs" or
echo    - Push a new commit to trigger deployment
echo.

echo 📋 Step 7: Next Steps
echo ---------------------
echo 1. Fix any issues found above
echo 2. Run this command to validate secrets:
echo    - Go to GitHub → Actions → Validate GitHub Secrets → Run workflow
echo.
echo 3. Re-run the main deployment:
echo    - Go to GitHub → Actions → Deploy Helpdesk to GCP Production → Re-run
echo.

echo ========================================
echo 🔧 Troubleshooting completed!
echo ========================================
pause
