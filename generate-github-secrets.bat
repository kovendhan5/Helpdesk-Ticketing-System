@echo off
echo ========================================
echo 🔐 GITHUB SECRETS GENERATOR
echo ========================================
echo.

echo 📋 Generating secure passwords for GitHub Secrets...
echo.

echo 🔑 DB_PASSWORD (PostgreSQL):
echo ----------------------------------------
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16, 4)"') do set DB_PASSWORD=%%i
echo %DB_PASSWORD%
echo Copy this password and add it as 'DB_PASSWORD' secret in GitHub
echo.

echo 🔑 REDIS_PASSWORD:
echo ----------------------------------------
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16, 4)"') do set REDIS_PASSWORD=%%i
echo %REDIS_PASSWORD%
echo Copy this password and add it as 'REDIS_PASSWORD' secret in GitHub
echo.

echo 🔑 JWT_SECRET (32 characters):
echo ----------------------------------------
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set JWT_SECRET=%%i
echo %JWT_SECRET%
echo Copy this secret and add it as 'JWT_SECRET' secret in GitHub
echo.

echo 📋 How to add these secrets to GitHub:
echo ----------------------------------------
echo 1. Go to your GitHub repository
echo 2. Click Settings → Secrets and variables → Actions
echo 3. Click "New repository secret"
echo 4. Add each secret with the exact name and value shown above
echo.

echo 🔑 Required Secrets Checklist:
echo ----------------------------------------
echo ✅ SSH_PRIVATE_KEY (should already exist)
echo ⬜ DB_PASSWORD (generated above)
echo ⬜ JWT_SECRET (generated above)  
echo ⬜ REDIS_PASSWORD (generated above)
echo ✅ DOCKER_HUB_USERNAME (should already exist)
echo ✅ DOCKER_HUB_ACCESS_TOKEN (should already exist)
echo.

echo 📋 Alternative: Generate using OpenSSL (if available):
echo ----------------------------------------
echo For JWT_SECRET: openssl rand -base64 32
echo For DB_PASSWORD: openssl rand -base64 16
echo For REDIS_PASSWORD: openssl rand -base64 16
echo.

echo 🔧 After adding secrets:
echo ----------------------------------------
echo 1. Run the secrets validation workflow:
echo    GitHub → Actions → "Validate GitHub Secrets" → Run workflow
echo.
echo 2. Re-run the main deployment:
echo    GitHub → Actions → "Deploy Helpdesk to GCP Production" → Re-run
echo.

echo ========================================
echo 🔐 Secrets generated successfully!
echo ========================================
pause
