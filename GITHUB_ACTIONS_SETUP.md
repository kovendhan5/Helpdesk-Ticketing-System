# GitHub Actions Setup Guide

## 🔧 Required GitHub Secrets

To enable automated deployment, you need to add these secrets to your GitHub repository:

### 1. SSH Private Key
- **Name**: `GCP_SSH_PRIVATE_KEY`
- **Value**: Contents of your `production_key` file

### 2. Environment Variables (Optional but Recommended)
- **Name**: `DB_PASSWORD`
- **Value**: Strong database password
- **Name**: `JWT_SECRET` 
- **Value**: Long random string for JWT signing
- **Name**: `REDIS_PASSWORD`
- **Value**: Strong Redis password

## 📝 How to Add Secrets:

### Step 1: Copy SSH Private Key
```cmd
type production_key
```
Copy the entire output (including BEGIN/END lines)

### Step 2: Add to GitHub
1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret from the list above

### Step 3: Generate Strong Passwords
Run this script to generate secure values:

```cmd
generate-secrets.bat
```

## 🚀 Automated Deployment Features:

✅ **Triggers**: Automatically deploys on push to main branch  
✅ **Manual Deploy**: Can be triggered manually from GitHub Actions tab  
✅ **SSH Connection**: Secure connection to your GCP VM  
✅ **Health Checks**: Verifies deployment success  
✅ **Rollback**: Stops old containers before deploying new ones  
✅ **Notifications**: Shows deployment status  

## 🎯 Workflow Process:

1. **Code Push** → GitHub detects changes
2. **SSH Setup** → Establishes secure connection
3. **Code Deploy** → Clones latest code to server
4. **Environment** → Sets up configuration
5. **Docker Build** → Builds and starts containers
6. **Verification** → Tests that everything works
7. **Notification** → Reports success/failure

## 🔄 How to Use:

### Automatic Deployment:
- Just push code to the main branch
- GitHub Actions will automatically deploy

### Manual Deployment:
1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
2. Click "Automated Helpdesk Deployment"
3. Click "Run workflow"
4. Click "Run workflow" button

## 🛡️ Security Features:

- SSH key stored securely in GitHub Secrets
- Environment variables encrypted
- No sensitive data in code
- Automatic cleanup of temporary files
