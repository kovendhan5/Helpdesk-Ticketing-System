# 🚀 Final Deployment Steps - GitHub Secrets & Production Deployment

## 📊 Current Status

✅ **Complete**: Application development, Docker containerization, GitHub Actions workflow  
✅ **Complete**: SSH key pair generated on VM (kovendhan2535@helpdesk-vm)  
✅ **Complete**: SSH configuration completed on VM  
✅ **Complete**: Docker configurations fixed  
🔄 **NEXT**: Configure GitHub Secrets and execute deployment

## 🔑 Step 1: Configure GitHub Secrets

Since you can only access the VM via Google Cloud Console browser, you'll need to retrieve the SSH private key from the VM and configure GitHub secrets.

### Access VM via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Compute Engine** → **VM instances**
3. Click **SSH** button next to your `helpdesk-vm` instance
4. This will open a browser-based SSH terminal

### Retrieve SSH Private Key from VM

```bash
# In the VM SSH terminal, display the private key
cat ~/key

# Copy the ENTIRE output (including -----BEGIN and -----END lines)
```

### Configure GitHub Repository Secrets

1. Go to your GitHub repository: https://github.com/kovendhan5/Helpdesk-Ticketing-System
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret** and add these three secrets:

#### Secret 1: SSH_PRIVATE_KEY

- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Paste the entire content from `cat ~/key` command above
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  [Your private key content here]
  -----END OPENSSH PRIVATE KEY-----
  ```

#### Secret 2: VM_HOST

- **Name**: `VM_HOST`
- **Value**: `34.173.186.108`

#### Secret 3: VM_USER

- **Name**: `VM_USER`
- **Value**: `kovendhan2535`

## 🔥 Step 2: Configure GCP Firewall Rules

### Enable HTTP Traffic

1. In Google Cloud Console, go to **VPC network** → **Firewall**
2. Click **Create Firewall Rule**
3. Configure:
   - **Name**: `helpdesk-http-traffic`
   - **Direction**: `Ingress`
   - **Action**: `Allow`
   - **Targets**: `Specified target tags`
   - **Target tags**: `http-server`
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: Check **TCP**, enter `80, 3001`
4. Click **Create**

### Apply Firewall Tag to VM

1. Go to **Compute Engine** → **VM instances**
2. Click on your `helpdesk-vm` instance
3. Click **Edit**
4. In **Network tags**, add: `http-server`
5. Click **Save**

## 🚀 Step 3: Execute Deployment

### Automatic Deployment (Recommended)

1. Make a small change to trigger deployment (or use manual trigger)
2. Go to your GitHub repository
3. Click **Actions** tab
4. Click **Deploy Helpdesk System** workflow
5. Click **Run workflow** → **Run workflow**
6. Monitor the deployment progress in real-time

### Manual Verification

Once deployment completes, verify:

- **Frontend**: http://34.173.186.108
- **Backend API**: http://34.173.186.108:3001/health

## 🏥 Step 4: System Health Check

### Test User Accounts

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

### Features to Test

✅ User login/registration  
✅ Create new tickets  
✅ Real-time ticket updates (WebSocket)  
✅ Admin ticket management  
✅ Dashboard statistics  
✅ Responsive design

## 🔧 Step 5: Post-Deployment Configuration

### Optional SSL Setup (Production Enhancement)

```bash
# On VM (if you want HTTPS)
sudo apt update
sudo apt install certbot nginx
sudo certbot --nginx -d your-domain.com
```

### Monitoring Setup

```bash
# Check container status
docker ps -a

# View logs
docker-compose -f /opt/helpdesk/docker-compose.prod.yml logs -f

# Check resource usage
docker stats
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. GitHub Actions Secret Validation Fails**

```
❌ SSH_PRIVATE_KEY secret is not set
```

→ Ensure you copied the complete private key with BEGIN/END lines

**2. SSH Connection Refused**

```
Connection refused to 34.173.186.108
```

→ Verify firewall rules allow SSH (port 22) and HTTP (ports 80, 3001)

**3. Application Not Accessible**

```
This site can't be reached
```

→ Check GCP firewall rules and VM network tags

**4. Docker Build Fails**

```
Docker build failed
```

→ Check VM has sufficient resources (CPU/Memory)

### Health Check Commands (Run on VM)

```bash
# Container status
docker ps -a

# Application logs
docker logs helpdesk-frontend-prod
docker logs helpdesk-backend-prod
docker logs helpdesk-postgres-prod

# Network connectivity
curl -I http://localhost:80
curl -I http://localhost:3001/health

# Database connection
docker exec helpdesk-postgres-prod psql -U helpdesk_user -d helpdesk_db -c "\dt"
```

## 📋 Final Checklist

- [ ] SSH private key retrieved from VM
- [ ] GitHub secrets configured (SSH_PRIVATE_KEY, VM_HOST, VM_USER)
- [ ] GCP firewall rules created and applied
- [ ] GitHub Actions deployment executed
- [ ] Application accessible at http://34.173.186.108
- [ ] User authentication working
- [ ] WebSocket real-time updates functional
- [ ] Admin dashboard operational

## 🎯 Expected Results

After successful deployment:

- **Frontend**: Accessible at http://34.173.186.108
- **Backend API**: Accessible at http://34.173.186.108:3001
- **Real-time updates**: WebSocket connections working
- **Database**: PostgreSQL operational with initialized schema
- **Security**: Enterprise-grade authentication and authorization
- **Monitoring**: Docker health checks and logging

## 🔄 Future CI/CD Workflow

Once setup is complete:

1. Make code changes locally
2. Push to GitHub `main` branch
3. GitHub Actions automatically deploys to production
4. Zero-downtime rolling updates
5. Automatic rollback on failure

---

**Next Action**: Configure the 3 GitHub secrets, then trigger deployment via GitHub Actions workflow.
