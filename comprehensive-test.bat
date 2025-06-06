@echo off
echo ================================================================
echo           HELPDESK TICKETING SYSTEM - FUNCTIONALITY TEST
echo ================================================================
echo.

REM Test 1: Health Check
echo [1/6] Testing API Health Check...
curl -s http://localhost:3001/health | find "healthy" >nul
if %errorlevel%==0 (
    echo     ✅ API Health Check: PASSED
) else (
    echo     ❌ API Health Check: FAILED
)
echo.

REM Test 2: Admin Login
echo [2/6] Testing Admin Authentication...
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d @admin-login.json > test-token.json
findstr "token" test-token.json >nul
if %errorlevel%==0 (
    echo     ✅ Admin Login: PASSED
    REM Extract token for further tests
    powershell -Command "(Get-Content test-token.json | ConvertFrom-Json).token" > admin-token.txt
) else (
    echo     ❌ Admin Login: FAILED
    type test-token.json
    goto :end
)
echo.

REM Test 3: User Registration
echo [3/6] Testing User Registration...
echo {"email":"testuser@example.com","password":"TempPass123!@#","role":"user"} > new-user.json
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d @new-user.json > register-result.json
findstr "successfully" register-result.json >nul
if %errorlevel%==0 (
    echo     ✅ User Registration: PASSED
) else (
    echo     ❌ User Registration: FAILED (might already exist)
    type register-result.json
)
echo.

REM Test 4: Ticket Creation
echo [4/6] Testing Ticket Creation...
set /p ADMIN_TOKEN=<admin-token.txt
echo {"subject":"Test Support Ticket","message":"This is a test ticket to verify functionality","priority":"medium","category":"technical"} > test-ticket.json
curl -s -X POST http://localhost:3001/api/tickets -H "Content-Type: application/json" -H "Authorization: Bearer %ADMIN_TOKEN%" -d @test-ticket.json > ticket-result.json
findstr "id" ticket-result.json >nul
if %errorlevel%==0 (
    echo     ✅ Ticket Creation: PASSED
    powershell -Command "(Get-Content ticket-result.json | ConvertFrom-Json).ticket.id" > ticket-id.txt
) else (
    echo     ❌ Ticket Creation: FAILED
    type ticket-result.json
)
echo.

REM Test 5: Ticket Listing
echo [5/6] Testing Ticket Listing...
curl -s -X GET http://localhost:3001/api/tickets -H "Authorization: Bearer %ADMIN_TOKEN%" > tickets-list.json
findstr "tickets" tickets-list.json >nul
if %errorlevel%==0 (
    echo     ✅ Ticket Listing: PASSED
) else (
    echo     ❌ Ticket Listing: FAILED
    type tickets-list.json
)
echo.

REM Test 6: Email Service Test
echo [6/6] Testing Email Service...
curl -s -X POST http://localhost:3001/api/tickets/admin/test-email -H "Content-Type: application/json" -H "Authorization: Bearer %ADMIN_TOKEN%" -d "{\"testEmail\":\"admin@example.com\"}" > email-test.json
findstr -i "success\|mock" email-test.json >nul
if %errorlevel%==0 (
    echo     ✅ Email Service: PASSED (Mock/Development mode)
) else (
    echo     ❌ Email Service: FAILED
    type email-test.json
)
echo.

echo ================================================================
echo                         TEST SUMMARY
echo ================================================================
echo Frontend URL: http://localhost:3000
echo Backend API:  http://localhost:3001
echo.
echo Admin Credentials:
echo Email: admin@example.com
echo Pass:  0z=D*0f4NxW4aWp^
echo.
echo User Credentials:
echo Email: user@example.com  
echo Pass:  Uf14B+j4J>Sb.u0D
echo ================================================================

:end
REM Cleanup
del test-token.json new-user.json test-ticket.json ticket-result.json register-result.json tickets-list.json email-test.json admin-token.txt ticket-id.txt 2>nul
echo.
echo Test completed! Press any key to continue...
pause >nul
