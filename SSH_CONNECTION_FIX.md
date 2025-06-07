# 🔧 SSH Connection Fix - Step-by-Step Solution

## 🚨 Current Problem Analysis

Based on your GitHub Actions log, the SSH connection is failing with these specific issues:

```
debug1: Authenticating to ***:22 as 'ubuntu'
ubuntu@***: Permission denied (publickey).
```

**Root Causes:**

1. ❌ **Wrong Username**: Connecting as `ubuntu` instead of `kovendhan2535`
2. ❌ **Missing VM_HOST**: Shows as `***` indicating empty/missing secret
3. ❌ **SSH Key Mismatch**: Authentication failing even with key loaded

## 🔧 IMMEDIATE FIX STEPS

### Step 1: Access Your VM via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/compute/instances)
2. Find your `helpdesk-vm` instance
3. Click the **SSH** button to open browser terminal
4. You should see a terminal like: `kovendhan2535@helpdesk-vm:~$`

### Step 2: Retrieve the Correct SSH Private Key

In the VM terminal, run these commands:

```bash
# Check if the SSH key exists
ls -la ~/key*

# Display the COMPLETE private key
cat ~/key
```

**Copy the ENTIRE output** including:

- `-----BEGIN OPENSSH PRIVATE KEY-----`
- All the key content lines
- `-----END OPENSSH PRIVATE KEY-----`

### Step 3: Verify SSH Key Setup on VM

While in the VM terminal, also run:

```bash
# Check if public key is properly set up
cat ~/.ssh/authorized_keys

# If empty or missing, add the public key:
cat ~/key.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Test the key locally (should work)
ssh -i ~/key kovendhan2535@localhost "echo 'Local SSH test successful'"
```

### Step 4: Configure GitHub Secrets CORRECTLY

1. Go to your GitHub repository: https://github.com/kovendhan5/Helpdesk-Ticketing-System
2. Click **Settings** → **Secrets and variables** → **Actions**
3. **DELETE** any existing secrets if they exist
4. **CREATE** these 3 new secrets:

#### Secret 1: SSH_PRIVATE_KEY

- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Paste the COMPLETE output from `cat ~/key`

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAA...
[Your actual private key content here - multiple lines]
...
-----END OPENSSH PRIVATE KEY-----
```

#### Secret 2: VM_HOST

- **Name**: `VM_HOST`
- **Value**: `34.173.186.108`

#### Secret 3: VM_USER

- **Name**: `VM_USER`
- **Value**: `kovendhan2535`

### Step 5: Configure GCP Firewall (If Not Done)

In Google Cloud Console:

1. Go to **VPC network** → **Firewall**
2. Click **CREATE FIREWALL RULE**
3. Configure:
   - **Name**: `helpdesk-http-traffic`
   - **Direction**: `Ingress`
   - **Action**: `Allow`
   - **Targets**: `Specified target tags`
   - **Target tags**: `http-server`
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: ✅ TCP, Ports: `22,80,3001`
4. Click **CREATE**

5. **Apply tag to your VM**:
   - Go to **Compute Engine** → **VM instances**
   - Click your `helpdesk-vm`
   - Click **EDIT**
   - In **Network tags**, add: `http-server`
   - Click **SAVE**

### Step 6: Test the Fix

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Deploy Helpdesk System**
4. Click **Run workflow** → **Run workflow**
5. Monitor the logs - you should now see:
   ```
   ✅ All required secrets are configured
   🎯 Target server: kovendhan2535@34.173.186.108
   🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
   SSH connection successful!
   ```

## 🔍 Verification Checklist

Before running deployment, verify:

- [ ] SSH private key retrieved from VM using `cat ~/key`
- [ ] GitHub secret `SSH_PRIVATE_KEY` contains complete key with BEGIN/END lines
- [ ] GitHub secret `VM_HOST` = `34.173.186.108` (not empty, not `***`)
- [ ] GitHub secret `VM_USER` = `kovendhan2535` (not `ubuntu`)
- [ ] Public key added to `~/.ssh/authorized_keys` on VM
- [ ] GCP firewall rule created and applied to VM

## 🚨 Common Mistakes to Avoid

1. **Incomplete SSH Key**: Missing the `-----BEGIN` or `-----END` lines
2. **Wrong Username**: Using `ubuntu` instead of `kovendhan2535`
3. **Empty VM_HOST**: Showing as `***` means the secret is empty
4. **Missing Firewall**: VM won't be accessible even with correct SSH
5. **Wrong Key File**: Using a different key than what's in `authorized_keys`

## 🎯 Expected Success Output

After fixing, you should see:

```
🔍 Validating GitHub Secrets...
✅ All required secrets are configured
🎯 Target server: kovendhan2535@34.173.186.108
🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
SSH connection successful!
User: kovendhan2535
Home: /home/kovendhan2535
🔄 Starting deployment process...
```

## 📞 If Still Having Issues

Run this debug command on your VM:

```bash
# Check SSH service and configuration
sudo systemctl status ssh
sudo journalctl -u ssh -n 20

# Test key authentication manually
ssh -i ~/key -v kovendhan2535@localhost
```

The key insight is that your GitHub secrets are likely not configured correctly. The `***` in the logs indicates `VM_HOST` is empty, and the `ubuntu` username suggests `VM_USER` is also not set properly.
