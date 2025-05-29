# 🎯 FINAL STEP: Configure GitHub Secrets for Auto-Deployment

## ✅ Status: Code Pushed to GitHub - Ready for Secret Configuration

All CI/CD pipeline code has been successfully pushed to GitHub! The final step is to configure the GitHub secrets to enable automated deployment.

## 🔗 Repository Access
**GitHub Repository**: https://github.com/kovendhan5/Helpdesk-Ticketing-System

The repository now contains:
- ✅ Complete CI/CD pipeline (`.github/workflows/ci-cd.yml`)
- ✅ Updated package.json files with test scripts
- ✅ Frontend test file for CI compatibility
- ✅ Comprehensive documentation
- ✅ Verification scripts

## 🔐 Required GitHub Secrets Setup

### Step 1: Access GitHub Secrets
1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System
2. Click **Settings** (in the repository, not your profile)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Required Secrets

#### Secret #1: SSH_PRIVATE_KEY
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Copy the entire content of your SSH private key
- **To get the value**:
  ```bash
  cd "k:\Devops\Helpdesk-Ticketing-System\terraform"
  type helpdesk-key
  ```
- **Format**: Should look like:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn
  [... many lines of key data ...]
  -----END OPENSSH PRIVATE KEY-----
  ```

#### Secret #2: VM_IP
- **Name**: `VM_IP`
- **Value**: `YOUR_VM_IP_HERE`
- **Description**: Your GCP VM's public IP address

#### Secret #3: SLACK_WEBHOOK (Optional)
- **Name**: `SLACK_WEBHOOK`
- **Value**: Your Slack webhook URL (if you want notifications)
- **Format**: `https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK`

### Step 3: Verify Secrets
After adding all secrets, you should see:
- ✅ SSH_PRIVATE_KEY (Hidden value)
- ✅ VM_IP (Hidden value) 
- ✅ SLACK_WEBHOOK (Hidden value, optional)

## 🖥️ VM Preparation Commands

Before the first automated deployment, you need to prepare your VM. Copy and run these commands:

### SSH into Your VM
```bash
ssh -i "k:\Devops\Helpdesk-Ticketing-System\terraform\helpdesk-key" ubuntu@YOUR_VM_IP_HERE
```

### Run VM Setup Commands
```bash
# Create application directory
sudo mkdir -p /opt/helpdesk
sudo chown ubuntu:ubuntu /opt/helpdesk
cd /opt/helpdesk

# Create production environment file
cat > .env << 'EOF'
# Database Configuration (Replace with actual values)
DB_HOST=YOUR_DATABASE_IP_HERE
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=YOUR_SECURE_DATABASE_PASSWORD_HERE

# JWT Configuration (Replace with actual JWT secret)
JWT_SECRET=YOUR_256_BIT_JWT_SECRET_HERE
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

# Install PM2 globally
sudo npm install -g pm2

# Install nginx
sudo apt update
sudo apt install -y nginx

# Configure nginx
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

# Set up PM2 startup
pm2 startup
# IMPORTANT: Run the command that PM2 outputs (it will be sudo systemctl enable pm2-ubuntu)

# Exit VM
exit
```

## 🚀 Test Your Automated Deployment

Once secrets are configured and VM is prepared:

### Trigger First Automated Deployment
```bash
cd "k:\Devops\Helpdesk-Ticketing-System"

# Make a small test change
echo "# Testing CI/CD Pipeline" >> README.md

# Commit and push to trigger deployment
git add README.md
git commit -m "test: Trigger first automated deployment"
git push origin main
```

### Monitor Deployment
1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
2. Watch the workflow "🚀 Helpdesk CI/CD Pipeline"
3. Click on the running workflow to see detailed logs

### Verify Deployment Success
- **Backend Health**: http://YOUR_VM_IP_HERE:3000/api/health
- **Frontend**: http://YOUR_VM_IP_HERE/

## 📊 What Happens During Deployment

### Pipeline Stages (5-8 minutes total)
1. **🧪 Test Stage** (2-3 min)
   - Install dependencies
   - Run unit tests
   - Perform linting
   - Security audit

2. **🏗️ Build Stage** (1-2 min)
   - Build React frontend
   - Create production artifacts

3. **🚀 Deploy Stage** (2-3 min)
   - SSH into VM
   - Backup current app
   - Clone latest code
   - Install dependencies
   - Start with PM2
   - Update nginx

4. **🏥 Health Check** (30 sec)
   - Verify backend API
   - Check frontend access

## 🎉 Success Indicators

### In GitHub Actions
- ✅ All jobs show green checkmarks
- ✅ "Deploy to Production" completed successfully
- ✅ Health checks passed

### In Your Application
- ✅ Backend responds: http://YOUR_VM_IP_HERE:3000/api/health
- ✅ Frontend loads: http://YOUR_VM_IP_HERE/
- ✅ You can register/login successfully

## 🚨 Troubleshooting

### If Deployment Fails
1. Check GitHub Actions logs for error details
2. Verify all secrets are correctly set
3. Confirm VM is accessible via SSH
4. Check VM disk space: `df -h`

### Common Issues
- **SSH Connection Failed**: Verify SSH_PRIVATE_KEY secret
- **VM_IP Incorrect**: Check terraform output for current IP
- **Permission Denied**: Ensure ubuntu user owns /opt/helpdesk
- **Port Conflicts**: Check if services are already running

## 📞 Support
- **Documentation**: Check `GITHUB-ACTIONS-SETUP.md` for detailed setup
- **Verification**: Run `verify-cicd.bat` to check configuration
- **Logs**: Available in GitHub Actions and via SSH to VM

---

## 🎯 Next Action Required

**Configure GitHub Secrets**: Follow Step 1-3 above to add the required secrets, then test your first automated deployment!

🚀 **Your enterprise-grade CI/CD pipeline is ready for action!**
