#!/bin/bash

# GCP Firewall Configuration for Helpdesk System
# This script configures the necessary firewall rules for the helpdesk application

echo "🔥 Configuring GCP Firewall Rules for Helpdesk System"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create firewall rule
create_firewall_rule() {
    local name=$1
    local port=$2
    local description=$3
    
    echo -e "${YELLOW}Creating firewall rule: $name (port $port)${NC}"
    
    if gcloud compute firewall-rules create $name \
        --allow tcp:$port \
        --source-ranges 0.0.0.0/0 \
        --description "$description" \
        --format="value(name)" 2>/dev/null; then
        echo -e "${GREEN}✅ Successfully created: $name${NC}"
    else
        echo -e "${YELLOW}⚠️  Rule $name may already exist or error occurred${NC}"
        # Check if rule exists
        if gcloud compute firewall-rules describe $name --format="value(name)" 2>/dev/null; then
            echo -e "${GREEN}✅ Rule $name already exists${NC}"
        else
            echo -e "${RED}❌ Failed to create rule: $name${NC}"
        fi
    fi
}

# Check if gcloud is installed and authenticated
echo "🔍 Checking gcloud CLI..."
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Please install Google Cloud SDK first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q @; then
    echo -e "${RED}❌ Not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI is ready${NC}"

# Get current project
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT" ]; then
    echo -e "${RED}❌ No GCP project set${NC}"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Using project: $PROJECT${NC}"
echo ""

# Create firewall rules for helpdesk system
echo "🔥 Creating firewall rules..."

# HTTP (port 80) for frontend
create_firewall_rule "helpdesk-http" "80" "Allow HTTP traffic for Helpdesk frontend"

# HTTPS (port 443) for secure frontend access
create_firewall_rule "helpdesk-https" "443" "Allow HTTPS traffic for Helpdesk frontend"

# Backend API (port 3001)
create_firewall_rule "helpdesk-api" "3001" "Allow API traffic for Helpdesk backend"

# SSH (port 22) - usually exists but ensure it's there
create_firewall_rule "helpdesk-ssh" "22" "Allow SSH access for deployment and management"

echo ""
echo "🔍 Current firewall rules for helpdesk:"
gcloud compute firewall-rules list --filter="name~helpdesk" --format="table(name,direction,sourceRanges.list():label=SRC_RANGES,allowed[].map().firewall_rule().list():label=ALLOW,targetTags.list():label=TARGET_TAGS)"

echo ""
echo -e "${GREEN}✅ Firewall configuration completed!${NC}"
echo ""
echo "📋 Summary of open ports:"
echo "  🌐 Port 80  - HTTP frontend access"
echo "  🔒 Port 443 - HTTPS frontend access"  
echo "  🔧 Port 3001 - Backend API"
echo "  🔑 Port 22  - SSH access"
echo ""
echo "🌐 Your helpdesk system should now be accessible at:"
echo "  Frontend: http://34.173.186.108"
echo "  Backend:  http://34.173.186.108:3001"
echo ""
echo "🔍 If you still can't access the application:"
echo "  1. Check that Docker containers are running on the VM"
echo "  2. Verify the VM instance has the correct network tags"
echo "  3. Check GCP Console → VPC network → Firewall for the rules"
