@echo off
echo Setting up GCP firewall rules...

echo Creating rule for frontend port 8080...
gcloud compute firewall-rules create helpdesk-frontend-access --allow tcp:8080 --source-ranges 0.0.0.0/0 --description "Helpdesk Frontend Access"

echo Creating rule for backend port 3001...  
gcloud compute firewall-rules create helpdesk-backend-access --allow tcp:3001 --source-ranges 0.0.0.0/0 --description "Helpdesk Backend Access"

echo Firewall rules created!
pause
