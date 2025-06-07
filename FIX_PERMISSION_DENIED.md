# 🔧 FIX SSH Permission Denied - Step by Step

## ✅ **Good News!**

The workflow is progressing! It found `docker-compose.prod.yml` and is now trying to SSH to your VM. The error `Permission denied (publickey)` means GitHub Secrets need to be configured.

## 🚨 **IMMEDIATE FIX NEEDED**

### Step 1: Get SSH Private Key from VM

**Since you can only access VM via Google Cloud Console:**

1. **Open Google Cloud Console** in your browser
2. **Go to Compute Engine** → **VM instances**
3. **Find your VM** (`helpdesk-vm`)
4. **Click the "SSH" button** (opens browser terminal)
5. **In the browser terminal, run:**
   ```bash
   cat ~/.ssh/id_rsa
   ```
6. **Copy the ENTIRE output** - it should look like:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAA...
   [many lines of random characters]
   ...
   -----END OPENSSH PRIVATE KEY-----
   ```

### Step 2: Configure GitHub Secrets

1. **Open GitHub repository**: https://github.com/kovendhan5/Helpdesk-Ticketing-System
2. **Click "Settings"** (top navigation bar)
3. **Click "Secrets and variables"** → **"Actions"** (left sidebar)
4. **Add/Update these 3 secrets:**

#### Secret 1: SSH_PRIVATE_KEY

- Click **"New repository secret"**
- Name: `SSH_PRIVATE_KEY`
- Value: **Paste the entire output from step 1** (including BEGIN/END lines)
- Click **"Add secret"**

#### Secret 2: VM_HOST

- Click **"New repository secret"**
- Name: `VM_HOST`
- Value: `34.173.186.108`
- Click **"Add secret"**

#### Secret 3: VM_USER

- Click **"New repository secret"**
- Name: `VM_USER`
- Value: `kovendhan2535`
- Click **"Add secret"**

### Step 3: Verify Secrets Are Set

After adding all 3 secrets, you should see them listed in the repository secrets:

- ✅ SSH_PRIVATE_KEY
- ✅ VM_HOST
- ✅ VM_USER

### Step 4: Run Deployment

1. **Go to "Actions" tab** in GitHub
2. **Click "🚀 Deploy Helpdesk System"** workflow
3. **Click "Run workflow"** → **"Run workflow"**
4. **Monitor the logs** - should now show:
   ```
   ✅ SSH connection successful to kovendhan2535@34.173.186.108
   ```

## 🎯 **Expected Success**

Once secrets are configured correctly:

```
🔍 Validating GitHub Secrets...
✅ All required secrets are configured
🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
SSH connection successful!
📥 Cloning repository...
✅ docker-compose.prod.yml found
🐳 Building and starting containers...
✅ Deployment successful!
```

## 🌐 **Application Will Be Live At**

- **Frontend**: http://34.173.186.108:3001
- **API**: http://34.173.186.108:3001/api

## 🆘 **If Still Getting Permission Denied**

1. **Double-check SSH private key**: Make sure you copied the ENTIRE key including BEGIN/END lines
2. **Verify VM_USER**: Must be exactly `kovendhan2535` (not ubuntu)
3. **Check key permissions**: The key we generated should work with GitHub Actions

**The workflow is working perfectly - just need to configure the GitHub Secrets!**
