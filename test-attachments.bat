@echo off
echo ================================================================
echo         TESTING FILE ATTACHMENT FUNCTIONALITY
echo ================================================================
echo.

REM Create a test file
echo This is a test file for attachment functionality > test-attachment.txt

REM Login and get token
echo [1/4] Getting admin authentication token...
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d @admin-login.json > token-response.json
powershell -Command "(Get-Content token-response.json | ConvertFrom-Json).token" > token.txt
set /p TOKEN=<token.txt
echo     ✅ Token obtained

REM Create a test ticket
echo.
echo [2/4] Creating test ticket...
echo {"subject":"File Attachment Test","message":"Testing file attachment functionality","priority":"medium","category":"technical"} > test-ticket-attach.json
curl -s -X POST http://localhost:3001/api/tickets -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d @test-ticket-attach.json > ticket-attach-result.json
powershell -Command "(Get-Content ticket-attach-result.json | ConvertFrom-Json).ticket.id" > ticket-id.txt
set /p TICKET_ID=<ticket-id.txt
echo     ✅ Test ticket created (ID: %TICKET_ID%)

REM Upload file attachment
echo.
echo [3/4] Testing file upload...
curl -s -X POST http://localhost:3001/api/tickets/%TICKET_ID%/attachments -H "Authorization: Bearer %TOKEN%" -F "file=@test-attachment.txt" > upload-result.json
findstr "successfully" upload-result.json >nul
if %errorlevel%==0 (
    echo     ✅ File upload: PASSED
) else (
    echo     ❌ File upload: FAILED
    type upload-result.json
)

REM Test attachment listing
echo.
echo [4/4] Testing attachment listing...
curl -s -X GET http://localhost:3001/api/tickets/%TICKET_ID%/attachments -H "Authorization: Bearer %TOKEN%" > attachments-list.json
findstr "test-attachment" attachments-list.json >nul
if %errorlevel%==0 (
    echo     ✅ Attachment listing: PASSED
) else (
    echo     ❌ Attachment listing: FAILED
    type attachments-list.json
)

echo.
echo ================================================================
echo                     ATTACHMENT TEST SUMMARY
echo ================================================================
echo Ticket URL: http://localhost:3000/tickets/%TICKET_ID%
echo Backend uploads folder should contain the test file
echo ================================================================

REM Cleanup
del token-response.json token.txt test-ticket-attach.json ticket-attach-result.json ticket-id.txt upload-result.json attachments-list.json test-attachment.txt 2>nul
echo.
echo Test completed! Press any key to continue...
pause >nul
