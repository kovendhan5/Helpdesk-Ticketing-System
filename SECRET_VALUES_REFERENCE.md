# 🎯 GITHUB SECRETS - EXACT VALUES NEEDED

## 📍 **Repository**:

https://github.com/kovendhan5/Helpdesk-Ticketing-System

## 📍 **Settings Path**:

Settings → Secrets and variables → Actions → New repository secret

---

## 🔑 **Secret 1: VM_HOST**

```
Name: VM_HOST
Value: 34.173.186.108
```

## 🔑 **Secret 2: VM_USER**

```
Name: VM_USER
Value: kovendhan2535
```

## 🔑 **Secret 3: SSH_PRIVATE_KEY**

```
Name: SSH_PRIVATE_KEY
Value: [Get from VM with: cat ~/.ssh/id_rsa]
```

---

## 📝 **How to Get SSH Private Key**

### Option 1: Google Cloud Console (Recommended)

1. Open **Google Cloud Console** → **Compute Engine** → **VM instances**
2. Click **SSH** button on helpdesk-vm
3. Run: `cat ~/.ssh/id_rsa`
4. Copy entire output (including BEGIN/END lines)

### Option 2: SSH from Local Machine (if possible)

```bash
ssh kovendhan2535@34.173.186.108
cat ~/.ssh/id_rsa
```

---

## ✅ **Verification**

After adding all 3 secrets, run the deployment workflow. You should see:

**Success Indicator:**

```
🧪 Testing SSH connection to kovendhan2535@34.173.186.108...
SSH connection successful!
```

**Failure Indicators:**

- `Could not resolve hostname` = VM_HOST not set
- `Permission denied` = SSH_PRIVATE_KEY wrong/missing
- `Connection refused` = Wrong VM_HOST value

---

## 🎯 **Final Result**

Once all secrets are configured correctly:

- ✅ SSH authentication works
- ✅ Deployment completes successfully
- ✅ Helpdesk system live at: **http://34.173.186.108:3001**

**Copy these values EXACTLY - no extra spaces or characters!**
