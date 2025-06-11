#!/bin/bash

# Test GCP VM Connection
# This script helps verify your SSH connection to GCP VM

set -e

echo "🔍 Testing GCP VM Connection..."
echo "======================================"

# Configuration (update these if needed)
GCP_VM_IP="34.173.186.108"
GCP_VM_USER="kovendhan2535"

echo "📡 VM IP: $GCP_VM_IP"
echo "👤 VM User: $GCP_VM_USER"
echo ""

# Test SSH connection
echo "🔑 Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $GCP_VM_USER@$GCP_VM_IP "echo 'SSH connection successful!'"; then
    echo "✅ SSH connection working!"
else
    echo "❌ SSH connection failed!"
    echo "💡 Make sure:"
    echo "   - Your SSH key is properly configured"
    echo "   - VM is running and accessible"
    echo "   - Firewall allows SSH (port 22)"
    exit 1
fi

echo ""
echo "🐳 Checking Docker on VM..."
if ssh -o ConnectTimeout=10 $GCP_VM_USER@$GCP_VM_IP "docker --version && docker-compose --version"; then
    echo "✅ Docker is installed and accessible!"
else
    echo "❌ Docker not found or not accessible"
    echo "💡 Install Docker on your VM:"
    echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "   sudo sh get-docker.sh"
    echo "   sudo usermod -aG docker $USER"
fi

echo ""
echo "🔍 Checking VM resources..."
ssh -o ConnectTimeout=10 $GCP_VM_USER@$GCP_VM_IP "
echo '💾 Memory:' && free -h | grep Mem
echo '💿 Disk:' && df -h / | tail -1
echo '🖥️  CPU:' && nproc && cat /proc/cpuinfo | grep 'model name' | head -1
"

echo ""
echo "🌐 Checking open ports..."
ssh -o ConnectTimeout=10 $GCP_VM_USER@$GCP_VM_IP "
echo 'Checking if ports 8080 and 3001 are available...'
if ! sudo netstat -tlnp | grep -E ':(8080|3001) '; then
    echo '✅ Ports 8080 and 3001 are available'
else
    echo '⚠️  Some ports may be in use:'
    sudo netstat -tlnp | grep -E ':(8080|3001) '
fi
"

echo ""
echo "======================================"
echo "🎉 VM Connection Test Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add missing GitHub secrets (DB_PASSWORD, JWT_SECRET, REDIS_PASSWORD)"
echo "2. Commit and push your changes"
echo "3. Monitor GitHub Actions deployment"
echo "4. Access your app at http://$GCP_VM_IP:8080"
