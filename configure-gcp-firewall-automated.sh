#!/bin/bash

# 🔥 GCP Firewall Configuration Script for Helpdesk System
# This script configures firewall rules to allow access to the helpdesk application

echo "🔥 Configuring GCP Firewall Rules for Helpdesk System"
echo "====================================================="

# Set your project ID (replace with your actual project ID)
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No GCP project configured. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "📍 Project ID: $PROJECT_ID"
echo "🖥️ VM Host: 34.173.186.108"
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not installed. Please install it first."
    echo "📖 Installation guide: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Function to create firewall rule
create_firewall_rule() {
    local rule_name=$1
    local port=$2
    local description=$3
    
    echo "🔧 Creating firewall rule: $rule_name (Port $port)"
    
    if gcloud compute firewall-rules describe "$rule_name" --project="$PROJECT_ID" &>/dev/null; then
        echo "⚠️  Rule $rule_name already exists. Updating..."
        gcloud compute firewall-rules update "$rule_name" \
            --allow tcp:$port \
            --source-ranges 0.0.0.0/0 \
            --description "$description" \
            --project="$PROJECT_ID" \
            --quiet
    else
        echo "✨ Creating new rule: $rule_name"
        gcloud compute firewall-rules create "$rule_name" \
            --allow tcp:$port \
            --source-ranges 0.0.0.0/0 \
            --description "$description" \
            --project="$PROJECT_ID" \
            --quiet
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Rule $rule_name created/updated successfully"
    else
        echo "❌ Failed to create/update rule $rule_name"
        return 1
    fi
    echo ""
}

# Create firewall rules
echo "🚀 Creating firewall rules..."
echo ""

# Rule 1: HTTP Frontend (Port 80)
create_firewall_rule "helpdesk-frontend-http" "80" "Allow HTTP access to Helpdesk frontend application"

# Rule 2: Backend API (Port 3001) 
create_firewall_rule "helpdesk-backend-api" "3001" "Allow access to Helpdesk backend API and WebSocket"

# Rule 3: SSH (Port 22) - Usually exists but let's ensure it
create_firewall_rule "helpdesk-ssh-access" "22" "Allow SSH access to Helpdesk VM"

echo "🔍 Verifying firewall rules..."
echo "=============================="
gcloud compute firewall-rules list \
    --filter="name:(helpdesk-frontend-http OR helpdesk-backend-api OR helpdesk-ssh-access)" \
    --format="table(name,direction,sourceRanges.list():label=SRC_RANGES,allowed[].map().firewall_rule().list():label=ALLOW,targetTags.list():label=TARGET_TAGS)" \
    --project="$PROJECT_ID"

echo ""
echo "🎉 Firewall Configuration Complete!"
echo "=================================="
echo ""
echo "✅ **Configured Rules:**"
echo "• helpdesk-frontend-http: Port 80 (Frontend access)"
echo "• helpdesk-backend-api: Port 3001 (API & WebSocket)"
echo "• helpdesk-ssh-access: Port 22 (SSH access)"
echo ""
echo "🔗 **Application Access URLs:**"
echo "• Frontend: http://34.173.186.108"
echo "• Backend API: http://34.173.186.108:3001"
echo "• Health Check: http://34.173.186.108:3001/health"
echo ""
echo "👤 **Default Login Credentials:**"
echo "• Admin: admin@example.com / admin123"
echo "• User: user@example.com / user123"
echo ""
echo "⚠️  **Security Note:**"
echo "These rules allow access from anywhere (0.0.0.0/0)."
echo "For production use, consider restricting source ranges to specific IPs."
echo ""
echo "📋 **Next Steps:**"
echo "1. Test application access at http://34.173.186.108"
echo "2. Verify API endpoints at http://34.173.186.108:3001/health"
echo "3. Test user authentication and ticket creation"
echo "4. Verify real-time WebSocket updates"
