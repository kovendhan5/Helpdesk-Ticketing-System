#!/bin/bash
# GCP VM Production Deployment Commands
# Run these commands step by step on your GCP VM

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Helpdesk System Production Deployment on GCP VM${NC}"
echo "Target VM: 34.173.186.108"
echo "=================================================================="

# Step 1: Update system
echo -e "${BLUE}📋 Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"

# Step 2: Install Docker
echo -e "${BLUE}📋 Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "${BLUE}📋 Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Step 4: Create application directory
echo -e "${BLUE}📋 Step 4: Creating application directory...${NC}"
sudo mkdir -p /opt/helpdesk
sudo chown $USER:$USER /opt/helpdesk
echo -e "${GREEN}✅ Application directory created${NC}"

# Step 5: Clone repository (you'll need to replace this with your actual repo)
echo -e "${BLUE}📋 Step 5: Cloning application code...${NC}"
cd /opt/helpdesk
# Replace with your actual repository URL
git clone https://github.com/yourusername/helpdesk-ticketing-system.git .

# Alternative: If you're copying files manually
echo -e "${YELLOW}⚠️ If you're copying files manually, ensure all files are in /opt/helpdesk${NC}"

# Step 6: Configure environment
echo -e "${BLUE}📋 Step 6: Setting up environment configuration...${NC}"
cp .env.production.template .env.production

echo -e "${YELLOW}📝 Environment already configured for VM IP: 34.173.186.108${NC}"
echo "   Using pre-configured .env.production file"
echo ""

# Step 7: Configure firewall (GCP)
echo -e "${BLUE}📋 Step 7: Configuring GCP firewall...${NC}"
echo -e "${YELLOW}Run this command from your local machine with gcloud CLI:${NC}"
echo "gcloud compute firewall-rules create helpdesk-app-ports \\"
echo "  --allow tcp:80,tcp:3001 \\"
echo "  --source-ranges 0.0.0.0/0 \\"
echo "  --description \"Allow HTTP traffic for Helpdesk app\""

# Step 8: Build and start application
echo -e "${BLUE}📋 Step 8: Building and starting application...${NC}"
echo "docker-compose -f docker-compose.prod.yml --env-file .env.production build"
echo "docker-compose -f docker-compose.prod.yml --env-file .env.production up -d"

# Step 9: Verify deployment
echo -e "${BLUE}📋 Step 9: Verification commands...${NC}"
echo "# Check container status:"
echo "docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "# Check logs:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "# Test endpoints:"
echo "curl http://localhost/health"
echo "curl http://localhost:3001/api/health"
echo ""

# Step 10: Access information
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================================================="
echo -e "${BLUE}📱 Access your application:${NC}"
echo "Frontend: http://34.173.186.108"
echo "Backend:  http://34.173.186.108:3001/api"
echo ""
echo -e "${BLUE}🔐 Default credentials:${NC}"
echo "Admin: admin@example.com / admin123"
echo "User:  user@example.com / user123"
echo ""
echo -e "${YELLOW}⚠️ Remember to:${NC}"
echo "1. Update default passwords after first login"
echo "2. Configure SSL/TLS for production"
echo "3. Set up monitoring and backups"
echo "4. Configure domain name (optional)"
