# 🚀 GCP VM Deployment Instructions

## Target VM: helpdesk-vm (kovendhan2535@helpdesk-vm)

Your Helpdesk Ticketing System deployment package is ready! Follow these steps to deploy to your GCP VM.

## 📦 Deployment Package Created

The `temp_deploy` folder contains all necessary files configured for VM: **helpdesk-vm**

## Deployment Steps

### Step 1: Transfer Files to VM

Choose one of these methods to transfer the `temp_deploy` folder to your VM:

**Option A - Using SCP (Recommended):**

```bash
scp -r temp_deploy kovendhan2535@helpdesk-vm:~/helpdesk-deploy
```

**Option B - Using WinSCP or GUI tool:**

- Connect to helpdesk-vm
- Upload temp_deploy folder as 'helpdesk-deploy'

**Option C - Using Google Cloud Console:**

- Zip the temp_deploy folder
- Upload via GCP Console file transfer

### Step 2: SSH into Your VM

```bash
ssh kovendhan2535@helpdesk-vm
```

### Step 3: Run Deployment Script

```bash
cd ~/helpdesk-deploy
chmod +x deploy-production.sh
sudo ./deploy-production.sh
```

### Step 4: Start the Application

```bash
chmod +x gcp-vm-deploy.sh
./gcp-vm-deploy.sh
```

### Step 5: Configure GCP Firewall

Run this command from your local machine (with gcloud CLI):

```bash
gcloud compute firewall-rules create helpdesk-http \
  --allow tcp:80,tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP traffic for Helpdesk app"
```

## 🌐 Access Your Application

Once deployment is complete, access your application at:

- **Frontend:** http://34.173.186.108
- **API:** http://34.173.186.108:3001/api
- **Health Check:** http://34.173.186.108:3001/api/health

## 🔐 Default Login Credentials

- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

⚠️ **Important:** Change these passwords after first login!

## 🔧 Additional Scripts Included

- `configure-firewall.sh` - Sets up GCP firewall rules
- `deploy-on-vm.bat` - Alternative deployment commands
- `gcp-vm-deploy.sh` - Comprehensive VM deployment script

## 📊 Monitoring Commands

After deployment, use these commands to monitor your application:

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://34.173.186.108/health
curl http://34.173.186.108:3001/api/health
```

## 🎉 Success!

Your enterprise-grade Helpdesk Ticketing System with real-time WebSocket updates will be live at **http://34.173.186.108** once deployment completes!

---

**Need help?** Check the PRODUCTION_DEPLOYMENT_GUIDE.md for detailed troubleshooting information.
