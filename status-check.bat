@echo off
echo Checking deployment status...

echo [1] Checking if repository was cloned...
ssh -i production_key helpdesk-production-user-2025@34.55.113.9 "ls -la helpdesk-app 2>/dev/null || echo 'Directory not found'"

echo.
echo [2] Checking Docker containers...
ssh -i production_key helpdesk-production-user-2025@34.55.113.9 "sudo docker ps"

echo.
echo [3] Checking Docker Compose status...
ssh -i production_key helpdesk-production-user-2025@34.55.113.9 "cd helpdesk-app 2>/dev/null && sudo docker-compose ps || echo 'Cannot access helpdesk-app directory'"

echo.
echo [4] Testing application endpoints...
curl -I http://34.55.113.9:8080 2>/dev/null || echo "Frontend not responding"
curl -I http://34.55.113.9:3001 2>/dev/null || echo "Backend not responding"

pause
