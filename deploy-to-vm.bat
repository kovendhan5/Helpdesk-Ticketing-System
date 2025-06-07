@echo off
REM Production Deployment Script for GCP VM: helpdesk-vm
REM This script deploys the Helpdesk Ticketing System to your GCP VM

echo ============================================
echo    Helpdesk System - GCP VM Deployment
echo    Target VM: helpdesk-vm
echo ============================================
echo.

REM Color setup
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo %BLUE%Starting deployment to GCP VM...%NC%
echo.

REM Check if required files exist
if not exist "docker-compose.prod.yml" (
    echo %RED%Error: docker-compose.prod.yml not found!%NC%
    echo Please make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Step 1: Copy deployment files to VM
echo %BLUE%Step 1: Copying deployment files to VM...%NC%
echo.

REM Create deployment package
echo Creating deployment package...
mkdir temp_deploy 2>nul
xcopy /E /I /H /Y backend temp_deploy\backend
xcopy /E /I /H /Y frontend temp_deploy\frontend
copy docker-compose.prod.yml temp_deploy\
copy .env.production temp_deploy\.env
copy deploy-production.sh temp_deploy\
copy gcp-vm-deploy.sh temp_deploy\

echo %GREEN%Deployment package created in temp_deploy folder%NC%
echo.

REM Step 2: Instructions for manual transfer
echo %YELLOW%Step 2: Manual deployment steps:%NC%
echo.
echo 1. Transfer the temp_deploy folder to your VM using one of these methods:
echo.
echo    Option A - Using SCP (if you have SSH client):
echo    scp -r temp_deploy kovendhan2535@34.173.186.108:~/helpdesk-deploy
echo.
echo    Option B - Using WinSCP or similar GUI tool:
echo    - Connect to 34.173.186.108
echo    - Upload temp_deploy folder as 'helpdesk-deploy'
echo.
echo    Option C - Using Google Cloud Console:
echo    - Zip the temp_deploy folder
echo    - Upload via GCP Console file transfer
echo.

echo 2. SSH into your VM:
echo    ssh kovendhan2535@34.173.186.108
echo.

echo 3. Run the deployment script on the VM:
echo    cd ~/helpdesk-deploy
echo    chmod +x deploy-production.sh
echo    sudo ./deploy-production.sh
echo.

echo 4. Start the application:
echo    chmod +x gcp-vm-deploy.sh
echo    ./gcp-vm-deploy.sh
echo.

echo 5. Configure GCP firewall (if not already done):
echo    gcloud compute firewall-rules create helpdesk-http --allow tcp:80,tcp:3001 --source-ranges 0.0.0.0/0
echo.

echo 6. Access your application:
echo    Frontend: http://34.173.186.108
echo    API: http://34.173.186.108:3001/api
echo.

REM Step 3: Create quick deployment script for VM
echo %BLUE%Step 3: Creating VM deployment script...%NC%

echo @echo off > temp_deploy\deploy-on-vm.bat
echo echo Starting Helpdesk deployment on VM... >> temp_deploy\deploy-on-vm.bat
echo. >> temp_deploy\deploy-on-vm.bat
echo REM Update system and install Docker >> temp_deploy\deploy-on-vm.bat
echo sudo apt update ^&^& sudo apt upgrade -y >> temp_deploy\deploy-on-vm.bat
echo curl -fsSL https://get.docker.com -o get-docker.sh >> temp_deploy\deploy-on-vm.bat
echo sudo sh get-docker.sh >> temp_deploy\deploy-on-vm.bat
echo sudo usermod -aG docker $USER >> temp_deploy\deploy-on-vm.bat
echo. >> temp_deploy\deploy-on-vm.bat
echo REM Install Docker Compose >> temp_deploy\deploy-on-vm.bat
echo sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose >> temp_deploy\deploy-on-vm.bat
echo sudo chmod +x /usr/local/bin/docker-compose >> temp_deploy\deploy-on-vm.bat
echo. >> temp_deploy\deploy-on-vm.bat
echo REM Deploy application >> temp_deploy\deploy-on-vm.bat
echo docker-compose -f docker-compose.prod.yml --env-file .env up -d >> temp_deploy\deploy-on-vm.bat
echo. >> temp_deploy\deploy-on-vm.bat
echo echo Deployment complete! >> temp_deploy\deploy-on-vm.bat
echo echo Frontend: http://34.173.186.108 >> temp_deploy\deploy-on-vm.bat
echo echo API: http://34.173.186.108:3001/api >> temp_deploy\deploy-on-vm.bat

echo %GREEN%VM deployment script created: temp_deploy\deploy-on-vm.bat%NC%
echo.

REM Step 4: Create firewall configuration
echo %BLUE%Step 4: Creating firewall configuration script...%NC%

echo #!/bin/bash > temp_deploy\configure-firewall.sh
echo # Configure GCP firewall for Helpdesk application >> temp_deploy\configure-firewall.sh
echo echo "Configuring GCP firewall rules..." >> temp_deploy\configure-firewall.sh
echo. >> temp_deploy\configure-firewall.sh
echo # Allow HTTP traffic >> temp_deploy\configure-firewall.sh
echo gcloud compute firewall-rules create helpdesk-http --allow tcp:80,tcp:3001 --source-ranges 0.0.0.0/0 --description "Helpdesk HTTP traffic" >> temp_deploy\configure-firewall.sh
echo. >> temp_deploy\configure-firewall.sh
echo # Allow SSH (if not already configured) >> temp_deploy\configure-firewall.sh
echo gcloud compute firewall-rules create helpdesk-ssh --allow tcp:22 --source-ranges 0.0.0.0/0 --description "SSH access" >> temp_deploy\configure-firewall.sh
echo. >> temp_deploy\configure-firewall.sh
echo echo "Firewall rules configured successfully!" >> temp_deploy\configure-firewall.sh

echo %GREEN%Firewall configuration script created: temp_deploy\configure-firewall.sh%NC%
echo.

REM Step 5: Summary
echo %GREEN%============================================%NC%
echo %GREEN%    Deployment Package Ready!%NC%
echo %GREEN%============================================%NC%
echo.
echo %YELLOW%Next Steps:%NC%
echo 1. Transfer 'temp_deploy' folder to your VM at 34.173.186.108
echo 2. SSH into the VM and run the deployment scripts
echo 3. Configure firewall rules if needed
echo 4. Access your application at http://34.173.186.108
echo.
echo %BLUE%Default login credentials:%NC%
echo Admin: admin@example.com / admin123
echo User: user@example.com / user123
echo.

echo Press any key to continue...
pause >nul

REM Optional: Open file explorer to temp_deploy folder
start explorer temp_deploy

echo %GREEN%Deployment preparation complete!%NC%
echo.
