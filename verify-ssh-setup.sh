#!/bin/bash
# SSH Key Verification Script
# Run this on your VM to verify SSH setup

echo "🔍 SSH Key Verification on VM"
echo "=================================="

echo ""
echo "1. Checking if SSH private key exists..."
if [ -f ~/.ssh/id_rsa ]; then
    echo "✅ Private key found: ~/.ssh/id_rsa"
else
    echo "❌ Private key NOT found: ~/.ssh/id_rsa"
    echo "🔧 Generate with: ssh-keygen -t rsa -b 4096 -C 'github-actions@helpdesk-vm'"
fi

echo ""
echo "2. Checking if SSH public key exists..."
if [ -f ~/.ssh/id_rsa.pub ]; then
    echo "✅ Public key found: ~/.ssh/id_rsa.pub"
else
    echo "❌ Public key NOT found: ~/.ssh/id_rsa.pub"
fi

echo ""
echo "3. Checking authorized_keys..."
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✅ authorized_keys file exists"
    if grep -q "$(cat ~/.ssh/id_rsa.pub 2>/dev/null)" ~/.ssh/authorized_keys 2>/dev/null; then
        echo "✅ Public key is in authorized_keys"
    else
        echo "❌ Public key NOT in authorized_keys"
        echo "🔧 Fix with: cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
    fi
else
    echo "❌ authorized_keys file NOT found"
    echo "🔧 Fix with: cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
fi

echo ""
echo "4. Checking SSH permissions..."
ls -la ~/.ssh/id_rsa ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys 2>/dev/null
echo ""
echo "Expected permissions:"
echo "  id_rsa: -rw------- (600)"
echo "  id_rsa.pub: -rw-r--r-- (644)"
echo "  authorized_keys: -rw-r--r-- (644)"

echo ""
echo "5. SSH service status..."
sudo systemctl status ssh --no-pager -l

echo ""
echo "6. Your SSH private key (for GitHub Secrets):"
echo "---BEGIN COPY FROM HERE---"
cat ~/.ssh/id_rsa
echo "---END COPY TO HERE---"

echo ""
echo "🎯 Copy the private key above to GitHub Secrets as SSH_PRIVATE_KEY"
