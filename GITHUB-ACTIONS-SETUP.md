# GitHub Actions Setup Guide

## Required Repository Secrets

To enable automated deployment, configure these secrets in your GitHub repository:

### 1. Go to Repository Settings
- Navigate to your repository on GitHub
- Click on `Settings` tab
- Go to `Secrets and variables` → `Actions`

### 2. Add Required Secrets

#### Essential Secrets
- `SSH_PRIVATE_KEY`: Your SSH private key for server access
- `VM_IP`: IP address of your production server

#### Optional Secrets  
- `SLACK_WEBHOOK`: Slack webhook URL for deployment notifications

### 3. Secret Values

#### SSH_PRIVATE_KEY
```bash
# Generate SSH key pair (if not already done)
ssh-keygen -t rsa -b 4096 -C "github-actions@yourproject.com"

# Copy private key content (including headers)
cat ~/.ssh/id_rsa
```

Copy the entire output including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...key content...
-----END OPENSSH PRIVATE KEY-----
```

#### VM_IP
- Your production server's public IP address
- Example: `203.0.113.45`

#### SLACK_WEBHOOK (Optional)
- Create a Slack app and incoming webhook
- Format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

## Server Prerequisites

Ensure your production server has:

```bash
# Create deployment directory
sudo mkdir -p /opt/helpdesk-ticketing-system
sudo chown ubuntu:ubuntu /opt/helpdesk-ticketing-system

# Install required software
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu

# Restart session to apply group changes
sudo systemctl enable docker
sudo systemctl start docker
```

## Deployment Workflow

The CI/CD pipeline includes:

1. **Security Scan**: Check for sensitive files and vulnerabilities
2. **Test**: Run frontend and backend tests
3. **Build**: Validate application builds
4. **Deploy**: Automated deployment to production server

## Triggering Deployment

Deployment runs automatically on:
- Push to `main` branch
- Push to `develop` branch  
- Pull requests to `main` branch

## Monitoring Deployment

1. Go to `Actions` tab in your repository
2. Click on the running workflow
3. Monitor each step's progress
4. Check logs for any issues

## Troubleshooting

### Common Issues

#### SSH Connection Failed
- Verify `SSH_PRIVATE_KEY` is correctly formatted
- Ensure `VM_IP` is accessible from GitHub's IP ranges
- Check server SSH configuration

#### Docker Issues
- Ensure Docker is installed and running on server
- Verify user permissions for Docker commands
- Check available disk space

#### File Transfer Failed
- Verify server directory permissions
- Check network connectivity
- Ensure sufficient disk space

### Debug Steps

1. Check workflow logs in GitHub Actions
2. SSH to server manually to verify setup
3. Test Docker commands locally
4. Verify environment variables

## Security Notes

- Never commit SSH keys or secrets to repository
- Use strong, unique passwords for all services
- Regularly rotate SSH keys and secrets
- Monitor access logs for suspicious activity
- Keep server software updated

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review workflow logs for error details
3. Verify all prerequisites are met
4. Test individual components manually