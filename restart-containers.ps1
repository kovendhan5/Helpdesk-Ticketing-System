# PowerShell script to restart helpdesk containers
Write-Host "=== Helpdesk Docker Container Management ===" -ForegroundColor Green

Write-Host "Checking current container status..." -ForegroundColor Yellow
docker ps -a | Where-Object { $_ -match "helpdesk" }

Write-Host "`nStopping running containers..." -ForegroundColor Yellow
docker stop helpdesk-backend helpdesk-postgres helpdesk-frontend 2>$null

Write-Host "`nRemoving stopped containers..." -ForegroundColor Yellow  
docker rm helpdesk-backend helpdesk-postgres helpdesk-frontend 2>$null

Write-Host "`nChanging to project directory..." -ForegroundColor Yellow
Set-Location "k:\Devops\testpage\Helpdesk-Ticketing-System"

Write-Host "`nStarting containers with docker-compose..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "`nWaiting for containers to start..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "`nChecking container status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`nChecking backend logs..." -ForegroundColor Yellow
docker-compose logs backend --tail 20

Write-Host "`nSetup completed!" -ForegroundColor Green
