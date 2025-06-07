# 🚨 SSH Connection Troubleshooting Guide

## 🔍 Issue Analysis

Based on the GitHub Actions log, the SSH connection is failing with these specific issues:

### 1. **Username Mismatch**

```
debug1: Authenticating to ***:22 as 'ubuntu'
```

❌ **Problem**: The connection is trying to authenticate as `ubuntu` instead of `kovendhan2535`

### 2. **Authentication Failure**

```
debug1: Authentications that can continue: publickey
ubuntu@***: Permission denied (publickey).
```

❌ **Problem**: The SSH key authentication is failing

## 🔧 Immediate Fix Steps

### Step 1: Verify GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

**Check these 3 secrets exist and have correct values:**

1. **SSH_PRIVATE_KEY**

   - Should contain the COMPLETE private key from the VM
   - Get it by running on VM: `cat ~/key`
   - Must include `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines

2. **VM_HOST**

   - Should be: `34.173.186.108`
   - NOT `***` (this suggests the secret is empty or not set)

3. **VM_USER**
   - Should be: `kovendhan2535`
   - NOT `ubuntu`

### Step 2: Retrieve SSH Private Key from VM

**Access your VM via Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Compute Engine** → **VM instances**
3. Click **SSH** button next to `helpdesk-vm`
4. In the browser SSH terminal, run:

```bash
# Display the private key
cat ~/key
```

**Copy the ENTIRE output** and paste it as the `SSH_PRIVATE_KEY` secret in GitHub.

### Step 3: Verify SSH Key on VM

In the VM SSH terminal, also verify the key setup:

```bash
# Check if public key is in authorized_keys
cat ~/.ssh/authorized_keys

# Check key permissions
ls -la ~/.ssh/
ls -la ~/key*

# If the key isn't in authorized_keys, add it:
cat ~/key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 4: Test SSH Connection Locally

From the VM, test the SSH key works:

```bash
# Test the key locally
ssh -i ~/key kovendhan2535@localhost "echo 'Local SSH test successful'"
```

## 🔄 Quick Resolution Checklist

- [ ] **VM_HOST** secret = `34.173.186.108`
- [ ] **VM_USER** secret = `kovendhan2535`
- [ ] **SSH_PRIVATE_KEY** secret = Complete private key from `cat ~/key`
- [ ] Public key added to `~/.ssh/authorized_keys` on VM
- [ ] SSH key permissions: `chmod 600 ~/.ssh/authorized_keys`

## 🚀 After Fixing Secrets

1. Go to GitHub repository → **Actions**
2. Click **Deploy Helpdesk System**
3. Click **Run workflow** → **Run workflow**
4. Monitor the deployment progress

## 🔍 Additional Debugging

If issues persist, check:

```bash
# On VM - Check SSH service status
sudo systemctl status ssh

# Check SSH configuration
sudo nano /etc/ssh/sshd_config
# Ensure: PubkeyAuthentication yes

# Restart SSH service if needed
sudo systemctl restart ssh

# Check SSH logs
sudo journalctl -u ssh -f
```

## 📋 Expected Result

Once fixed, you should see:

```
✅ SSH connection successful!
🔄 Starting deployment process...
📥 Cloning repository...
```

The key issue is likely that your **VM_HOST** secret shows as `***` in the logs, indicating it's either empty or not properly set. Make sure all 3 secrets are configured exactly as specified above.
