# 🚀 GitHub Actions CI/CD Setup Guide

## Overview
This guide will help you set up the automated CI/CD pipeline for the Helpdesk Ticketing System using GitHub Actions. The pipeline will automatically test, build, and deploy your application to GCP whenever you push to the main branch.

## 📋 Prerequisites

✅ **Repository**: Code pushed to GitHub (`https://github.com/kovendhan5/Helpdesk-Ticketing-System.git`)  
✅ **GCP Infrastructure**: VM and database deployed via Terraform  
✅ **SSH Access**: SSH key pair generated and VM accessible  
✅ **Manual Deployment**: Application manually deployed and tested once  

## 🔐 Required GitHub Secrets

### Step 1: Get Your SSH Private Key
```bash
# On your local machine, copy the private key content
cd terraform
cat helpdesk-key
```

### Step 2: Get Your VM IP Address
```bash
# From terraform directory
terraform output vm_external_ip
```
**Note**: Copy this IP address (currently: `YOUR_VM_IP_HERE`)

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/kovendhan5/Helpdesk-Ticketing-System`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:

| Secret Name | Description | Value Source |
|-------------|-------------|--------------|
| `SSH_PRIVATE_KEY` | SSH private key for VM access | Content of `terraform/helpdesk-key` file |
| `VM_IP` | Public IP address of GCP VM | Output from `terraform output vm_external_ip` |
| `SLACK_WEBHOOK` | (Optional) Slack webhook for notifications | Your Slack webhook URL |

### Step 4: Required Secret Values

#### SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
[Copy the entire private key content from terraform/helpdesk-key]
-----END OPENSSH PRIVATE KEY-----
```

#### VM_IP
```
YOUR_VM_IP_HERE
```

#### SLACK_WEBHOOK (Optional)
```
https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 📁 Pre-Deployment Setup on VM

### Step 1: Prepare VM for Auto-Deployment
SSH into your VM and create the deployment structure:

```bash
# SSH into your VM
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP_HERE

# Create application directory
sudo mkdir -p /opt/helpdesk
sudo chown ubuntu:ubuntu /opt/helpdesk
cd /opt/helpdesk

# Create environment file for production
cat > .env << 'EOF'
# Database Configuration
DB_HOST=YOUR_DATABASE_IP_HERE
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=STRONG_PASSWORD_HERE

# JWT Configuration  
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_ISSUER=helpdesk-system
JWT_AUDIENCE=helpdesk-users
JWT_EXPIRES_IN=1h

# Security Configuration
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# Server Configuration
PORT=3000
NODE_ENV=production
EOF

# Install PM2 globally for process management
sudo npm install -g pm2

# Install and configure nginx
sudo apt update
sudo apt install -y nginx

# Configure nginx for the frontend
sudo tee /etc/nginx/sites-available/helpdesk << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Set up PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

exit
```

## 🚀 CI/CD Pipeline Features

### Automated Testing
- ✅ **Unit Tests**: Runs tests for both backend and frontend
- ✅ **Linting**: Code quality checks
- ✅ **Security Audit**: npm audit for vulnerabilities
- ✅ **Coverage Reports**: Test coverage tracking

### Automated Building
- ✅ **Frontend Build**: React production build
- ✅ **Artifact Storage**: Build artifacts saved temporarily
- ✅ **Node.js Caching**: Faster builds with dependency caching

### Automated Deployment
- ✅ **Zero-Downtime**: Graceful application restarts
- ✅ **Backup Creation**: Automatic backup before deployment
- ✅ **Health Checks**: Verify deployment success
- ✅ **Rollback Support**: Quick rollback on failure

### Security Features
- ✅ **SSH Key Authentication**: Secure VM access
- ✅ **Environment Variables**: Secure configuration management
- ✅ **Secret Management**: GitHub secrets integration
- ✅ **Audit Logging**: Deployment tracking

## 🔄 Deployment Process

### Trigger: Push to Main Branch
```bash
git add .
git commit -m "Deploy: Updated application"
git push origin main
```

### Pipeline Execution
1. **Test Stage** (2-3 minutes)
   - Install dependencies
   - Run unit tests
   - Perform security audit
   - Check code quality

2. **Build Stage** (1-2 minutes)
   - Build React frontend
   - Optimize for production
   - Create deployment artifacts

3. **Deploy Stage** (2-3 minutes)
   - SSH into production VM
   - Stop current application
   - Backup existing code
   - Deploy new version
   - Start application with PM2
   - Update nginx with new frontend

4. **Health Check** (30 seconds)
   - Verify backend API health
   - Check frontend accessibility
   - Confirm all services running

### Total Deployment Time: ~5-8 minutes

## 📊 Monitoring & Notifications

### GitHub Actions Dashboard
- View deployment status in real-time
- Access build logs and error messages
- Monitor test results and coverage

### Health Endpoints
- **Backend**: `http://YOUR_VM_IP:3000/api/health`
- **Frontend**: `http://YOUR_VM_IP/`

