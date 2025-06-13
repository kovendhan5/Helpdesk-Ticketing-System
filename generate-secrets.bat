@echo off
cls
echo =============================================
echo   GITHUB SECRETS GENERATOR
echo =============================================

echo.
echo [1] SSH Private Key for GitHub Secrets
echo ----------------------------------------
echo Copy this ENTIRE content for GCP_SSH_PRIVATE_KEY secret:
echo.
echo --- START COPYING FROM NEXT LINE ---
type production_key
echo.
echo --- STOP COPYING AT PREVIOUS LINE ---
echo.

echo [2] Strong Database Password
echo -----------------------------
set /a DB_PASS_NUM=%RANDOM%*%RANDOM%
echo Suggested DB_PASSWORD: SecureDB_%DB_PASS_NUM%_Pass!
echo.

echo [3] JWT Secret (Long Random String)
echo -----------------------------------
set /a JWT_NUM1=%RANDOM%*%RANDOM%
set /a JWT_NUM2=%RANDOM%*%RANDOM%
echo Suggested JWT_SECRET: JWT_Secret_%JWT_NUM1%_%JWT_NUM2%_HelpDesk_2025_!
echo.

echo [4] Redis Password
echo ------------------
set /a REDIS_NUM=%RANDOM%*%RANDOM%
echo Suggested REDIS_PASSWORD: Redis_%REDIS_NUM%_Secure!
echo.

echo =============================================
echo   GITHUB SECRETS SETUP STEPS
echo =============================================
echo.
echo 1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions
echo 2. Click "New repository secret"
echo 3. Add these secrets:
echo.
echo    Name: GCP_SSH_PRIVATE_KEY
echo    Value: [SSH key content from above]
echo.
echo    Name: DB_PASSWORD  
echo    Value: [Database password from above]
echo.
echo    Name: JWT_SECRET
echo    Value: [JWT secret from above]
echo.
echo    Name: REDIS_PASSWORD
echo    Value: [Redis password from above]
echo.
echo 4. After adding secrets, push code or manually trigger deployment
echo.

echo =============================================
echo   QUICK SETUP COMMANDS
echo =============================================
echo.
echo To push the GitHub Actions workflow:
echo   git add .
echo   git commit -m "Add automated deployment workflow"
echo   git push
echo.

pause
