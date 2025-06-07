# ✅ GitHub Secrets Configuration Checklist

## 🎯 **Repository URL**

https://github.com/kovendhan5/Helpdesk-Ticketing-System

## 📍 **Navigation Path**

Repository → Settings → Secrets and variables → Actions → New repository secret

## 📋 **Required Secrets (3 total)**

### ✅ Secret 1: SSH_PRIVATE_KEY

- **Name**: `SSH_PRIVATE_KEY` (exact case)
- **Value**: Get from VM with `cat ~/.ssh/id_rsa`
- **Must include**:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  [key content]
  -----END OPENSSH PRIVATE KEY-----
  ```
- **Common mistakes**:
  - ❌ Missing BEGIN/END lines
  - ❌ Extra spaces or newlines
  - ❌ Copying only part of the key

### ✅ Secret 2: VM_HOST

- **Name**: `VM_HOST` (exact case)
- **Value**: `34.173.186.108`
- **Common mistakes**:
  - ❌ Adding http:// prefix
  - ❌ Adding port numbers
  - ❌ Wrong IP address

### ✅ Secret 3: VM_USER

- **Name**: `VM_USER` (exact case)
- **Value**: `kovendhan2535`
- **Common mistakes**:
  - ❌ Using "ubuntu" instead
  - ❌ Adding @ symbol
  - ❌ Wrong case/spelling

## 🔍 **Verification Steps**

After adding all secrets:

1. **Check secrets list**: You should see all 3 secrets listed
2. **Test deployment**: Actions → "🚀 Deploy Helpdesk System" → Run workflow
3. **Watch logs**: Look for "SSH connection successful!"

## 🚨 **If SSH Still Fails**

**Most likely cause**: SSH_PRIVATE_KEY is incorrect

**Solution**:

1. Delete the SSH_PRIVATE_KEY secret
2. Get fresh key from VM: `cat ~/.ssh/id_rsa`
3. Copy EXACTLY (no extra spaces)
4. Re-add the secret
5. Try deployment again

## 📞 **Success Indicators**

✅ No more "Permission denied" errors  
✅ SSH connection successful message  
✅ Repository cloned successfully  
✅ Containers starting

**Once configured correctly, deployment takes ~5 minutes!**
