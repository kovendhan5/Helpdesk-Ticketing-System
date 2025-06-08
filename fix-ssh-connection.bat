@echo off
echo.
echo 🔧 SSH Connection Fix Instructions
echo ===================================
echo.
echo The GitHub Actions SSH connection is failing because the SSH keys
echo don't match between your VM and GitHub Secrets.
echo.
echo 📋 QUICK FIX STEPS:
echo.
echo 1️⃣ SSH into your VM:
echo    ssh kovendhan2535@34.173.186.108
echo.
echo 2️⃣ Run the SSH key regeneration script:
echo    ./regenerate-ssh-keys.sh
echo.
echo 3️⃣ Copy the private key output and update GitHub Secrets:
echo    - Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions
echo    - Click on "SSH_PRIVATE_KEY" -^> "Update"
echo    - Paste the ENTIRE private key (including headers)
echo    - Click "Update secret"
echo.
echo 4️⃣ Test the fix:
echo    - Run "🔍 SSH Connection Diagnostic" workflow in GitHub Actions
echo    - Should show ✅ if SSH is working
echo.
echo 5️⃣ Deploy your application:
echo    - Run "🚀 Production Deployment (Docker Ready)" workflow
echo    - Should complete successfully
echo.
echo 🎯 ROOT CAUSE:
echo The SSH public key on your VM doesn't match the private key in GitHub Secrets.
echo This is common when keys are regenerated or secrets are updated incorrectly.
echo.
echo ⚠️ IMPORTANT:
echo - Copy the COMPLETE private key including -----BEGIN and -----END lines
echo - Don't add extra spaces or modify the key in any way
echo - The key should be exactly as output by the script
echo.
echo Press any key to open GitHub Secrets page...
pause >nul
start https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions
echo.
echo Press any key to open GitHub Actions page...
pause >nul
start https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
