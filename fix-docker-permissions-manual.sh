#!/bin/bash

# 🔧 Docker Permission Fix Script
# This script must be run manually on the VM to add the user to the docker group

echo "🔧 Docker Permission Fix for Helpdesk Deployment"
echo "================================================"
echo ""

# Get current user
CURRENT_USER=$(whoami)
echo "👤 Current user: $CURRENT_USER"

# Check current Docker access
echo "🔍 Testing current Docker access..."
if docker ps &>/dev/null; then
    echo "✅ Docker access already working!"
    echo "🎉 No fix needed. You can run the deployment workflow now."
    exit 0
else
    echo "❌ Docker access denied (expected)"
fi

echo ""
echo "🔧 Applying Docker permission fix..."
echo "======================================"

# Add user to docker group
echo "Adding user '$CURRENT_USER' to docker group..."
sudo usermod -aG docker $CURRENT_USER

if [ $? -eq 0 ]; then
    echo "✅ User added to docker group successfully!"
else
    echo "❌ Failed to add user to docker group"
    echo "Please run this command manually:"
    echo "sudo usermod -aG docker $CURRENT_USER"
    exit 1
fi

echo ""
echo "🔄 Activating new group membership..."

# Try to activate new group membership
if command -v newgrp &> /dev/null; then
    echo "Attempting to activate docker group for current session..."
    # Note: newgrp in scripts has limitations, user may need to logout/login
    exec newgrp docker
else
    echo "newgrp command not available"
fi

echo ""
echo "🧪 Testing Docker access with new permissions..."

# Test Docker access
if docker ps &>/dev/null; then
    echo "✅ Docker access working!"
    echo "🎉 Fix successful! You can now run the deployment workflow."
else
    echo "⚠️ Docker access still not working in current session"
    echo ""
    echo "📋 **Manual Steps Required:**"
    echo "1. Logout from the VM: exit"
    echo "2. Login again: ssh $CURRENT_USER@$(hostname -I | awk '{print $1}')"
    echo "3. Test Docker: docker ps"
    echo "4. If working, run the deployment workflow"
    echo ""
    echo "💡 **Alternative**: Open a new SSH session to test"
fi

echo ""
echo "📋 **Verification Commands:**"
echo "• Check groups: groups"
echo "• Test Docker: docker ps"
echo "• Check Docker socket: ls -la /var/run/docker.sock"

echo ""
echo "🚀 **Next Steps After Fix:**"
echo "1. Verify Docker access: docker ps"
echo "2. Go to GitHub Actions: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions"
echo "3. Run '🚀 Deploy without Sudo' workflow"
echo "4. Configure GCP firewall rules"
echo "5. Access application at http://$(curl -s ifconfig.me || echo 'YOUR_VM_IP')"
