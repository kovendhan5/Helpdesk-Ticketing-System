# 🔑 GitHub Secrets Configuration

To use GitHub Actions for automated deployment, you need to set up these secrets in your GitHub repository.

## 📋 Required Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. SSH Configuration

- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Your private SSH key content (the contents of your `~/.ssh/id_rsa` file)

### 2. VM Host

- **Name**: `VM_HOST`
- **Value**: `34.173.186.108` (or `helpdesk-vm` if DNS is configured)

### 3. VM User

- **Name**: `VM_USER`
- **Value**: `kovendhan2535`

## 🔧 How to Get Your SSH Private Key

### Option 1: Generate New SSH Key Pair

```bash
# On your local machine or VM
ssh-keygen -t rsa -b 4096 -C "github-actions@helpdesk-vm"

# Copy the private key content
cat ~/.ssh/id_rsa

# Copy the public key to your VM
ssh-copy-id kovendhan2535@34.173.186.108
```

### Option 2: Use Existing SSH Key

```bash
# Display your existing private key
cat ~/.ssh/id_rsa

# Copy the entire output (including -----BEGIN and -----END lines)
```

## 🚀 Setup Steps

1. **Generate SSH Key** (if you don't have one)
2. **Add Public Key to VM**: `ssh-copy-id kovendhan2535@34.173.186.108`
3. **Copy Private Key Content** to GitHub Secrets
4. **Add VM_HOST and VM_USER** secrets
5. **Push your code** to trigger deployment

## 🔄 Deployment Triggers

- **Automatic**: Deploys when you push to `main` branch
- **Manual**: Use "Actions" tab → "Deploy Helpdesk System" → "Run workflow"
- **Pull Request**: Runs tests only (no deployment)

## 🏥 Health Checks

The workflow includes:

- ✅ Automated testing
- ✅ Docker container health checks
- ✅ API endpoint verification
- ✅ Service status monitoring

## 🔍 Monitoring Deployment

1. Go to **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. Monitor real-time deployment progress
4. Check logs for any issues

## 🆘 Troubleshooting

**SSH Connection Issues:**

- Verify your private key is correct
- Ensure public key is added to VM
- Check VM_HOST and VM_USER values

**Deployment Failures:**

- Check the Actions logs
- Verify Docker is running on VM
- Ensure ports 80 and 3001 are open

## 🎯 Benefits

- ✅ **Zero-downtime deployments**
- ✅ **Automatic rollback on failure**
- ✅ **Health checks and monitoring**
- ✅ **Deployment history and logs**
- ✅ **Manual deployment option**
- ✅ **Secure secret management**
