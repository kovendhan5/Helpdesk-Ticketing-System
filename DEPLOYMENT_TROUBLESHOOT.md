# 🚨 Deployment Troubleshooting

## ❌ **Current Issue: SSH Setup Failure in GitHub Actions**

Your deployment failed at the SSH setup step. This indicates missing or misconfigured GitHub secrets.

---

## 🔧 **Quick Fix Tools**

### **Run These Scripts for Automated Help:**

1. **`troubleshoot-deployment.bat`** - Complete deployment diagnosis
2. **`generate-github-secrets.bat`** - Generate secure passwords for missing secrets
3. **`troubleshoot-gcp-vm.sh`** - Test GCP VM connectivity

---

## 🔧 **Manual Fix Steps**

### 1. **Add Missing GitHub Secrets**

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each of these secrets:

#### Required Secrets:
```
Secret Name: SSH_PRIVATE_KEY
Secret Value: [Your complete SSH private key - including BEGIN/END lines]
Status: ❓ (Verify it's properly formatted)

Secret Name: DB_PASSWORD  
Secret Value: [Generate with generate-github-secrets.bat]
Status: ❌ MISSING

Secret Name: JWT_SECRET
Secret Value: [Generate with generate-github-secrets.bat]
Status: ❌ MISSING

Secret Name: REDIS_PASSWORD
Secret Value: [Generate with generate-github-secrets.bat]
Status: ❌ MISSING
```

### 2. **Validate Secrets (Optional)**
Before running the full deployment, test your secrets:

1. Go to **Actions** tab in GitHub
2. Find **"🔍 Validate GitHub Secrets"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. This will check if all secrets are properly configured

### 3. **Re-run Deployment**
After adding the secrets:

1. Go to **Actions** tab
2. Find the failed **"🚀 Deploy Helpdesk to GCP Production"** run
3. Click **"Re-run failed jobs"**

OR

Push a new commit to trigger a fresh deployment:

```bash
git commit --allow-empty -m "trigger: re-run deployment with secrets"
git push origin main
```

---

## 🔍 **Detailed Secret Setup**

### SSH_PRIVATE_KEY
- **Status:** You mentioned you already have this as `SSH_PRIVATE_KEY` ✅
- **Format:** Should start with `-----BEGIN OPENSSH PRIVATE KEY-----` or similar
- **Test:** The validation workflow will check this

### DB_PASSWORD
- **Purpose:** PostgreSQL database authentication
- **Length:** 32+ characters recommended
- **Current Value:** `mU68QoL8YGh/DTWOHBgFHyF2HliCYH5d`

### JWT_SECRET  
- **Purpose:** JWT token signing and verification
- **Length:** 64+ characters required
- **Current Value:** `NKg9g6243cWlnXHbPBT4TC5eBxghgAYIgRl0bTx1I6rkC/f1aetZdx+PEvLCp82p`

### REDIS_PASSWORD
- **Purpose:** Redis cache authentication
- **Length:** 24+ characters recommended  
- **Current Value:** `94ABRM4sG6fppWiIUQRckDIY`

---

## 🔍 **Alternative: Generate New Secrets**

If you prefer to generate new secrets instead of using existing ones:

```bash
# Generate new database password
openssl rand -base64 32

# Generate new JWT secret  
openssl rand -hex 64

# Generate new Redis password
openssl rand -base64 24
```

---

## 📋 **Verification Checklist**

- [ ] SSH_PRIVATE_KEY secret exists and contains valid key
- [ ] DB_PASSWORD secret added (32+ chars)
- [ ] JWT_SECRET secret added (64+ chars)  
- [ ] REDIS_PASSWORD secret added (24+ chars)
- [ ] All secrets saved in GitHub repository settings
- [ ] Validation workflow run successful (optional)
- [ ] Deployment workflow re-triggered

---

## 🎯 **Next Steps**

1. **Add the 3 missing secrets** using the values above
2. **Run validation workflow** to confirm setup
3. **Re-trigger deployment** 
4. **Monitor progress** in GitHub Actions
5. **Access your live app** at http://34.173.186.108:8080

---

## 🆘 **Still Having Issues?**

### Common Problems:

**Secret not saving?**
- Make sure you clicked "Add secret" 
- Check there are no extra spaces in the secret name
- Verify the secret value was pasted completely

**SSH key issues?**
- Ensure the SSH key format is correct (starts with `-----BEGIN`)
- Make sure it's the private key, not the public key
- Verify the key has access to your GCP VM

**Deployment still failing?**
- Check the GitHub Actions logs for specific error messages
- Verify your GCP VM is running and accessible
- Ensure firewall rules allow SSH (port 22)

---

**🚀 Ready to fix and deploy?** Add those secrets and let's get your helpdesk system live!
