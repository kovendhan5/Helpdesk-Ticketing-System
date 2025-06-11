# 🚨 SSH Timeout - Immediate Action Required

## ❌ Current Issue: SSH Connection Timeout

GitHub Actions cannot connect to your GCP VM with error:
```
dial tcp ***:22: i/o timeout
```

This means the VM is unreachable on port 22 (SSH).

---

## 🔧 **IMMEDIATE ACTIONS NEEDED**

### **Step 1: Check GCP VM Status**
I've opened the GCP Console for you. **Check these things NOW:**

1. **VM Status**: Is your VM `kovendhan2535` **RUNNING**?
   - If STOPPED → Click **"START"**
   - Wait 2-3 minutes for it to fully boot

2. **External IP**: Is it still `34.173.186.108`?
   - If changed → Note the new IP (we'll update the workflow)

3. **SSH Keys**: Are your SSH keys properly configured?
   - Click **"Edit"** → Scroll to **"SSH Keys"** section
   - Ensure your public key is there

### **Step 2: Check GCP Firewall Rules**
1. **Go to**: VPC Network → Firewall
2. **Find**: `default-allow-ssh` rule
3. **Verify**: 
   - Status: **Enabled** ✅
   - Direction: **Ingress**
   - Targets: **Specified target tags** or **All instances**
   - Source IP ranges: **0.0.0.0/0**
   - Protocols and ports: **tcp:22** ✅

### **Step 3: Test SSH Connection Manually**
Run this command to test SSH:
```cmd
ssh -i gcp_helpdesk_key_new kovendhan2535@34.173.186.108
```

**Expected result**: Should connect successfully

---

## 🔧 **Common Fixes**

### **If VM is Stopped:**
```bash
# Start the VM
gcloud compute instances start kovendhan2535 --zone=us-central1-a
```

### **If External IP Changed:**
Update the workflow file with the new IP:
```yaml
env:
  GCP_VM_IP: "NEW_IP_HERE"  # Update this line
```

### **If Firewall is Blocking SSH:**
Create/update SSH firewall rule:
```bash
gcloud compute firewall-rules create allow-ssh \
  --allow tcp:22 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow SSH access"
```

### **If SSH Service is Down:**
Connect via GCP Console SSH and restart SSH:
```bash
sudo systemctl status ssh
sudo systemctl start ssh
sudo systemctl enable ssh
```

---

## 📋 **Verification Steps**

1. **VM Status**: ✅ RUNNING
2. **External IP**: ✅ Correct in workflow
3. **SSH Port**: ✅ Port 22 accessible
4. **Firewall**: ✅ SSH allowed
5. **SSH Keys**: ✅ Public key added to VM
6. **Manual SSH**: ✅ Works from local machine

---

## 🚀 **After Fixing**

1. **Re-run the GitHub Actions workflow**
2. **Monitor**: The SSH connection should now succeed
3. **Continue**: Deployment will proceed automatically

---

## ⚡ **Quick Commands to Run**

```cmd
# Test connectivity
ping 34.173.186.108

# Test SSH
ssh -i gcp_helpdesk_key_new kovendhan2535@34.173.186.108

# If connection works, re-run GitHub Actions
```

**The most likely issue is that your GCP VM is stopped. Check and start it first!** 🚀
