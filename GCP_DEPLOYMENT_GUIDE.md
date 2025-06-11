# 🚀 GCP Production Deployment Setup Guide

## Prerequisites

### 1. GCP VM Setup
- ✅ VM Instance: `34.173.186.108` (us-central1-a)
- ✅ User: `kovendhan2535`
- ✅ SSH access configured
- ✅ Firewall rules for ports 8080, 3001

### 2. Docker Hub Account
- ✅ Username: `kovendhan5`
- ✅ Repositories: `helpdesk-backend`, `helpdesk-frontend`

## 🔧 GitHub Secrets Configuration

You need to set up these secrets in your GitHub repository:

### Go to: Repository → Settings → Secrets and variables → Actions

**Required Secrets:**

1. **`GCP_SSH_PRIVATE_KEY`**
   ```
   Your private SSH key content (the one that matches the public key on your GCP VM)
   ```

2. **`DOCKER_HUB_USERNAME`**
   ```
   kovendhan5
   ```

3. **`DOCKER_HUB_ACCESS_TOKEN`**
   ```
   Your Docker Hub access token (not password)
   ```

4. **`DB_PASSWORD`**
   ```
   A strong database password (32+ characters)
   Example: mU68QoL8YGh/DTWOHBgFHyF2HliCYH5d
   ```

5. **`REDIS_PASSWORD`**
   ```
   A strong Redis password (24+ characters)
   Example: 94ABRM4sG6fppWiIUQRckDIY
   ```

6. **`JWT_SECRET`**
   ```
   A secure JWT secret (64+ characters)
   Example: NKg9g6243cWlnXHbPBT4TC5eBxghgAYIgRl0bTx1I6rkC/f1aetZdx+PEvLCp82p
   ```

## 🔐 Setting Up SSH Access

### 1. Generate SSH Key (if not already done)
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@helpdesk-deploy"
```

### 2. Add Public Key to GCP VM
```bash
# Copy the public key
cat ~/.ssh/id_rsa.pub

# SSH to your GCP VM and add it to authorized_keys
ssh kovendhan2535@34.173.186.108
echo "your-public-key-here" >> ~/.ssh/authorized_keys
```

### 3. Add Private Key to GitHub Secrets
```bash
# Copy the private key content
cat ~/.ssh/id_rsa
# Add this entire content to GCP_SSH_PRIVATE_KEY secret
```

## 🐳 Docker Hub Setup

### 1. Create Access Token
- Go to Docker Hub → Account Settings → Security
- Create new access token
- Save it as `DOCKER_HUB_ACCESS_TOKEN` secret

### 2. Create Repositories
- Create `kovendhan5/helpdesk-backend` repository
- Create `kovendhan5/helpdesk-frontend` repository

## 🚀 Deployment Process

### Manual Trigger
1. Go to GitHub → Actions → "Deploy Helpdesk to GCP Production"
2. Click "Run workflow"
3. Select branch (main/master)
4. Click "Run workflow"

### Automatic Trigger
- Push to `main` or `master` branch
- Create pull request to `main` or `master`

## 🔍 Verification Steps

After deployment, verify:

1. **Frontend:** http://34.173.186.108:8080
2. **Backend API:** http://34.173.186.108:3001
3. **Health Check:** http://34.173.186.108:3001/health

## 🛠️ Troubleshooting

### SSH Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa kovendhan2535@34.173.186.108

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Docker Issues on GCP VM
```bash
# SSH to VM and check Docker
ssh kovendhan2535@34.173.186.108
sudo systemctl status docker
sudo docker ps
sudo docker-compose logs
```

### Firewall Rules
Ensure these ports are open on your GCP VM:
- **8080** - Frontend
- **3001** - Backend API
- **22** - SSH

## 📋 Deployment Checklist

- [ ] GitHub Secrets configured
- [ ] SSH access working
- [ ] Docker Hub repositories created
- [ ] GCP VM firewall rules set
- [ ] Domain/DNS configured (optional)

## 🎯 Next Steps

1. **Configure Secrets** in GitHub repository
2. **Test SSH connection** manually
3. **Run the GitHub Action** workflow
4. **Monitor deployment** in Actions tab
5. **Verify application** is accessible

---

**Ready to deploy?** Push your code to the main branch or trigger the workflow manually!
