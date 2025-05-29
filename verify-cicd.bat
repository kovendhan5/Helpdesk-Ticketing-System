@echo off
REM GitHub Actions CI/CD Verification Script
REM This script verifies that all components are ready for automated deployment

echo GitHub Actions CI/CD Verification
echo ====================================

set /a SUCCESS=0
set /a WARNINGS=0
set /a ERRORS=0

echo.
echo Checking CI/CD Pipeline Files...
if exist ".github\workflows\ci-cd.yml" (
    echo .github\workflows\ci-cd.yml exists
    set /a SUCCESS+=1
) else (
    echo .github\workflows\ci-cd.yml missing
    set /a ERRORS+=1
)

if exist "GITHUB-ACTIONS-SETUP.md" (
    echo GITHUB-ACTIONS-SETUP.md exists
    set /a SUCCESS+=1
) else (
    echo GITHUB-ACTIONS-SETUP.md missing
    set /a ERRORS+=1
)

echo.
echo Checking Package Files...
if exist "backend\package.json" (
    echo backend\package.json exists
    set /a SUCCESS+=1
) else (
    echo backend\package.json missing
    set /a ERRORS+=1
)

if exist "frontend\package.json" (
    echo frontend\package.json exists
    set /a SUCCESS+=1
) else (
    echo frontend\package.json missing
    set /a ERRORS+=1
)

if exist "frontend\src\App.test.js" (
    echo frontend\src\App.test.js exists
    set /a SUCCESS+=1
) else (
    echo frontend\src\App.test.js missing
    set /a ERRORS+=1
)

echo.
echo Checking Security Configuration...
if exist ".gitignore" (
    echo .gitignore exists
    set /a SUCCESS+=1
) else (
    echo .gitignore missing
    set /a ERRORS+=1
)

if exist ".env.example" (
    echo .env.example exists
    set /a SUCCESS+=1
) else (
    echo .env.example missing
    set /a ERRORS+=1
)

echo.
echo 📦 Checking Application Structure...
if exist "backend\src" (
    echo ✅ backend\src directory exists
    set /a SUCCESS+=1
) else (
    echo ❌ backend\src directory missing
    set /a ERRORS+=1
)

if exist "frontend\src" (
    echo ✅ frontend\src directory exists
    set /a SUCCESS+=1
) else (
    echo ❌ frontend\src directory missing
    set /a ERRORS+=1
)

if exist "terraform" (
    echo ✅ terraform directory exists
    set /a SUCCESS+=1
) else (
    echo ❌ terraform directory missing
    set /a ERRORS+=1
)

echo.
echo Checking Terraform Infrastructure...
if exist "terraform\main.tf" (
    echo terraform\main.tf exists
    set /a SUCCESS+=1
) else (
    echo terraform\main.tf missing
    set /a ERRORS+=1
)

if exist "terraform\outputs.tf" (
    echo terraform\outputs.tf exists
    set /a SUCCESS+=1
) else (
    echo terraform\outputs.tf missing
    set /a ERRORS+=1
)

echo.
echo Verification Summary
echo ======================
echo Successful checks: %SUCCESS%
echo Warnings: %WARNINGS%
echo Errors: %ERRORS%

echo.
if %ERRORS% EQU 0 (
    echo Ready for GitHub Actions CI/CD!
    echo.
    echo Next steps:
    echo 1. Commit and push all changes to GitHub
    echo 2. Add required secrets to GitHub repository
    echo 3. Test the automated deployment pipeline
    echo.
    echo Required GitHub Secrets:
    echo - SSH_PRIVATE_KEY
    echo - VM_IP
    echo - SLACK_WEBHOOK ^(optional^)
) else (
    echo Issues found. Please fix errors before proceeding.
)
