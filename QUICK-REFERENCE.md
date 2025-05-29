# 🚀 CI/CD Quick Reference Card

## **📋 IMMEDIATE ACTION REQUIRED**

### **1️⃣ COMMIT & PUSH (2 minutes)**
```bash
cd "k:\Devops\Helpdesk-Ticketing-System"
git add .
git commit -m "feat: Complete CI/CD pipeline implementation"
git push origin main
```

### **2️⃣ SETUP GITHUB SECRETS (5 minutes)**
🔗 **URL**: `https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions`

**Required Secrets:**
| Name | Value | Source |
|------|-------|--------|
| `SSH_PRIVATE_KEY` | Full private key content | `type terraform\helpdesk-key` |
| `VM_IP` | Your VM public IP | `terraform output vm_external_ip` |
| `SLACK_WEBHOOK` | Slack webhook URL | *(Optional)* |

### **3️⃣ COMPLETE VM SETUP (5 minutes)**
```bash
# SSH into VM
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP

# Run setup script
curl -s https://raw.githubusercontent.com/kovendhan5/Helpdesk-Ticketing-System/main/vm-setup-commands.sh | bash

# Run the PM2 startup command that gets displayed
# (It will look like: sudo env PATH=... pm2 startup systemd -u ubuntu --hp /home/ubuntu)
```

---

## **🎯 VERIFICATION COMMANDS**

### **Check Git Status**
```bash
git status
git log --oneline -3
```

### **Check GitHub Secrets** 
Visit: `https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions`

### **Check VM Health**
```bash
curl http://YOUR_VM_IP
curl http://YOUR_VM_IP/api/health
```

### **Monitor Deployment**
Visit: `https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions`

---

## **🚨 EMERGENCY COMMANDS**

### **Rollback Application**
```bash
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP
sudo cp -r /opt/helpdesk-backup/* /opt/helpdesk/
pm2 restart all
```

### **Check VM Status**
```bash
ssh -i terraform/helpdesk-key ubuntu@YOUR_VM_IP
pm2 status
sudo systemctl status nginx
```

### **View Logs**
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

---

## **✅ SUCCESS CHECKLIST**

- [ ] Git push completed successfully
- [ ] 3 GitHub secrets configured
- [ ] VM setup script completed  
- [ ] PM2 startup command executed
- [ ] GitHub Actions workflow triggered
- [ ] Application accessible at VM IP
- [ ] API endpoints responding
- [ ] PM2 processes running

---

## **⏱️ ESTIMATED TIME: 12-15 MINUTES TOTAL**

🎉 **Your enterprise-grade CI/CD pipeline will be live and automatically deploying within 15 minutes!**
