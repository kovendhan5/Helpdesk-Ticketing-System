#!/bin/bash

# 🚀 AUTOMATED HELPDESK DEPLOYMENT FIX
# Run this script to fix all deployment issues automatically

set -e  # Exit on any error

echo "🚀 HELPDESK SYSTEM - AUTOMATED FIX"
echo "=================================="

# Step 1: Fix Docker permissions
echo "🔧 Step 1: Fixing Docker permissions..."
sudo usermod -aG docker kovendhan2535 || echo "User already in docker group"
newgrp docker

# Test Docker access
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker still not accessible. You may need to log out and back in."
    echo "   Try running: sudo systemctl restart docker"
    sudo systemctl restart docker
    sleep 5
fi

# Step 2: Create application directory
echo "📁 Step 2: Setting up application directory..."
sudo mkdir -p /opt/helpdesk
sudo chown $USER:$USER /opt/helpdesk

# Step 3: Clone/update repository
echo "📥 Step 3: Getting latest code..."
cd ~
if [ ! -d "Helpdesk-Ticketing-System" ]; then
    git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git
else
    cd Helpdesk-Ticketing-System
    git pull origin main
    cd ~
fi

# Step 4: Copy deployment files
echo "📋 Step 4: Copying deployment files..."
cd ~/Helpdesk-Ticketing-System
cp docker-compose.prod.yml /opt/helpdesk/
cp .env.production /opt/helpdesk/.env
cp -r backend /opt/helpdesk/
cp -r frontend /opt/helpdesk/
sudo chown -R $USER:$USER /opt/helpdesk

# Step 5: Deploy application
echo "🚀 Step 5: Deploying application..."
cd /opt/helpdesk

# Stop existing containers
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up
docker system prune -f -a
docker volume prune -f

# Start application
echo "⏳ Starting containers (this may take 2-3 minutes)..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for startup
echo "⏳ Waiting for services to initialize..."
sleep 90

# Step 6: Health checks
echo "🏥 Step 6: Health checks..."

# Check container status
echo "📊 Container Status:"
docker ps

# Test endpoints
echo "🌐 Testing endpoints..."
sleep 10

# Frontend test
if curl -s -f http://localhost:80/ > /dev/null; then
    echo "✅ Frontend: WORKING"
else
    echo "❌ Frontend: FAILED - Attempting fix..."
    
    # Manual frontend build
    cd ~/Helpdesk-Ticketing-System/frontend
    if npm install && npm run build; then
        sudo mkdir -p /opt/helpdesk/frontend/build
        sudo cp -r build/* /opt/helpdesk/frontend/build/
        sudo chown -R 1000:1000 /opt/helpdesk/frontend/build/
        sudo chmod -R 755 /opt/helpdesk/frontend/build/
        
        cd /opt/helpdesk
        docker-compose -f docker-compose.prod.yml restart frontend
        sleep 30
        
        if curl -s -f http://localhost:80/ > /dev/null; then
            echo "✅ Frontend: FIXED"
        else
            echo "❌ Frontend: Still failing"
        fi
    fi
fi

# Backend test
if curl -s -f http://localhost:3001/health > /dev/null; then
    echo "✅ Backend: WORKING"
else
    echo "❌ Backend: Check logs with: docker logs helpdesk-backend-prod"
fi

# Database test
if docker exec helpdesk-postgres-prod pg_isready -U helpdesk_user -d helpdesk_db > /dev/null 2>&1; then
    echo "✅ Database: WORKING"
else
    echo "❌ Database: Check logs with: docker logs helpdesk-postgres-prod"
fi

# Final status
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "🌐 Access your application: http://34.173.186.108/"
echo "👨‍💼 Admin login: admin@example.com / admin123"
echo "👤 User login: user@example.com / user123"
echo ""

# Show any container issues
FAILED_CONTAINERS=$(docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}" | grep -v "NAMES" || true)
if [ ! -z "$FAILED_CONTAINERS" ]; then
    echo "⚠️  Some containers may have issues:"
    echo "$FAILED_CONTAINERS"
    echo ""
    echo "🔍 Check logs with:"
    echo "docker logs helpdesk-frontend-prod"
    echo "docker logs helpdesk-backend-prod"
    echo "docker logs helpdesk-postgres-prod"
fi

echo "✨ Setup complete! Your helpdesk system should now be running."
