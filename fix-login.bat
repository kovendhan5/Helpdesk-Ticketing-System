@echo off
echo =============================================
echo   CREATE WORKING USER ACCOUNTS
echo =============================================

echo Creating admin user with strong password...
curl -X POST http://34.44.106.65:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@helpdesk.com\",\"password\":\"AdminPassword123!\",\"role\":\"admin\"}"

echo.
echo.
echo Creating test user with strong password...
curl -X POST http://34.44.106.65:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@helpdesk.com\",\"password\":\"TestPassword123!\",\"role\":\"user\"}"

echo.
echo.
echo =============================================
echo   LOGIN CREDENTIALS
echo =============================================
echo Admin Account:
echo   Email: admin@helpdesk.com
echo   Password: AdminPassword123!
echo.
echo Test Account:
echo   Email: test@helpdesk.com
echo   Password: TestPassword123!
echo =============================================

pause
