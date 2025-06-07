# 🚀 QUICK VM FIX - Copy & Paste Commands

## ⚡ STEP 1: Access VM and Fix Docker Permissions

1. Go to [Google Cloud Console](https://console.cloud.google.com/compute/instances)
2. Click **SSH** button next to `helpdesk-vm`
3. **Copy and paste this entire block:**

```bash
# Fix Docker permissions first
echo "🔧 Adding user to docker group..."
sudo usermod -aG docker kovendhan2535
newgrp docker

# Test Docker access
echo "🧪 Testing Docker access..."
docker ps || echo "Docker access still denied - need to restart session"

# Check if files exist
echo "📁 Checking deployment files..."
ls -la /opt/helpdesk/ || echo "Directory doesn't exist"
ls -la ~/Helpdesk-Ticketing-System/ || echo "Repository not cloned"
```

## ⚡ STEP 2: Deploy Application Files

**Copy and paste this entire block:**

```bash
# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/helpdesk
sudo chown kovendhan2535:kovendhan2535 /opt/helpdesk

# Check if repository exists, if not clone it
if [ ! -d "~/Helpdesk-Ticketing-System" ]; then
    echo "📥 Cloning repository..."
    cd ~
    git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git
fi

# Copy deployment files
echo "📋 Copying deployment files..."
cd ~/Helpdesk-Ticketing-System
cp docker-compose.prod.yml /opt/helpdesk/
cp .env.production /opt/helpdesk/.env
cp -r backend /opt/helpdesk/
cp -r frontend /opt/helpdesk/

# Set proper permissions
sudo chown -R kovendhan2535:kovendhan2535 /opt/helpdesk
```

## ⚡ STEP 3: Deploy Application

**Copy and paste this entire block:**

```bash
# Go to application directory
cd /opt/helpdesk

# Stop any existing containers
docker-compose -f docker-compose.prod.yml down 2>/dev/null || echo "No containers to stop"

# Remove old containers and images
docker system prune -f
docker volume prune -f

# Start the application
echo "🚀 Starting application..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for startup
echo "⏳ Waiting for containers to start..."
sleep 60

# Check status
echo "📊 Container Status:"
docker ps -a

echo "🌐 Testing endpoints..."
curl -I http://localhost:80/ || echo "Frontend not responding"
curl -I http://localhost:3001/health || echo "Backend not responding"
```

## ⚡ STEP 4: If Still 403 Error

**Copy and paste this entire block:**

```bash
# Check detailed logs
echo "📝 Frontend logs:"
docker logs helpdesk-frontend-prod --tail 20

echo "📝 Backend logs:"
docker logs helpdesk-backend-prod --tail 20

# Manual frontend build fix
echo "🔧 Manual frontend build..."
cd ~/Helpdesk-Ticketing-System/frontend
npm install
npm run build

# Copy build files
sudo mkdir -p /opt/helpdesk/frontend/build
sudo cp -r build/* /opt/helpdesk/frontend/build/
sudo chown -R 1000:1000 /opt/helpdesk/frontend/build/
sudo chmod -R 755 /opt/helpdesk/frontend/build/

# Restart frontend container
cd /opt/helpdesk
docker-compose -f docker-compose.prod.yml restart frontend

# Wait and test
sleep 30
curl -I http://localhost:80/
```

## 🎯 Final Test

**Copy and paste this to test everything:**

```bash
echo "🧪 FINAL SYSTEM TEST"
echo "===================="

# Check all containers
echo "📊 Container Status:"
docker ps

# Test all endpoints
echo "🌐 Frontend (Port 80):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:80/

echo "🔧 Backend Health (Port 3001):"
curl -s http://localhost:3001/health

echo "💾 Database Connection:"
docker exec helpdesk-postgres-prod pg_isready -U helpdesk_user -d helpdesk_db

echo "🔗 External Access Test:"
echo "Visit: http://34.173.186.108/"

echo "✅ If all tests pass, your application is ready!"
echo "📋 Admin login: admin@example.com / admin123"
echo "👤 User login: user@example.com / user123"
```

---

## 🆘 If You Need Help

If any step fails, run this diagnostic:

```bash
echo "🔍 DIAGNOSTIC INFO"
echo "=================="
echo "User: $(whoami)"
echo "Docker group: $(groups | grep docker || echo 'NOT IN DOCKER GROUP')"
echo "Directory: $(pwd)"
echo "Files in /opt/helpdesk: $(ls -la /opt/helpdesk/ 2>/dev/null || echo 'Directory missing')"
echo "Docker status: $(docker --version 2>/dev/null || echo 'Docker not accessible')"
echo "Container status: $(docker ps -a 2>/dev/null || echo 'Cannot access Docker')"
```

Copy the output and let me know what's happening!
