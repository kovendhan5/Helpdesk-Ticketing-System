# 🔧 Fix 403 Forbidden Error - Quick Resolution

## 🎉 Good News!

Your deployment is **mostly working**! The 403 error means:

- ✅ SSH connection worked
- ✅ Docker containers are running
- ✅ Nginx is serving requests
- ❌ Frontend files have permission/configuration issues

## 🚀 IMMEDIATE FIX (2 minutes)

### Step 1: Access Your VM

1. Go to [Google Cloud Console](https://console.cloud.google.com/compute/instances)
2. Click **SSH** button next to `helpdesk-vm`
3. Run these diagnostic commands:

```bash
# Check container status
docker ps -a

# Check application directory
ls -la /opt/helpdesk/

# Check frontend build files
ls -la /opt/helpdesk/frontend/build/

# Check container logs
docker logs helpdesk-frontend-prod
docker logs helpdesk-backend-prod
```

### Step 2: Quick Fix Commands

Run these commands in the VM terminal:

```bash
# Go to the helpdesk directory
cd /opt/helpdesk

# Fix frontend build issues
echo "🔧 Rebuilding frontend..."
docker-compose -f docker-compose.prod.yml exec frontend npm run build || echo "Build command failed"

# Alternative: Rebuild containers
echo "🔧 Rebuilding containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start
sleep 30

# Check container status
docker ps -a

# Test backend health
curl -I http://localhost:3001/health

# Test frontend
curl -I http://localhost:80/
```

### Step 3: If Still 403, Try This Fix

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Remove volumes and rebuild completely
docker system prune -f
docker volume prune -f

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate

# Wait for build and startup
sleep 60

# Check status
docker ps -a
docker logs helpdesk-frontend-prod
```

### Step 4: Manual Frontend Build (Last Resort)

If containers are having build issues:

```bash
# Go to cloned repository
cd ~/Helpdesk-Ticketing-System/frontend

# Install dependencies and build manually
npm install
npm run build

# Copy build files to application directory
sudo cp -r build/* /opt/helpdesk/frontend/build/

# Fix permissions
sudo chown -R 1000:1000 /opt/helpdesk/frontend/build/
sudo chmod -R 755 /opt/helpdesk/frontend/build/

# Restart containers
cd /opt/helpdesk
docker-compose -f docker-compose.prod.yml restart frontend
```

## 🔍 Diagnostic Commands

To understand what's happening:

```bash
# Check detailed container logs
docker logs helpdesk-frontend-prod --tail 50
docker logs helpdesk-backend-prod --tail 50
docker logs helpdesk-postgres-prod --tail 50

# Check nginx configuration inside container
docker exec helpdesk-frontend-prod cat /etc/nginx/nginx.conf

# Check if build files exist inside container
docker exec helpdesk-frontend-prod ls -la /usr/share/nginx/html/

# Check container resource usage
docker stats --no-stream

# Check system resources
df -h
free -h
```

## 🎯 Expected Results

After fixing, you should see:

- ✅ `curl -I http://localhost:80/` returns `200 OK`
- ✅ Frontend accessible at http://34.173.186.108
- ✅ Backend API at http://34.173.186.108:3001/health

## 📋 Most Common Fixes

**Issue 1: Frontend build failed**

```bash
cd /opt/helpdesk
docker-compose -f docker-compose.prod.yml exec frontend npm run build
```

**Issue 2: Permission problems**

```bash
sudo chown -R 1000:1000 /opt/helpdesk/frontend/build/
docker-compose -f docker-compose.prod.yml restart frontend
```

**Issue 3: Container resource issues**

```bash
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d --build
```

---

**Run Step 1 diagnostics first, then try the fixes in order. The 403 error is usually resolved within 2-3 minutes with these commands!**