### Slack Notifications (Optional)
Receive deployment notifications in Slack:
- ✅ Successful deployments
- ❌ Failed deployments
- 🔄 Rollback notifications

## 🚨 Emergency Rollback

### Automatic Rollback
The pipeline automatically creates backups and can rollback on failure.

### Manual Rollback
1. Go to GitHub Actions
2. Select "Rollback Deployment" workflow
3. Click "Run workflow"
4. Confirm rollback

### SSH Rollback
```bash
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP
cd /opt/helpdesk

# List available backups
ls -la helpdesk-ticketing-system.backup.*

# Stop current app
pm2 stop helpdesk-backend

# Restore backup (replace with actual backup name)
rm -rf helpdesk-ticketing-system
cp -r helpdesk-ticketing-system.backup.YYYYMMDD_HHMMSS helpdesk-ticketing-system

# Restart app
cd helpdesk-ticketing-system/backend
pm2 start src/index.js --name "helpdesk-backend"
pm2 save
```

## 📈 Performance Optimization

### Caching
- npm dependency caching
- Node.js version caching
- Build artifact caching

### Parallel Execution
- Frontend and backend tests run in parallel
- Multiple test environments supported

### Resource Optimization
- Production-only dependencies
- Optimized Docker images
- Minimal build artifacts

## 🔧 Troubleshooting

### Common Issues

#### SSH Connection Failed
```bash
# Check VM status
gcloud compute instances list --project=avian-lane-461116-f1

# Test SSH connection locally
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP
```

#### Deployment Failed
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test SSH connection manually
4. Check VM disk space: `df -h`

#### Health Check Failed
```bash
# SSH into VM and check services
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP

# Check PM2 status
pm2 status

# Check application logs
pm2 logs helpdesk-backend

# Check nginx status
sudo systemctl status nginx
```

#### Database Connection Issues
```bash
# Test database connectivity
cd /opt/helpdesk/helpdesk-ticketing-system/backend
node -e "
import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  host: 'YOUR_DB_IP',
  port: 5432,
  database: 'helpdesk_db',
  user: 'helpdesk_user',
  password: 'YOUR_DB_PASSWORD'
});
client.connect().then(() => console.log('✅ DB Connected')).catch(console.error);
"
```

## 🎯 Next Steps

1. **Push Code to GitHub**: Commit and push all changes
2. **Add GitHub Secrets**: Configure the required secrets
3. **Test Manual Deployment**: Ensure manual deployment works
4. **Trigger First Auto-Deployment**: Push a change to main branch
5. **Monitor Pipeline**: Watch the GitHub Actions workflow
6. **Verify Deployment**: Check application functionality
7. **Set Up Monitoring**: Configure alerts and notifications

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [GCP Compute Engine](https://cloud.google.com/compute/docs)

---

🚀 **Ready for Automated Deployment!** Your CI/CD pipeline is configured and ready to deploy your Helpdesk Ticketing System automatically on every push to main branch.
