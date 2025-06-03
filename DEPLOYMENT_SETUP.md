# Deployment Setup Guide

## Required GitHub Secrets

You need to set these secrets in your GitHub repository for deployment to work:

### 1. VM_IP (Server IP Address)
**Where to find it:**
- **AWS EC2**: Go to EC2 Dashboard → Instances → Select your instance → Copy "Public IPv4 address"
- **Google Cloud**: Go to Compute Engine → VM instances → Copy "External IP"
- **Azure**: Go to Virtual Machines → Select VM → Copy "Public IP address"
- **DigitalOcean**: Go to Droplets → Select droplet → Copy "Public IP"
- **Vultr/Linode**: Check your server dashboard for public IP

### 2. SSH_PRIVATE_KEY (SSH Private Key)
**Where to find it:**
- This is usually stored in `~/.ssh/id_rsa` or `~/.ssh/id_ed25519` on your local machine
- Or you might have downloaded it when creating your server

**To get the private key content:**
```bash
# On Windows (if you have WSL or Git Bash):
cat ~/.ssh/id_rsa

# Or if using PuTTY, convert .ppk to OpenSSH format:
# Use PuTTYgen to export as OpenSSH key
```

## Setting GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - Name: `VM_IP`, Value: `your.server.ip.address`
   - Name: `SSH_PRIVATE_KEY`, Value: `your-private-key-content`

## Server Requirements

Your server needs:
- Ubuntu 18.04+ or similar Linux distribution
- Docker and Docker Compose installed
- SSH access enabled
- Ports 3000 and 3001 open for web traffic
- User `ubuntu` with sudo privileges

## Testing Connection

You can test if your secrets work by trying to SSH manually:
```bash
ssh -i /path/to/your/private/key ubuntu@YOUR_VM_IP
```

## Current Deployment Status

Once secrets are configured, every push to `main` branch will:
1. Build your application
2. Deploy to your server
3. Start all containers (PostgreSQL, Backend, Frontend)
4. Show access URLs in the deployment logs
