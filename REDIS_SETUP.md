# Redis Secret Configuration Guide

## Overview

This guide explains how to set up the Redis password for the Helpdesk Ticketing System. Redis is used for secure token storage and session management, which is critical for maintaining security across application restarts.

## GitHub Secrets Setup

To properly deploy the application, add the following secret to your GitHub repository:

### REDIS_PASSWORD

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `REDIS_PASSWORD`
5. Value: Generate a secure random string using one of these methods:

   ```
   # Linux/macOS
   openssl rand -base64 24

   # Windows PowerShell
   $bytes = New-Object Byte[] 18
   (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

6. Click "Add secret"

## Testing Redis Locally

To test Redis configuration locally:

1. Make sure you have Docker installed
2. Create a `.env` file with the following content:
   ```
   REDIS_PASSWORD=your_secure_password_here
   ```
3. Run Docker Compose:
   ```bash
   docker-compose up redis
   ```
4. Test the connection:
   ```bash
   docker exec -it helpdesk-redis redis-cli
   auth your_secure_password_here
   ping
   ```
   You should get a "PONG" response.

## Troubleshooting

If you're experiencing Redis-related issues:

### Connection Issues

Check that:

1. Redis service is running: `docker ps | grep redis`
2. Redis password is correctly set in environment
3. Backend service can communicate with Redis (check network)

### Data Persistence Issues

If data is not persisting:

1. Verify the Redis volume is correctly mounted
2. Check Redis logs: `docker-compose logs redis`
3. Ensure AOF persistence is enabled

### Authorization Failures

If you see "NOAUTH Authentication required" errors:

1. Ensure `REDIS_PASSWORD` is set in all relevant environments
2. Check that the backend is correctly passing the password to Redis
3. Reset the connection to refresh credentials

## Security Best Practices

1. Use a strong, unique password (at least 16 characters)
2. Rotate the Redis password periodically (every 90 days)
3. Limit Redis access to only the backend service
4. Never expose Redis port 6379 to the public internet
5. Ensure Redis data is backed up regularly
6. Monitor Redis for suspicious activity

## Migrating Existing Data

If you're adding Redis to an existing deployment:

1. Implement the Redis service first
2. Deploy the application with the fallback mechanism enabled
3. Monitor for any session-related issues
4. Full deployment will auto-migrate sessions to Redis

For any questions or issues, please contact the security team.
