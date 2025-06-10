@echo off
setlocal enabledelayedexpansion

echo ===================================
echo  Helpdesk Secret Generator Script
echo ===================================
echo.

echo This script will generate secure passwords and secrets for your Helpdesk application.

:: Check if openssl is available
where openssl >nul 2>&1
if %errorlevel% NEQ 0 (
    echo OpenSSL not found. Using PowerShell for random generation.
    set USE_POWERSHELL=1
) else (
    set USE_POWERSHELL=0
)

echo.
echo Generating DB_PASSWORD...
if !USE_POWERSHELL! EQU 1 (
    for /f %%i in ('powershell -Command "$bytes = New-Object Byte[] 24; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"') do set DB_PASSWORD=%%i
) else (
    for /f "tokens=*" %%i in ('openssl rand -base64 32') do set DB_PASSWORD=%%i
)
echo DB_PASSWORD=!DB_PASSWORD!

echo.
echo Generating JWT_SECRET...
if !USE_POWERSHELL! EQU 1 (
    for /f %%i in ('powershell -Command "$bytes = New-Object Byte[] 48; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"') do set JWT_SECRET=%%i
) else (
    for /f "tokens=*" %%i in ('openssl rand -hex 64') do set JWT_SECRET=%%i
)
echo JWT_SECRET=!JWT_SECRET:~0,20!...

echo.
echo Generating REDIS_PASSWORD...
if !USE_POWERSHELL! EQU 1 (
    for /f %%i in ('powershell -Command "$bytes = New-Object Byte[] 18; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"') do set REDIS_PASSWORD=%%i
) else (
    for /f "tokens=*" %%i in ('openssl rand -base64 24') do set REDIS_PASSWORD=%%i
)
echo REDIS_PASSWORD=!REDIS_PASSWORD!

echo.
echo Writing secrets to .env file...

echo # Environment file for local development > .env
echo # IMPORTANT: NEVER commit this file to version control! >> .env
echo. >> .env
echo # Database configuration >> .env
echo DB_HOST=postgres >> .env
echo DB_PORT=5432 >> .env
echo DB_NAME=helpdesk >> .env
echo DB_USER=postgres >> .env
echo DB_PASSWORD=!DB_PASSWORD! >> .env
echo. >> .env
echo # JWT Secret >> .env
echo JWT_SECRET=!JWT_SECRET! >> .env
echo. >> .env
echo # Redis configuration >> .env
echo REDIS_HOST=redis >> .env
echo REDIS_PORT=6379 >> .env
echo REDIS_PASSWORD=!REDIS_PASSWORD! >> .env
echo. >> .env
echo # Frontend configuration >> .env
echo FRONTEND_PORT=8080 >> .env
echo API_URL=http://localhost:3001 >> .env

echo.
echo ===================================
echo  GITHUB ACTIONS SECRETS
echo ===================================
echo.
echo Add these secrets to your GitHub repository:
echo.
echo DB_PASSWORD=!DB_PASSWORD!
echo JWT_SECRET=!JWT_SECRET!
echo REDIS_PASSWORD=!REDIS_PASSWORD!
echo.
echo ===================================
echo.
echo Environment file .env has been created.
echo IMPORTANT: NEVER commit the .env file to version control!

pause
