# 🔐 GitHub Secrets Setup for GCP Deployment

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### ✅ Already Configured
- **`SSH_PRIVATE_KEY`** - Your GCP VM SSH private key ✅

### 🔧 Additional Secrets Needed

#### Database & Security
```
Secret Name: DB_PASSWORD
Description: PostgreSQL database password
Example: mU68QoL8YGh/DTWOHBgFHyF2HliCYH5d
```

```
Secret Name: JWT_SECRET  
Description: JWT signing secret (64+ characters)
Example: NKg9g6243cWlnXHbPBT4TC5eBxghgAYIgRl0bTx1I6rkC/f1aetZdx+PEvLCp82p
```

```
Secret Name: REDIS_PASSWORD
Description: Redis authentication password
Example: 94ABRM4sG6fppWiIUQRckDIY
```

#### Docker Hub (Optional - for image caching)
```
Secret Name: DOCKER_USERNAME
Description: Your Docker Hub username
Example: yourusername
```

```
Secret Name: DOCKER_PASSWORD
Description: Your Docker Hub password/token
Example: your-docker-token
```

## 🚀 Quick Setup Commands

### Generate Secure Passwords

```bash
# Generate database password (32 characters)
openssl rand -base64 32

# Generate JWT secret (64 characters) 
openssl rand -hex 64

# Generate Redis password (24 characters)
openssl rand -base64 24
```

### Copy Current Values
You can use the same values from your current `.env` file:

```bash
# From your current .env file
DB_PASSWORD=mU68QoL8YGh/DTWOHBgFHyF2HliCYH5d
JWT_SECRET=NKg9g6243cWlnXHbPBT4TC5eBxghgAYIgRl0bTx1I6rkC/f1aetZdx+PEvLCp82p
REDIS_PASSWORD=94ABRM4sG6fppWiIUQRckDIY
```

## 🔍 Verify GCP VM Configuration

Your workflow is configured for:
- **VM IP:** 34.173.186.108
- **VM User:** kovendhan2535
- **VM Zone:** us-central1-a

Make sure your GCP VM:
1. ✅ Has Docker and Docker Compose installed
2. ✅ SSH key is properly configured
3. ✅ Firewall allows ports 8080, 3001
4. ✅ VM has sufficient resources (4GB+ RAM)

## 📋 Setup Checklist

- [ ] Add `DB_PASSWORD` to GitHub Secrets
- [ ] Add `JWT_SECRET` to GitHub Secrets  
- [ ] Add `REDIS_PASSWORD` to GitHub Secrets
- [ ] (Optional) Add Docker Hub credentials
- [ ] Verify SSH key `SSH_PRIVATE_KEY` is working
- [ ] Test GCP VM connectivity
- [ ] Commit and push changes to trigger deployment

## 🚀 Deploy Now

Once all secrets are configured:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: setup GCP deployment with GitHub Actions"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Watch the deployment progress
   - Check logs for any issues

3. **Access your app:**
   - Frontend: http://34.173.186.108:8080
   - Backend: http://34.173.186.108:3001/health

## 🔧 Troubleshooting

### SSH Connection Issues
```bash
# Test SSH manually
ssh -i ~/.ssh/your-key kovendhan2535@34.173.186.108
```

### Docker Issues on VM
```bash
# Install Docker on Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### View Deployment Logs
- GitHub Actions → Your workflow run → View logs
- On VM: `docker-compose logs -f`

---
**Ready to deploy?** Add the missing secrets and push to `main` branch! 🚀
