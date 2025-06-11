@echo off
echo.
echo ===============================================
echo   🔗 GCP SSH Connection Test
echo ===============================================
echo.

set GCP_VM_IP=34.173.186.108
set GCP_VM_USER=kovendhan2535

echo Testing SSH connection to GCP VM...
echo VM IP: %GCP_VM_IP%
echo User: %GCP_VM_USER%
echo.

REM Test SSH connection
echo 🔍 Testing SSH connection...
ssh -o ConnectTimeout=10 -o BatchMode=yes %GCP_VM_USER%@%GCP_VM_IP% "echo 'SSH connection successful!'"

if %errorlevel% equ 0 (
    echo ✅ SSH connection: SUCCESS
    echo.
    
    echo 🐳 Checking Docker on remote VM...
    ssh %GCP_VM_USER%@%GCP_VM_IP% "docker --version"
    
    if %errorlevel% equ 0 (
        echo ✅ Docker is installed on VM
    ) else (
        echo ❌ Docker not found on VM - will be installed during deployment
    )
    
    echo.
    echo 📊 VM System Info:
    ssh %GCP_VM_USER%@%GCP_VM_IP% "uname -a && df -h / && free -h"
    
) else (
    echo ❌ SSH connection: FAILED
    echo.
    echo 🔧 Troubleshooting steps:
    echo 1. Ensure your SSH key is added to ~/.ssh/authorized_keys on the VM
    echo 2. Check if the VM is running and accessible
    echo 3. Verify firewall allows SSH (port 22)
    echo 4. Test manual connection: ssh %GCP_VM_USER%@%GCP_VM_IP%
    echo.
    echo 🔑 To set up SSH key:
    echo 1. Generate key: ssh-keygen -t rsa -b 4096
    echo 2. Copy public key to VM: ssh-copy-id %GCP_VM_USER%@%GCP_VM_IP%
    echo 3. Add private key content to GitHub Secret: GCP_SSH_PRIVATE_KEY
)

echo.
echo ===============================================
pause
