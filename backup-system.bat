@echo off
echo.
echo ===============================================
echo   💾 Helpdesk System - Database Backup
echo ===============================================
echo.

REM Create backup directory with timestamp
set backup_dir=backups\%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set backup_dir=%backup_dir: =0%
mkdir %backup_dir% 2>nul

echo 📁 Backup directory: %backup_dir%

REM Database backup
echo.
echo 🗄️  Creating database backup...
docker-compose exec -T postgres pg_dump -U postgres helpdesk > %backup_dir%\database.sql
if %errorlevel% equ 0 (
    echo ✅ Database backup created: %backup_dir%\database.sql
) else (
    echo ❌ Database backup failed
    goto end
)

REM Backend logs backup
echo.
echo 📄 Backing up logs...
docker-compose logs backend > %backup_dir%\backend.log 2>&1
docker-compose logs frontend > %backup_dir%\frontend.log 2>&1
docker-compose logs postgres > %backup_dir%\postgres.log 2>&1

echo ✅ Logs backed up to %backup_dir%

REM Configuration backup
echo.
echo ⚙️  Backing up configuration...
copy .env %backup_dir%\.env.backup 2>nul
copy docker-compose.yml %backup_dir%\docker-compose.yml.backup 2>nul

echo ✅ Configuration backed up

echo.
echo ===============================================
echo   🎉 Backup Complete!
echo ===============================================
echo.
echo 📁 Backup location: %backup_dir%
echo 📋 Files backed up:
dir /b %backup_dir%

:end
echo.
pause
