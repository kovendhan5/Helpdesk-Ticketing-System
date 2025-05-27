@echo off
setlocal enabledelayedexpansion

echo 🔐 Helpdesk Ticketing System - Secure Setup
echo ============================================

REM Check if .env exists
if exist ".env" (
    echo ⚠️  .env file already exists. This will create .env.new to avoid overwriting.
    set ENV_FILE=.env.new
) else (
    set ENV_FILE=.env
)

echo 📝 Creating secure environment configuration...

REM Generate secure database password (using PowerShell)
echo 🔒 Generating secure database password...
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(25,5)"') do set DB_PASSWORD=%%i

REM Generate secure JWT secret (using PowerShell)
echo 🔑 Generating secure JWT secret...
for /f %%i in ('powershell -command "$bytes = New-Object byte[] 64; [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes); [Convert]::ToHex($bytes) -join ''"') do set JWT_SECRET=%%i

REM Create .env file
(
echo # 🔐 Helpdesk Ticketing System - Environment Variables
echo # Generated on: %date% %time%
echo # ⚠️  NEVER commit this file to version control!
echo.
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=helpdesk_db
echo DB_USER=postgres
echo DB_PASSWORD=!DB_PASSWORD!
echo.
echo # JWT Configuration ^(Auto-generated secure secret^)
echo JWT_SECRET=!JWT_SECRET!
echo.
echo # Session Configuration
echo SESSION_TIMEOUT=3600000
echo MAX_LOGIN_ATTEMPTS=5
echo LOCKOUT_TIME=900000
echo.
echo # Admin Configuration
echo ADMIN_EMAIL=admin@yourcompany.com
echo.
echo # Production Database ^(uncomment and configure for production^)
echo # DB_HOST=your_cloud_sql_host
echo # DB_USER=your_production_db_user
echo # DB_PASSWORD=your_production_db_password
) > !ENV_FILE!

echo ✅ Environment file created: !ENV_FILE!
echo.
echo 📋 Configuration Summary:
echo Database Password: !DB_PASSWORD!
echo JWT Secret: Generated (64 bytes)
echo.
echo ⚠️  IMPORTANT SECURITY NOTES:
echo 1. Keep your .env file secure and never commit it to version control
echo 2. Change the ADMIN_EMAIL to your actual email
echo 3. For production, use a managed database service
echo 4. Regularly rotate your JWT secret
echo.
echo 🚀 Next Steps:
echo 1. Review and update the !ENV_FILE! file
echo 2. Run: docker-compose up -d postgres
echo 3. Run: npm run setup-db-secure (in backend directory)
echo 4. Run: docker-compose up
echo.
echo ✅ Setup complete! Your system is now configured securely.

pause
