# Email Service Setup Guide

## Overview

This guide helps you configure email notifications for the helpdesk ticketing system in production.

## Quick Setup Options

### Option 1: Gmail (For Small Teams)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Update your `.env` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=your-email@gmail.com
```

### Option 2: SendGrid (Recommended for Production)

1. Create a SendGrid account: [sendgrid.com](https://sendgrid.com)
2. Generate an API key in SendGrid dashboard
3. Update your `.env` file:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Option 3: Mailgun (Alternative Production Option)

1. Create a Mailgun account: [mailgun.com](https://mailgun.com)
2. Get your SMTP credentials from Mailgun dashboard
3. Update your `.env` file:

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

## Testing Email Configuration

### Method 1: Admin Dashboard

1. Log into the system as an admin
2. Go to Admin Dashboard
3. Scroll to "Email Service Test" section
4. Enter a test email address
5. Click "Test Email"

### Method 2: Create a Test Ticket

1. Create a new ticket as a regular user
2. Check if you receive an email notification
3. Add a comment and verify comment notifications

## Troubleshooting

### Common Issues

**Error: "Authentication failed"**

- Verify SMTP credentials are correct
- For Gmail: Ensure you're using an App Password, not your regular password
- For SendGrid: Ensure API key has mail sending permissions

**Error: "Connection timeout"**

- Check SMTP_HOST and SMTP_PORT settings
- Verify firewall/network settings allow outbound SMTP connections
- Try different SMTP ports (587, 465, 25)

**Emails not being received**

- Check spam/junk folders
- Verify FROM_EMAIL domain is properly configured
- For custom domains: Set up SPF, DKIM, and DMARC records

### Testing Connection

Run this command to test email service connection:

```bash
# Access backend container
docker exec -it helpdesk-backend sh

# Run email test
node -e "
import emailService from './src/services/emailService.js';
emailService.testConnection().then(result => {
  console.log('Email service ready:', result);
  process.exit(0);
}).catch(err => {
  console.error('Email service error:', err);
  process.exit(1);
});
"
```

## Production Recommendations

### Security Best Practices

1. **Use Environment Variables**: Never commit SMTP credentials to version control
2. **Dedicated Email Account**: Use a dedicated email account for system notifications
3. **Domain Authentication**: Set up SPF, DKIM, and DMARC records for your domain
4. **Rate Limiting**: Configure email rate limits to prevent abuse

### Email Content Guidelines

1. **Professional Branding**: Customize email templates with your company branding
2. **Clear Subject Lines**: Ensure email subjects are descriptive and actionable
3. **Unsubscribe Options**: Consider adding unsubscribe functionality for users
4. **Mobile-Friendly**: Email templates are already responsive

### Monitoring and Maintenance

1. **Delivery Monitoring**: Monitor email delivery rates and bounce rates
2. **Error Logging**: Check application logs for email sending errors
3. **Regular Testing**: Periodically test email functionality
4. **Backup SMTP**: Consider configuring a backup SMTP service

## Environment Variables Reference

```bash
# Required Email Settings
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@yourdomain.com

# Optional Email Settings
TEST_EMAIL=admin@yourdomain.com
```

## Next Steps After Email Setup

1. **Test All Notification Types**:

   - Ticket creation notifications
   - Ticket update notifications
   - Comment notifications
   - Assignment notifications

2. **Configure Production Settings**:

   - Set up proper domain for FROM_EMAIL
   - Configure email templates with company branding
   - Set up email analytics and monitoring

3. **User Training**:
   - Inform users about email notifications
   - Provide instructions for managing email preferences
   - Document email notification behavior

## Support

If you encounter issues with email configuration:

1. Check the application logs: `docker logs helpdesk-backend`
2. Use the admin dashboard email test feature
3. Verify SMTP service status and credentials
4. Check network connectivity and firewall settings

For additional support, refer to your SMTP provider's documentation or contact their support team.
