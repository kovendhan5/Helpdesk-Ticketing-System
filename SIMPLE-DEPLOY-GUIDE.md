# Simple Deployment Guide

## Quick Fix Applied

The complex CI/CD pipeline was causing deployment failures due to:
- YAML formatting issues
- Complex multi-step file transfers
- Working directory problems
- Missing file issues

## New Simple Deployment

The new workflow (`.github/workflows/simple-deploy.yml`) uses a **single-step approach**:

1. **Package everything**: Creates `deploy.tar.gz` with all files
2. **Transfer once**: Single SCP command
3. **Extract and deploy**: Single SSH session to extract and start services

## Key Improvements

✅ **Reliable file transfer**: Using tar package eliminates missing file issues  
✅ **Single working directory**: All commands run in `/opt/helpdesk-ticketing-system`  
✅ **Atomic deployment**: Either everything works or fails cleanly  
✅ **Simple Docker setup**: Installs Docker Compose via package manager  
✅ **Proper error handling**: Uses `set -e` for immediate failure detection  

## What the Workflow Does

```bash
# 1. Create deployment package locally
tar czf deploy.tar.gz docker-compose.yml backend/ frontend/

# 2. Setup server environment
sudo mkdir -p /opt/helpdesk-ticketing-system
sudo chown ubuntu:ubuntu /opt/helpdesk-ticketing-system

# 3. Stop existing services if running
sudo docker-compose down

# 4. Transfer and extract files
scp deploy.tar.gz ubuntu@$VM_IP:/opt/helpdesk-ticketing-system/
tar xzf deploy.tar.gz

# 5. Start services
sudo docker-compose up -d --build
```

## Required GitHub Secrets

Make sure these secrets are configured in your repository:

- `SSH_PRIVATE_KEY`: Your private SSH key for server access
- `VM_IP`: The IP address of your production server

## Verification

After deployment, the workflow will:
- Show container status with `docker-compose ps`
- Run a health check on `http://VM_IP:3000/`

## If It Still Fails

1. Check the Actions tab for specific error messages
2. Ensure your server has sufficient disk space
3. Verify SSH key has proper permissions on the server
4. Check that port 3000 is open on your server

The old complex workflow has been disabled (`ci-cd.yml.disabled`) to prevent conflicts.
