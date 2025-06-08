# 🔍 SSH CONNECTION ISSUE FIX GUIDE

## ❌ **PROBLEM**

GitHub Actions is failing with:

```
Permission denied (publickey)
Error: Process completed with exit code 255
```

This means the SSH connection from GitHub Actions to your VM is not working.

## 🔍 **DIAGNOSIS**

The issue is likely one of:

1. **SSH Private Key Issue**: Key in GitHub Secrets is incorrect
2. **Public Key Issue**: Public key not properly configured on VM
3. **SSH Configuration**: SSH service or configuration problem on VM

## ✅ **SOLUTION STEPS**

### **Step 1: Regenerate SSH Keys on VM**

SSH into your VM and run:

```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_actions_key

# Display the private key (copy this to GitHub Secrets)
echo "=== COPY THIS PRIVATE KEY TO GITHUB SECRETS ==="
cat ~/.ssh/github_actions_key
echo "=== END OF PRIVATE KEY ==="
```

### **Step 2: Update GitHub Secrets**

1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions
2. Click on **SSH_PRIVATE_KEY**
3. Click **"Update"**
4. Paste the entire private key (including `-----BEGIN` and `-----END` lines)
5. Click **"Update secret"**

### **Step 3: Verify Other Secrets**

Make sure these are correct:

- **VM_HOST**: `34.173.186.108`
- **VM_USER**: `kovendhan2535`
- **SSH_PRIVATE_KEY**: The new private key from Step 1

### **Step 4: Test SSH Connection**

1. Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
2. Find **"🔍 SSH Connection Diagnostic"** workflow
3. Click "Run workflow" → Select "main" branch → Click "Run workflow"
4. Check if the connection test passes

### **Step 5: Run Production Deployment**

Once SSH test passes:

1. Run **"🚀 Production Deployment (Docker Ready)"** workflow
2. Should now work without SSH errors

## 🔧 **ALTERNATIVE: Quick SSH Key Reset**

If you want to start fresh, run this on your VM:

```bash
# Remove old keys
rm -f ~/.ssh/github_actions_key*

# Generate new key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N ""

# Setup authorized_keys properly
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Fix permissions
chmod 600 ~/.ssh/authorized_keys ~/.ssh/github_actions_key
chmod 700 ~/.ssh

# Show private key for GitHub Secrets
echo "Copy this private key to GitHub Secrets:"
echo "========================================"
cat ~/.ssh/github_actions_key
echo "========================================"
```

## 🧪 **TEST SSH CONNECTION MANUALLY**

From your local machine, test if the key works:

```bash
# Test SSH with the new key (if you have it locally)
ssh -i path/to/github_actions_key kovendhan2535@34.173.186.108

# Should connect without password
```

## ⚠️ **COMMON ISSUES**

1. **Wrong Key Format**: Make sure to copy the ENTIRE private key including headers
2. **Line Breaks**: Ensure no extra spaces or line breaks when pasting to GitHub
3. **Permissions**: SSH keys must have correct permissions (600/700)
4. **Multiple Keys**: Make sure the public key is actually in authorized_keys

## 🚀 **EXPECTED RESULT**

After fixing:

- ✅ SSH Connection Diagnostic workflow passes
- ✅ Production Deployment workflow runs successfully
- ✅ Application deploys to VM
- ✅ Containers start properly

The SSH fix should resolve the GitHub Actions deployment issue!
