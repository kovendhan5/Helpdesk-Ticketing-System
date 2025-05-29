@echo off
echo ===============================================
echo DEPLOYING MINIMAL HELPDESK INFRASTRUCTURE
echo ===============================================
echo.
echo This will deploy:
echo - 1 VM (e2-micro with ephemeral IP)
echo - 1 Database (db-f1-micro PostgreSQL) - helpdesk-db-minimal
echo - 1 Firewall rule (SSH, HTTP, Backend)
echo.
echo Estimated cost: $8-12/month
echo.
echo Fixed: Using unique database name to avoid conflicts
echo.
echo Starting deployment...
echo.

terraform apply -auto-approve

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================
    echo DEPLOYMENT SUCCESSFUL!
    echo ===============================================
    echo.
    echo Your infrastructure is ready:
    terraform output
    echo.
    echo Next steps:
    echo 1. SSH into your VM using the command above
    echo 2. Clone your application repository
    echo 3. Configure environment variables
    echo 4. Deploy your Helpdesk application
    echo.
) else (
    echo.
    echo ===============================================
    echo DEPLOYMENT FAILED!
    echo ===============================================
    echo.
    echo Check the error messages above and try again.
    echo.
)

pause
