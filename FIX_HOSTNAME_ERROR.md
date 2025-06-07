# 🚨 URGENT FIX: "Could not resolve hostname" Error

## ❌ **Error Meaning**

```
ssh: Could not resolve hostname : Name or service not known
```

This means the `VM_HOST` GitHub Secret is **NOT SET** or is **EMPTY**.

## 🎯 **IMMEDIATE FIX REQUIRED**

### GitHub Secrets Are Missing!

The GitHub Actions workflow is trying to connect to your VM but the secrets are not configured.

## 📋 **Step-by-Step Fix (5 minutes)**

### Step 1: Open GitHub Repository

**URL**: https://github.com/kovendhan5/Helpdesk-Ticketing-System

### Step 2: Navigate to Secrets

1. Click **"Settings"** tab (top navigation)
2. Click **"Secrets and variables"** (left sidebar)
3. Click **"Actions"**
4. Click **"New repository secret"**

### Step 3: Add Required Secrets

#### Secret 1: VM_HOST

- **Name**: `VM_HOST`
- **Value**: `34.173.186.108`
- Click **"Add secret"**

#### Secret 2: VM_USER

- **Name**: `VM_USER`
- **Value**: `kovendhan2535`
- Click **"Add secret"**

#### Secret 3: SSH_PRIVATE_KEY

- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Get from your VM (see instructions below)
- Click **"Add secret"**

### Step 4: Get SSH Private Key from VM

**Since you can only access VM via Google Cloud Console:**

1. **Open Google Cloud Console** in browser
2. **Go to Compute Engine** → **VM instances**
3. **Find helpdesk-vm** and click **"SSH"**
4. **In the browser terminal, run:**
   ```bash
   cat ~/.ssh/id_rsa
   ```
5. **Copy the ENTIRE output** including:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [key content]
   -----END OPENSSH PRIVATE KEY-----
   ```

### Step 5: Verify All Secrets Are Set

After adding all 3 secrets, you should see:

- ✅ SSH_PRIVATE_KEY
- ✅ VM_HOST
- ✅ VM_USER

### Step 6: Test Deployment Again

1. **Go to "Actions" tab**
2. **Click "🚀 Deploy Helpdesk System"**
3. **Click "Run workflow"** → **"Run workflow"**

## ✅ **Expected Success**

After configuring secrets, you should see:

```
🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
SSH connection successful!
```

## 🆘 **Common Mistakes**

❌ **Wrong VM_HOST values:**

- Don't use: `helpdesk-vm` (hostname)
- Don't use: `http://34.173.186.108`
- ✅ **Use**: `34.173.186.108` (IP only)

❌ **Wrong VM_USER values:**

- Don't use: `ubuntu`
- Don't use: `kovendhan2535@helpdesk-vm`
- ✅ **Use**: `kovendhan2535` (username only)

❌ **SSH_PRIVATE_KEY mistakes:**

- Don't copy only part of the key
- Don't add extra spaces/newlines
- ✅ **Copy the complete key** with BEGIN/END lines

## 🚀 **Once Fixed**

Your deployment will proceed and the helpdesk system will be live at:
**http://34.173.186.108:3001**

**The workflow is working perfectly - just need to configure the GitHub Secrets!**
