@echo off
echo Testing Admin Login and Email Service...

REM Login and capture token
echo Getting JWT token...
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d @admin-login.json > token-response.json

REM Extract token using PowerShell
powershell -Command "(Get-Content token-response.json | ConvertFrom-Json).token" > token.txt
set /p TOKEN=<token.txt

echo Token obtained: %TOKEN:~0,50%...

REM Test email service
echo Testing email service...
curl -X POST http://localhost:3001/api/tickets/admin/test-email ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"testEmail\":\"admin@example.com\"}"

echo.
echo Test completed!
pause
