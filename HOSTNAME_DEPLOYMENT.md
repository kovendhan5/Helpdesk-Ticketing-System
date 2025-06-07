# 🚀 Helpdesk System - Hostname Deployment Guide

## VM Configuration: helpdesk-vm

Your system is now configured to use the hostname `helpdesk-vm` instead of IP addresses, which provides better maintainability and flexibility.

## 📋 Prerequisites

1. **DNS Configuration**: Ensure your hostname `helpdesk-vm` resolves correctly:

   - Either configure DNS records in your domain
   - Or add entries to your local hosts file for testing

2. **SSH Access**: Verify you can connect using the hostname:
   ```bash
   ssh kovendhan2535@helpdesk-vm
   ```

## 🔧 Local Hosts File Configuration (For Testing)

If you don't have DNS configured, add this entry to your hosts file:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac**: `/etc/hosts`

```
34.173.186.108    helpdesk-vm
```

## 🚀 Deployment Steps

### Step 1: Transfer Deployment Package

```bash
scp -r temp_deploy kovendhan2535@helpdesk-vm:~/helpdesk-deploy
```

### Step 2: SSH into VM

```bash
ssh kovendhan2535@helpdesk-vm
```

### Step 3: Deploy the System

```bash
cd ~/helpdesk-deploy
chmod +x deploy-production.sh
sudo ./deploy-production.sh
```

### Step 4: Start the Application

```bash
chmod +x gcp-vm-deploy.sh
./gcp-vm-deploy.sh
```

## 🌐 Application Access URLs

After deployment, access your application at:

- **Frontend**: http://helpdesk-vm
- **API**: http://helpdesk-vm:3001/api
- **WebSocket**: ws://helpdesk-vm:3001

## 🔒 Default Admin Credentials

- **Username**: admin@example.com
- **Password**: admin123

## 🏥 Health Check Commands

```bash
# Check application health
curl http://helpdesk-vm/health
curl http://helpdesk-vm:3001/api/health

# Check WebSocket connection
curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
     -H "Sec-WebSocket-Version: 13" \
     http://helpdesk-vm:3001/socket.io/
```

## 🔄 Service Management

```bash
# Check Docker containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Security Configuration

The system includes:

- ✅ JWT authentication with secure secrets
- ✅ Password hashing with bcrypt
- ✅ Rate limiting protection
- ✅ Security headers via Helmet.js
- ✅ CORS protection
- ✅ WebSocket authentication
- ✅ Database connection security

## 🔥 Firewall Configuration

Ensure these ports are open on your GCP VM:

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp

# Allow SSH (if not already configured)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## 📊 Monitoring

### System Resources

```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
htop
```

### Application Logs

```bash
# Backend logs
docker logs helpdesk-backend

# Frontend logs
docker logs helpdesk-frontend

# Database logs
docker logs helpdesk-postgres
```

## 🆘 Troubleshooting

### Common Issues:

1. **Hostname not resolving**: Add entry to hosts file or configure DNS
2. **Connection refused**: Check if services are running with `docker ps`
3. **Database connection error**: Verify PostgreSQL container is healthy
4. **WebSocket issues**: Check CORS configuration and port accessibility

### Debug Commands:

```bash
# Test hostname resolution
nslookup helpdesk-vm
ping helpdesk-vm

# Check port accessibility
telnet helpdesk-vm 80
telnet helpdesk-vm 3001

# Verify Docker network
docker network ls
docker network inspect helpdesk-ticketing-system_default
```

## 🎯 Next Steps

1. **SSL Certificate**: Consider setting up HTTPS with Let's Encrypt
2. **Domain Configuration**: Configure a proper domain name
3. **Backup Strategy**: Set up automated database backups
4. **Monitoring**: Implement application monitoring (Prometheus/Grafana)
5. **Load Balancing**: Consider adding a load balancer for high availability

---

Your Helpdesk Ticketing System is now ready for production use with hostname-based configuration! 🎉
