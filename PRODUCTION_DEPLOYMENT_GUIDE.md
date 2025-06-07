# 🚀 Production Deployment Guide - GCP VM

This guide will help you deploy the Helpdesk Ticketing System to your Google Cloud Platform VM for production use.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ A GCP VM instance running Ubuntu 20.04/22.04
- ✅ SSH access to your VM
- ✅ Your VM's external IP address
- ✅ A GCP project with billing enabled
- ✅ Cloud SQL instance (optional, or use containerized PostgreSQL)

## 🛠️ Deployment Options

### Option 1: Quick Docker Deployment (Recommended)

This option uses Docker containers for easy deployment and management.

### Option 2: Terraform Infrastructure + Docker

This option creates the entire infrastructure using Terraform, then deploys the application.

### Option 3: Manual VM Setup

This option manually configures the VM with all dependencies.

---

## 🚀 Option 1: Quick Docker Deployment

### Step 1: Prepare Your VM

SSH into your GCP VM:

```bash
ssh username@YOUR_VM_EXTERNAL_IP
```

### Step 2: Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group
exit
```

### Step 3: Deploy the Application

```bash
# SSH back into your VM
ssh username@YOUR_VM_EXTERNAL_IP

# Clone your repository
git clone https://github.com/yourusername/helpdesk-ticketing-system.git
cd helpdesk-ticketing-system

# Create production environment file
cp .env.production.template .env.production

# Edit the environment file with your settings
nano .env.production
```

**Update the following variables in `.env.production`:**

```env
DB_HOST=localhost  # Use localhost for containerized PostgreSQL
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secure_jwt_secret_256_bits_long
API_URL=http://YOUR_VM_EXTERNAL_IP:3001/api
FRONTEND_URL=http://YOUR_VM_EXTERNAL_IP
CORS_ORIGIN=http://YOUR_VM_EXTERNAL_IP
```

### Step 4: Start the Application

```bash
# Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check if all containers are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Configure GCP Firewall

```bash
# Allow HTTP traffic (port 80 and 3001)
gcloud compute firewall-rules create helpdesk-http \
  --allow tcp:80,tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP traffic for Helpdesk app"
```

### Step 6: Access Your Application

- **Frontend**: `http://YOUR_VM_EXTERNAL_IP`
- **API**: `http://YOUR_VM_EXTERNAL_IP:3001/api`

---

## 🏗️ Option 2: Terraform Infrastructure + Docker

### Step 1: Setup Terraform

```bash
# Navigate to terraform directory
cd terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

**Update `terraform.tfvars` with your values:**

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
db_password = "your-secure-database-password"
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... your-public-key"
```

### Step 2: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply
```

### Step 3: Get VM IP and Deploy Application

```bash
# Get the VM external IP
VM_IP=$(terraform output -raw vm_external_ip)
echo "VM IP: $VM_IP"

# SSH into the created VM
ssh ubuntu@$VM_IP

# Clone and deploy the application (follow steps from Option 1)
```

---

## 🔧 Option 3: Manual VM Setup

### Step 1: Run the Deployment Script

```bash
# Copy the deployment script to your VM
scp deploy-production.sh username@YOUR_VM_EXTERNAL_IP:~/

# SSH into your VM
ssh username@YOUR_VM_EXTERNAL_IP

# Make the script executable and run it
chmod +x deploy-production.sh
./deploy-production.sh
```

### Step 2: Deploy Application Code

```bash
# Copy your application code to /opt/helpdesk
sudo cp -r /path/to/your/code/* /opt/helpdesk/

# Or clone from git
cd /opt/helpdesk
git clone https://github.com/yourusername/helpdesk-ticketing-system.git .

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build
```

### Step 3: Configure Environment

```bash
# Edit the environment file
sudo nano /opt/helpdesk/.env

# Start the backend service
sudo systemctl start helpdesk-backend
sudo systemctl status helpdesk-backend
```

---

## 🔒 Security Considerations

### SSL/TLS Certificate (Recommended for Production)

```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Database Security

```bash
# If using Cloud SQL, ensure:
# 1. Private IP is used
# 2. Authorized networks are configured
# 3. SSL connections are enforced
# 4. Regular backups are enabled
```

---

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl http://YOUR_VM_IP/health
curl http://YOUR_VM_IP:3001/api/health

# Check Docker containers
docker-compose -f docker-compose.prod.yml ps

# Check system resources
htop
df -h
free -h
```

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# System service logs
sudo journalctl -u helpdesk-backend -f

# NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy

```bash
# Database backup (if using containerized PostgreSQL)
docker exec helpdesk-postgres-prod pg_dump -U helpdesk_user helpdesk_db > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf helpdesk_backup_$(date +%Y%m%d).tar.gz /opt/helpdesk
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**

   ```bash
   docker-compose -f docker-compose.prod.yml logs container_name
   ```

2. **Database connection issues**

   ```bash
   # Check if PostgreSQL is running
   docker exec helpdesk-postgres-prod pg_isready -U helpdesk_user

   # Test connection from backend
   docker exec helpdesk-backend-prod node -e "require('./src/db.js')"
   ```

3. **NGINX configuration issues**

   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Firewall blocking connections**

   ```bash
   # Check GCP firewall rules
   gcloud compute firewall-rules list

   # Check UFW status
   sudo ufw status
   ```

### Performance Optimization

```bash
# Monitor system resources
htop
iotop
netstat -tulpn

# Optimize NGINX
sudo nano /etc/nginx/nginx.conf
# Increase worker_processes and worker_connections

# Optimize PostgreSQL (if using containerized)
# Edit postgresql.conf for production settings
```

---

## 🎉 Post-Deployment Checklist

- ✅ Application accessible via web browser
- ✅ API endpoints responding correctly
- ✅ WebSocket connections working
- ✅ Database connections established
- ✅ SSL certificate installed (if using domain)
- ✅ Firewall rules configured
- ✅ Monitoring and logging set up
- ✅ Backup strategy implemented
- ✅ Admin and user accounts created

---

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Verify environment variables
3. Test network connectivity
4. Review firewall rules
5. Check system resources

**Your production Helpdesk Ticketing System should now be live! 🎊**
