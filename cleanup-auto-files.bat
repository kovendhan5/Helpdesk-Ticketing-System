@echo off
REM Prevent Auto-Generated Files Script
REM Run this script if unwanted documentation files are recreated

echo Removing auto-generated documentation files...

cd /d "k:\Devops\Helpdesk-Ticketing-System"

REM Remove auto-generated markdown files
if exist "CICD-*.md" del /Q "CICD-*.md"
if exist "COMMIT-*.md" del /Q "COMMIT-*.md"
if exist "CREDENTIAL-*.md" del /Q "CREDENTIAL-*.md"
if exist "DEPLOYMENT-*.md" del /Q "DEPLOYMENT-*.md"
if exist "FINAL-*.md" del /Q "FINAL-*.md"
if exist "GITHUB-SECURITY-*.md" del /Q "GITHUB-SECURITY-*.md"
if exist "INFRASTRUCTURE-*.md" del /Q "INFRASTRUCTURE-*.md"
if exist "QUICK-*.md" del /Q "QUICK-*.md"
if exist "SECURITY-SUMMARY.md" del /Q "SECURITY-SUMMARY.md"
if exist "SETUP-*.md" del /Q "SETUP-*.md"

REM Remove any files ending with these patterns
for %%f in (*-READY.md *-COMPLETE.md *-FINAL.md *-REPORT.md *-STEPS.md) do (
    if exist "%%f" del /Q "%%f"
)

REM Remove batch files that might be auto-generated
if exist "remove-emojis.bat" del /Q "remove-emojis.bat"
if exist "setup-secure.bat" del /Q "setup-secure.bat"
if exist "setup-secure.sh" del /Q "setup-secure.sh"
if exist ".env" del /Q ".env"

REM Clean terraform directory
cd terraform 2>nul && (
    if exist "COST-*.md" del /Q "COST-*.md"
    if exist "DEPLOY*.md" del /Q "DEPLOY*.md"
    if exist "MINIMAL-*.md" del /Q "MINIMAL-*.md"
    if exist "SETUP-*.md" del /Q "SETUP-*.md"
    if exist "*.bat" del /Q "*.bat"
    cd ..
)

echo ✅ Auto-generated files removed!
echo ℹ️  These files are now in .gitignore to prevent recreation
echo.
echo To permanently stop this:
echo 1. Check VS Code extensions (GitHub Copilot, CodeGPT, etc.)
echo 2. Disable auto-documentation features in AI assistants
echo 3. Check workspace settings for auto-generation
echo.
pause
