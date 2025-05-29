# Security Configuration Instructions

## Critical Security Setup Required

### 1. Secure Key Management
Your SSH keys and credentials have been moved to: `k:\Devops\secure-keys\`

**NEVER commit these files to git:**
- helpdesk-key (SSH private key)
- helpdesk-key.pub (SSH public key)  
- credentials.json (GCP service account)

### 2. Environment Variables Setup
Copy `.env.example` to `.env` and set secure values:

```bash
# Generate secure JWT secret (64+ characters)
openssl rand -hex 64

# Use strong database passwords
# Set admin email for production
```

### 3. GitHub Secrets Configuration
Add these secrets to your GitHub repository:

```
SSH_PRIVATE_KEY: Contents of helpdesk-key file
VM_IP: Your production server IP address
SLACK_WEBHOOK: (Optional) Slack notification webhook
```

### 4. Production Security Checklist

- [ ] SSH keys moved to secure location (✅ DONE)
- [ ] .gitignore updated with security patterns (✅ DONE)
- [ ] CI/CD pipeline with security scanning (✅ DONE)
- [ ] JWT secret generated with secure random value
- [ ] Database passwords changed from defaults
- [ ] Production environment variables configured
- [ ] GitHub repository secrets configured
- [ ] SSL/TLS certificates configured for production
- [ ] Firewall rules configured on production server

### 5. Monitoring & Maintenance
- Regular dependency updates (npm audit)
- Log monitoring for security events
- Regular backup of sensitive data
- Access review and key rotation

## Emergency Contact
If you suspect a security breach:
1. Immediately revoke all active sessions
2. Change all passwords and secrets
3. Review access logs
4. Update security documentation
