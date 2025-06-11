#!/bin/bash

echo "========================================"
echo "🔧 GCP VM SSH TROUBLESHOOT SCRIPT"
echo "========================================"
echo

# GCP VM Details
GCP_VM_IP="34.173.186.108"
GCP_VM_USER="kovendhan2535"

echo "📋 Testing SSH Connection to GCP VM"
echo "----------------------------------------"
echo "Target: $GCP_VM_USER@$GCP_VM_IP"
echo

# Test 1: Basic SSH connectivity
echo "🧪 Test 1: Basic SSH Connection"
ssh -o ConnectTimeout=10 -o BatchMode=yes "$GCP_VM_USER@$GCP_VM_IP" "echo 'SSH connection successful'" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed"
    echo "💡 Troubleshooting steps:"
    echo "   1. Check if GCP VM is running: gcloud compute instances list"
    echo "   2. Verify SSH key is added to the VM"
    echo "   3. Check firewall rules allow SSH (port 22)"
fi
echo

# Test 2: Check VM resources
echo "🧪 Test 2: GCP VM System Information"
ssh -o ConnectTimeout=10 "$GCP_VM_USER@$GCP_VM_IP" << 'ENDSSH'
echo "🖥️  System Information:"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "CPU: $(nproc) cores"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $4}') free"
echo

echo "🐳 Docker Status:"
if command -v docker &> /dev/null; then
    echo "✅ Docker installed: $(docker --version)"
    if systemctl is-active --quiet docker; then
        echo "✅ Docker service running"
    else
        echo "❌ Docker service not running"
    fi
else
    echo "❌ Docker not installed"
fi

echo

echo "🔧 Docker Compose Status:"
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose installed: $(docker-compose --version)"
else
    echo "❌ Docker Compose not installed"
fi
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Could not connect to GCP VM for system check"
fi
echo

# Test 3: Check existing deployment
echo "🧪 Test 3: Check Existing Deployment"
ssh -o ConnectTimeout=10 "$GCP_VM_USER@$GCP_VM_IP" << 'ENDSSH'
if [ -d "/opt/helpdesk-production" ]; then
    echo "📁 Production directory exists"
    cd /opt/helpdesk-production
    
    if [ -f "docker-compose.yml" ]; then
        echo "✅ Docker Compose file found"
        echo "🔍 Running containers:"
        sudo docker-compose ps 2>/dev/null || echo "No containers running"
    else
        echo "❌ Docker Compose file not found"
    fi
else
    echo "📁 Production directory does not exist"
fi
ENDSSH

echo

# Test 4: Check ports
echo "🧪 Test 4: Check Required Ports"
echo "Checking if ports are accessible..."

for port in 8080 3001; do
    echo -n "Port $port: "
    if timeout 5 bash -c "</dev/tcp/$GCP_VM_IP/$port" 2>/dev/null; then
        echo "✅ Open"
    else
        echo "❌ Closed/Filtered"
    fi
done

echo

echo "📋 Summary & Next Steps"
echo "----------------------------------------"
echo "1. If SSH fails:"
echo "   - Verify your SSH key is added to the GCP VM"
echo "   - Check GCP Console → Compute Engine → VM instances"
echo "   - Ensure the VM is running and has the correct SSH keys"
echo
echo "2. If Docker is missing:"
echo "   - The deployment workflow will install it automatically"
echo "   - Or SSH to the VM and run: curl -fsSL https://get.docker.com | sh"
echo
echo "3. If ports are closed:"
echo "   - Check GCP firewall rules"
echo "   - Ensure ports 8080 and 3001 are allowed"
echo
echo "4. To manually deploy:"
echo "   - Run: ./deploy-production.sh"
echo "   - Or trigger GitHub Actions workflow"
echo

echo "========================================"
echo "🔧 GCP VM troubleshooting completed!"
echo "========================================"
