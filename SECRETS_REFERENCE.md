# 🚀 GitHub Secrets Quick Reference

## 📋 Exact Values Needed

### Secret 1: SSH_PRIVATE_KEY

```
Get from VM command: cat ~/.ssh/id_rsa
Should look like:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn...
[many lines of key data]
...
-----END OPENSSH PRIVATE KEY-----
```

### Secret 2: VM_HOST

```
34.173.186.108
```

### Secret 3: VM_USER

```
kovendhan2535
```

## 🎯 GitHub Repository URL

https://github.com/kovendhan5/Helpdesk-Ticketing-System

## 📍 Settings Path

Repository → Settings → Secrets and variables → Actions → New repository secret

## ✅ Success Indicator

When secrets are set correctly, the workflow will show:

```
🔍 Validating GitHub Secrets...
✅ All required secrets are configured
✅ VM_HOST: 34.173.186.108
✅ VM_USER: kovendhan2535
✅ SSH_PRIVATE_KEY: configured (redacted)
```

**Copy these values exactly - no extra spaces or characters!**
