# 🚀 Production Deployment Guide

## Quick Start (Windows)

1. **Check system readiness**
   ```batch
   check-system.bat
   ```

2. **Deploy to production**
   ```batch
   deploy-production.bat
   ```

3. **Monitor system health**
   ```batch
   monitor-system.bat
   ```

## Prerequisites

### Required Software
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v4.0+)
- Git (for cloning the repository)

### System Requirements
- Windows 10/11 (with WSL2) or Windows Server 2019+
- 4GB+ RAM available
- 10GB+ disk space
- Internet connection for downloading Docker images

## Step-by-Step Deployment

### 1. Download and Setup

```batch
# Clone the repository
git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git
cd Helpdesk-Ticketing-System

# Check system readiness
check-system.bat
```

### 2. Configure Environment

```batch
# Copy example environment file
copy .env.example .env

# Edit .env file with your production values
notepad .env
```

**Required environment variables:**
```env
DB_PASSWORD=your_secure_database_password_here
JWT_SECRET=your_64_character_jwt_secret_here
REDIS_PASSWORD=your_secure_redis_password_here
FRONTEND_PORT=8080
```

**Generate secure values:**
```batch
# For PowerShell users - generate random passwords
[System.Web.Security.Membership]::GeneratePassword(32, 0)
```

### 3. Deploy Application

```batch
# Deploy all services
deploy-production.bat
```

This script will:
- ✅ Verify Docker is running
- 🛑 Stop any existing containers
- 📥 Pull latest Docker images
- 🏗️ Build and start all services
- 🔍 Perform health checks
- 📊 Display service status

### 4. Verify Deployment

After deployment, verify these URLs work:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/health
- **Admin Dashboard**: http://localhost:8080/admin

### 5. Initial Setup

1. Open http://localhost:8080
2. Register a new admin account
3. Configure system settings in admin panel

## Management Commands

### Monitor System
```batch
monitor-system.bat
```

### Backup Database
```batch
backup-system.bat
```

### View Logs
```batch
docker-compose logs -f
```

### Stop Services
```batch
docker-compose down
```

### Restart Services
```batch
docker-compose restart
```

## Security Checklist

- [ ] Change default passwords in .env file
- [ ] Use strong JWT secret (64+ characters)
- [ ] Configure firewall to restrict access
- [ ] Enable HTTPS in production (use reverse proxy)
- [ ] Regular security updates
- [ ] Monitor system logs
- [ ] Regular database backups

## Troubleshooting

### Docker Issues
```batch
# Restart Docker Desktop
# Check Docker Desktop status
docker info
```

### Application Issues
```batch
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
```

### Database Issues
```batch
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Access database
docker-compose exec postgres psql -U postgres -d helpdesk
```

## Production Optimization

### Performance
- Increase container resources for high load
- Configure database connection pooling
- Implement Redis caching
- Use CDN for static assets

### Monitoring
- Set up log aggregation
- Configure alerting
- Monitor resource usage
- Track application metrics

### Backup Strategy
- Daily automated database backups
- Weekly full system backups
- Test restore procedures
- Store backups securely

## Support

For issues and support:
1. Check logs: `docker-compose logs`
2. Run system check: `check-system.bat`
3. Review this guide
4. Create GitHub issue with detailed information

---
**Last updated**: June 2025
