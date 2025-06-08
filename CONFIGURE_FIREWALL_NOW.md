## 🔥 GCP Firewall Configuration Guide

### 🎯 Objective

Configure Google Cloud Platform firewall rules to allow external access to the Helpdesk Ticketing System.

### 🚨 CRITICAL: Configure These Firewall Rules

**Access Google Cloud Console Firewall:**
https://console.cloud.google.com/networking/firewalls/list

### ⚡ Required Firewall Rules

#### Rule 1: Frontend HTTP Access

- **Name:** `helpdesk-frontend-http`
- **Direction:** Ingress
- **Action:** Allow
- **Targets:** All instances in the network
- **Source IP ranges:** `0.0.0.0/0`
- **Protocols and ports:** TCP port `80`
- **Description:** Allow HTTP access to Helpdesk frontend application

#### Rule 2: Backend API Access

- **Name:** `helpdesk-backend-api`
- **Direction:** Ingress
- **Action:** Allow
- **Targets:** All instances in the network
- **Source IP ranges:** `0.0.0.0/0`
- **Protocols and ports:** TCP port `3001`
- **Description:** Allow access to Helpdesk backend API and WebSocket

#### Rule 3: SSH Access (if not exists)

- **Name:** `helpdesk-ssh-access`
- **Direction:** Ingress
- **Action:** Allow
- **Targets:** All instances in the network
- **Source IP ranges:** `0.0.0.0/0`
- **Protocols and ports:** TCP port `22`
- **Description:** Allow SSH access to Helpdesk VM

### 📋 Step-by-Step Instructions

1. **Open Google Cloud Console**

   - Go to: https://console.cloud.google.com/networking/firewalls/list
   - Make sure you're in the correct project

2. **Create Rule 1 (Frontend - Port 80)**

   - Click "CREATE FIREWALL RULE"
   - Name: `helpdesk-frontend-http`
   - Direction: Ingress
   - Action: Allow
   - Targets: All instances in the network
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports: Check "Specified protocols and ports"
   - TCP: Check and enter `80`
   - Click "CREATE"

3. **Create Rule 2 (Backend - Port 3001)**

   - Click "CREATE FIREWALL RULE"
   - Name: `helpdesk-backend-api`
   - Direction: Ingress
   - Action: Allow
   - Targets: All instances in the network
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports: Check "Specified protocols and ports"
   - TCP: Check and enter `3001`
   - Click "CREATE"

4. **Verify Rules**
   - Check that both rules appear in the firewall list
   - Both should show "Ingress" direction and "Allow" action

### 🔗 After Configuration

Once firewall rules are created, test access:

- **Frontend Application:** http://34.173.186.108
- **Backend API:** http://34.173.186.108:3001/api
- **Health Check:** http://34.173.186.108:3001/health

### 👤 Default Login Credentials

- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

### ⚠️ Security Note

These rules allow access from anywhere (0.0.0.0/0). For production use, consider restricting source ranges to specific IP addresses or ranges.

### 🆘 Troubleshooting

If services are still not accessible after firewall configuration:

1. **Check Container Status** (SSH to VM):

   ```bash
   docker ps
   docker logs helpdesk-backend-prod
   docker logs helpdesk-frontend-prod
   ```

2. **Verify GitHub Actions Deployment**

   - Check: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
   - Look for the latest workflow run

3. **Test Local Connectivity** (on VM):
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:80
   ```
