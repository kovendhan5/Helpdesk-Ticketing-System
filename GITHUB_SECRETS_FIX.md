# 🔧 GitHub Secrets Configuration Fix

## ❌ Issue Identified

The SSH debug output shows GitHub Actions is trying to authenticate as 'ubuntu' instead of 'kovendhan2535':

```
debug1: Authenticating to ***:22 as 'ubuntu'
```

## 🎯 Root Cause

Either the GitHub Secrets are not set correctly, or there are workflow files with hardcoded 'ubuntu' references.

## ✅ Steps Completed

1. **Fixed deploy-fixed.yml**: Replaced all hardcoded 'ubuntu' references with `${{ secrets.VM_USER }}`
2. **Disabled auto-trigger**: Changed deploy-fixed.yml to manual trigger only
3. **Verified main deploy.yml**: Confirmed it properly uses `${{ secrets.VM_USER }}`

## 🚀 Next Steps to Fix

### Step 1: Verify SSH Key Content

On the VM, ensure you have the private key content:

```bash
cat ~/.ssh/id_rsa
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

### Step 2: Configure GitHub Secrets

Go to your GitHub repository: https://github.com/kovendhan5/Helpdesk-Ticketing-System

1. **Navigate to Secrets**:

   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"

2. **Set Required Secrets**:

   **SSH_PRIVATE_KEY**:

   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [Your complete private key from ~/.ssh/id_rsa]
   -----END OPENSSH PRIVATE KEY-----
   ```

   **VM_HOST**:

   ```
   34.173.186.108
   ```

   **VM_USER**:

   ```
   kovendhan2535
   ```

### Step 3: Test the Deployment

1. Go to "Actions" tab in GitHub
2. Click "🚀 Deploy Helpdesk System" workflow
3. Click "Run workflow" → "Run workflow"
4. Monitor the logs for successful SSH connection

## 🔍 How to Verify Secrets are Set

In the GitHub Actions workflow logs, you should see:

```
🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
SSH connection successful!
```

If you still see 'ubuntu' in the logs, the VM_USER secret is incorrectly set.

## 🛠️ Troubleshooting

### If SSH still fails:

1. **Check VM SSH service**:

   ```bash
   sudo systemctl status ssh
   sudo systemctl start ssh
   ```

2. **Verify authorized_keys**:

   ```bash
   cat ~/.ssh/authorized_keys
   # Should contain the public key
   ```

3. **Check key permissions**:
   ```bash
   chmod 600 ~/.ssh/id_rsa
   chmod 644 ~/.ssh/id_rsa.pub
   chmod 700 ~/.ssh
   chmod 644 ~/.ssh/authorized_keys
   ```

### If container startup fails:

1. **Check Docker service**:

   ```bash
   sudo systemctl status docker
   sudo systemctl start docker
   ```

2. **Check firewall ports**:
   ```bash
   sudo ufw status
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 3001
   ```

## 🎯 Expected Result

After fixing the secrets, the GitHub Actions deployment should:

1. ✅ Successfully connect via SSH as 'kovendhan2535'
2. ✅ Deploy Docker containers
3. ✅ Start the helpdesk system on port 3001
