# 🚀 APPLICATION DEPLOYMENT GUIDE

## 📋 **CURRENT INFRASTRUCTURE STATUS**

### **Active Resources:**
- ✅ **VM**: `helpdesk-vm` (YOUR_VM_IP) - Ubuntu, e2-micro
- ✅ **Database**: `helpdesk-db-v2` (YOUR_DB_IP) - PostgreSQL 13, db-f1-micro
- ✅ **Firewall**: SSH (22), HTTP (80), Backend (3000)
- ✅ **Cost**: ~$8-12/month (optimized)

## 🔧 **DEPLOYMENT STEPS**

### **1. Connect to VM**
```bash
# Navigate to terraform directory
cd terraform

# SSH into the VM
ssh -i helpdesk-key ubuntu@YOUR_VM_IP
```

### **2. Set Up the VM Environment**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### **3. Clone and Configure Application**
```bash
# Clone your repository
git clone https://github.com/your-username/helpdesk-ticketing-system.git
cd helpdesk-ticketing-system

# Create environment file for backend
cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=YOUR_JWT_SECRET_HERE_256_BIT_HEX
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000
DATABASE_URL=postgresql://helpdesk_user:YOUR_DB_PASSWORD@YOUR_DB_IP:5432/helpdesk_db
BCRYPT_ROUNDS=12
EOF

# Install backend dependencies
cd backend
npm install

# Run database setup (if needed)
npm run setup-db-secure
```

### **4. Test Database Connection**
```bash
# Test connection to the database
psql postgresql://helpdesk_user:YOUR_DB_PASSWORD@YOUR_DB_IP:5432/helpdesk_db -c "SELECT version();"
```

### **5. Build and Start Application**
```bash
# Build frontend
cd ../frontend
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start src/index.js --name "helpdesk-backend"

# Set up PM2 to restart on system reboot
pm2 startup
pm2 save

# Serve frontend (simple static server)
cd ../frontend/build
python3 -m http.server 80
```

### **6. Configure Firewall (if needed)**
```bash
# The GCP firewall rules are already configured for:
# - SSH (port 22)
# - HTTP (port 80) 
# - Backend (port 3000)
```

## 🔍 **TESTING THE DEPLOYMENT**

### **1. Check Backend API**
```bash
# From your local machine
curl http://YOUR_VM_IP:3000/api/health

# Expected response: {"status": "OK", "timestamp": "..."}
```

### **2. Check Frontend**
```bash
# Open in browser
http://YOUR_VM_IP

# Should show the Helpdesk Ticketing System login page
```

### **3. Test Database Connection**
```bash
# SSH into VM and test
ssh -i helpdesk-key ubuntu@YOUR_VM_IP
psql postgresql://helpdesk_user:YOUR_DB_PASSWORD@YOUR_DB_IP:5432/helpdesk_db -c "\dt"
```

## 🛡️ **SECURITY FEATURES ACTIVE**

### **Backend Security:**
- ✅ JWT Authentication (256-bit secret)
- ✅ Rate Limiting & Account Lockout
- ✅ Password Validation (OWASP compliant)
- ✅ Input Sanitization
- ✅ Security Headers (Helmet)
- ✅ CSRF Protection
- ✅ Session Management

### **Database Security:**
- ✅ Strong Password: `YOUR_SECURE_DB_PASSWORD`
- ✅ Network Isolation
- ✅ SSL Encryption

### **Infrastructure Security:**
- ✅ Firewall Rules (minimal ports)
- ✅ SSH Key Authentication
- ✅ No Root Access
- ✅ All Credentials in Environment Variables

## 📊 **MONITORING COMMANDS**

```bash
# Check application status
pm2 status

# View logs
pm2 logs helpdesk-backend

# Monitor system resources
htop

# Check database connections
sudo netstat -tlnp | grep :5432
```

## 🆘 **TROUBLESHOOTING**

### **Database Connection Issues:**
```bash
# Test database connectivity
telnet YOUR_DB_IP 5432

# Check if database is accepting connections
psql postgresql://helpdesk_user:YOUR_DB_PASSWORD@YOUR_DB_IP:5432/helpdesk_db -c "SELECT 1;"
```

### **Application Issues:**
```bash
# Restart backend
pm2 restart helpdesk-backend

# Check application logs
pm2 logs helpdesk-backend --lines 50
```

**Your infrastructure is optimized and ready for deployment!** 🎉
