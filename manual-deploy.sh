#!/bin/bash
# MANUAL DEPLOYMENT SCRIPT
# Run this directly on the VM if GitHub Actions fails

echo "=== MANUAL HELPDESK DEPLOYMENT ==="

# Navigate to app directory
cd /home/kovendhan2535 || exit 1

# Clean up and prepare
echo "Cleaning up old containers..."
docker kill $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Prepare directory
echo "Preparing directory..."
rm -rf helpdesk 2>/dev/null || true
mkdir -p helpdesk
cd helpdesk

# Get latest code
echo "Getting latest code..."
git clone --depth 1 https://github.com/kovendhan5/Helpdesk-Ticketing-System.git . || {
    echo "Clone failed, trying existing directory..."
    git pull origin main
}

# Check files
echo "Checking deployment files..."
if [ ! -f "docker-compose.simple.yml" ]; then
    echo "ERROR: docker-compose.simple.yml not found!"
    ls -la
    exit 1
fi

# Deploy
echo "Starting deployment..."
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
docker-compose -f docker-compose.simple.yml up -d --force-recreate

# Check status
echo "=== DEPLOYMENT STATUS ==="
sleep 10
docker ps
echo ""
echo "=== CONTAINER LOGS ==="
docker-compose -f docker-compose.simple.yml logs --tail=10

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Frontend: http://34.173.186.108"
echo "Backend: http://34.173.186.108:3001"
echo "Admin: admin@example.com / admin123"
echo "User: user@example.com / user123"
