@echo off
echo =============================================
echo   CREATE ADMIN USER FOR HELPDESK SYSTEM
echo =============================================

echo.
echo The application doesn't have default login credentials.
echo You need to create the first admin user.
echo.

echo Method 1: Use the Registration API
echo ------------------------------------
echo You can create an admin user by making a POST request to:
echo http://34.55.113.9:3001/api/auth/register
echo.
echo Example with curl:
echo.
echo curl -X POST http://34.55.113.9:3001/api/auth/register ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\":\"admin@helpdesk.com\",\"password\":\"AdminPassword123!\",\"role\":\"admin\"}"
echo.

echo Method 2: Use the Frontend Registration
echo ----------------------------------------
echo 1. Go to: http://34.55.113.9:8080
echo 2. Look for a "Register" or "Sign Up" link
echo 3. Create an account with:
echo    - Email: admin@helpdesk.com
echo    - Password: AdminPassword123!
echo    - Role: admin (if available in UI)
echo.

echo Recommended Admin Credentials:
echo Email: admin@helpdesk.com
echo Password: AdminPassword123!
echo.

echo.
echo Would you like me to create the admin user for you? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    echo.
    echo Creating admin user...
    curl -X POST http://34.55.113.9:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@helpdesk.com\",\"password\":\"AdminPassword123!\",\"role\":\"admin\"}"
    echo.
    echo.
    echo Admin user created! You can now login with:
    echo Email: admin@helpdesk.com
    echo Password: AdminPassword123!
)

echo.
pause
