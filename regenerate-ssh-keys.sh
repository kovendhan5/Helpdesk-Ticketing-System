#!/bin/bash

# 🔧 SSH Key Regeneration Script for GitHub Actions
# Run this script on your VM to fix the SSH connection issue

echo "🔧 SSH Key Regeneration for GitHub Actions"
echo "==========================================="
echo ""

# Check if we're on the VM
CURRENT_USER=$(whoami)
echo "👤 Current user: $CURRENT_USER"

if [ "$CURRENT_USER" != "kovendhan2535" ]; then
    echo "⚠️ Warning: Expected user 'kovendhan2535', but current user is '$CURRENT_USER'"
    echo "Make sure you're running this on the correct VM"
    read -p "Continue anyway? (y/N): " continue_choice
    if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
        echo "Exiting..."
        exit 1
    fi
fi

echo ""
echo "🔑 Step 1: Backing up existing SSH configuration..."

# Create backup directory
mkdir -p ~/.ssh/backup
cp ~/.ssh/authorized_keys ~/.ssh/backup/authorized_keys.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing authorized_keys to backup"

echo "✅ Backup completed"

echo ""
echo "🔑 Step 2: Generating new SSH key pair for GitHub Actions..."

# Remove old GitHub Actions key if it exists
rm -f ~/.ssh/github_actions_key ~/.ssh/github_actions_key.pub

# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N "" -C "github-actions@helpdesk-vm"

if [ $? -eq 0 ]; then
    echo "✅ SSH key pair generated successfully"
else
    echo "❌ Failed to generate SSH key pair"
    exit 1
fi

echo ""
echo "🔑 Step 3: Adding public key to authorized_keys..."

# Add public key to authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Remove any duplicate entries
sort ~/.ssh/authorized_keys | uniq > ~/.ssh/authorized_keys.tmp
mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys

echo "✅ Public key added to authorized_keys"

echo ""
echo "🔑 Step 4: Setting proper permissions..."

# Set proper permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions_key
chmod 644 ~/.ssh/github_actions_key.pub

echo "✅ Permissions set correctly"

echo ""
echo "🔍 Step 5: Verifying SSH key setup..."

echo "SSH directory permissions:"
ls -la ~/.ssh/

echo ""
echo "Key files:"
ls -la ~/.ssh/github_actions_key*

echo ""
echo "✅ SSH key setup completed successfully!"

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1️⃣ Copy the private key below to GitHub Secrets"
echo "2️⃣ Go to: https://github.com/kovendhan5/Helpdesk-Ticketing-System/settings/secrets/actions"
echo "3️⃣ Click on 'SSH_PRIVATE_KEY' → 'Update'"
echo "4️⃣ Paste the ENTIRE private key (including headers)"
echo "5️⃣ Click 'Update secret'"
echo ""

echo "🔑 PRIVATE KEY FOR GITHUB SECRETS:"
echo "=================================="
cat ~/.ssh/github_actions_key
echo "=================================="
echo ""

echo "📝 COPY INSTRUCTIONS:"
echo "- Copy EVERYTHING from '-----BEGIN' to '-----END'"
echo "- Include the header and footer lines"
echo "- Don't add any extra spaces or characters"
echo ""

echo "🧪 VERIFICATION:"
echo "After updating GitHub Secrets, test the connection by running:"
echo "GitHub Actions → '🔍 SSH Connection Diagnostic' workflow"
echo ""

echo "🎉 Script completed! Update GitHub Secrets with the private key above."
