#!/bin/bash

# Docker Permission Fix for Helpdesk System
echo "🐳 Fixing Docker Permissions for User"
echo "===================================="

echo "🔍 Current user: $(whoami)"
echo "🔍 Current groups: $(groups)"

echo "🔧 Adding user to docker group..."
sudo usermod -aG docker $(whoami)

echo "✅ User added to docker group"
echo "🔄 You need to log out and log back in for changes to take effect"

echo ""
echo "🧪 Testing Docker access (after re-login):"
echo "docker ps"
echo "docker --version"

echo ""
echo "📋 Next steps:"
echo "1. Exit this SSH session"
echo "2. SSH back into the VM"
echo "3. Run: docker ps (should work without sudo)"
echo "4. Then run the robust deployment workflow"
