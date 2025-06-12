#!/bin/bash
# Secure GitHub-based deployment script for GCP VM
# Run this script ON THE SERVER after cloning from GitHub

echo "=========================================="
echo "HELPDESK DEPLOYMENT FROM GITHUB"
echo "=========================================="

# Configuration
REPO_URL="https://github.com/YOUR_USERNAME/Helpdesk-Ticketing-System.git"
APP_DIR="/home/$(whoami)/helpdesk-app"

echo "Deployment directory: $APP_DIR"
echo "Current user: $(whoami)"

# Step 1: Clean up any existing deployment
echo "[1/6] Cleaning up existing deployment..."
cd /home/$(whoami)
rm -rf helpdesk-app
docker-compose down --remove-orphans 2>/dev/null

# Step 2: Clone fresh code from GitHub
echo "[2/6] Cloning latest code from GitHub..."
git clone $REPO_URL helpdesk-app
cd $APP_DIR

# Step 3: Create production environment file
echo "[3/6] Setting up production environment..."
cat > .env << 'EOF'
# Production Environment Configuration
NODE_ENV=production

# Database configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=helpdesk
DB_USER=postgres
DB_PASSWORD=SECURE_DB_PASSWORD_HERE

# JWT Secret - CHANGE THIS!
JWT_SECRET=SECURE_JWT_SECRET_HERE

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SECURE_REDIS_PASSWORD_HERE

# Frontend configuration
FRONTEND_PORT=8080
API_URL=http://34.55.113.9:3001
EOF

echo "⚠️  IMPORTANT: Edit .env file with secure passwords!"

# Step 4: Install Docker and Docker Compose if needed
echo "[4/6] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $(whoami)
    echo "Please log out and log back in for Docker permissions to take effect"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Step 5: Build and start services
echo "[5/6] Building and starting services..."
docker-compose down --remove-orphans
docker-compose up -d --build --force-recreate

# Step 6: Show status
echo "[6/6] Checking deployment status..."
sleep 30
docker-compose ps
docker ps

echo "=========================================="
echo "DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Frontend: http://34.55.113.9:8080"
echo "Backend:  http://34.55.113.9:3001"
echo ""
echo "Don't forget to:"
echo "1. Edit .env with secure passwords"
echo "2. Configure GCP firewall rules for ports 8080 and 3001"
echo "=========================================="
