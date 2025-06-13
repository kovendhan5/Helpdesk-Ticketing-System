@echo off
echo Testing user creation...

echo Creating admin user...
powershell -Command "$body = @{email='admin@helpdesk.com'; password='AdminPassword123!'; role='admin'} | ConvertTo-Json; Invoke-RestMethod -Uri 'http://34.55.113.9:3001/api/auth/register' -Method POST -ContentType 'application/json' -Body $body"

echo.
echo Creating test user...
powershell -Command "$body = @{email='user@helpdesk.com'; password='UserPassword123!'; role='user'} | ConvertTo-Json; Invoke-RestMethod -Uri 'http://34.55.113.9:3001/api/auth/register' -Method POST -ContentType 'application/json' -Body $body"

pause
