# SSH Key Setup for GitHub Actions

## Current Issue
Your Google Cloud VM uses temporary SSH keys that expire quickly. GitHub Actions needs a permanent key.

## Solution Steps

### 1. Generate SSH Key Pair (Run on your local machine)
```bash
# Generate a new SSH key pair specifically for deployment
ssh-keygen -t ed25519 -f ~/.ssh/helpdesk-deploy -C "github-actions-helpdesk"

# This creates:
# ~/.ssh/helpdesk-deploy (private key) - for GitHub secrets
# ~/.ssh/helpdesk-deploy.pub (public key) - for server
```

### 2. Add Public Key to Server
Copy the public key content:
```bash
cat ~/.ssh/helpdesk-deploy.pub
```

Then add it to your server:
```bash
# On your server (kovendhan2535@helpdesk-vm):
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
```

### 3. Add Private Key to GitHub Secrets
```bash
# Get private key content:
cat ~/.ssh/helpdesk-deploy
```

Copy the ENTIRE output and add to GitHub Secrets as `SSH_PRIVATE_KEY`

### 4. Update GitHub Secrets
- VM_IP: `34.72.217.171`
- SSH_PRIVATE_KEY: [Private key content from step 3]

### 5. Test Connection
```bash
ssh -i ~/.ssh/helpdesk-deploy ubuntu@34.72.217.171
```

## Alternative: Use Existing Key
If you already have a permanent SSH key, use that instead of generating a new one.
"# SSH keys configured successfully"  
