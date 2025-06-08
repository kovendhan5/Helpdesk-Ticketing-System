#!/bin/bash
# ONE-TIME SETUP SCRIPT
# Run this once on the VM to ensure Docker works without sudo

echo "=== DOCKER GROUP SETUP ==="
echo "Current user: $(whoami)"
echo "Current groups: $(groups)"

# Add user to docker group
echo "Adding user to docker group..."
sudo usermod -aG docker $USER

# Refresh group membership
echo "Refreshing group membership..."
newgrp docker

# Test docker without sudo
echo "Testing docker without sudo..."
docker --version
docker ps

echo "=== SETUP COMPLETE ==="
echo "Docker should now work without sudo for user: $USER"
echo "You may need to log out and log back in for changes to take effect."
