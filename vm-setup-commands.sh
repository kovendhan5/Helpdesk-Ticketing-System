#!/bin/bash
# Complete VM Setup Commands for GitHub Actions CI/CD
# Run these commands on your VM: ubuntu@YOUR_VM_IP_HERE

echo "Setting up VM for automated deployment..."

# Create and configure the .env file properly
cat > /opt/helpdesk/.env << 'EOF'
# Database Configuration
DB_HOST=YOUR_DATABASE_IP_HERE
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=YOUR_SECURE_DATABASE_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=YOUR_256_BIT_JWT_SECRET_HERE
JWT_ISSUER=helpdesk-system
JWT_AUDIENCE=helpdesk-users
JWT_EXPIRES_IN=1h

# Security Configuration
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# Server Configuration
PORT=3000
NODE_ENV=production
EOF

echo "Environment file created successfully!"

# Verify the .env file was created
echo "Checking .env file contents:"
cat /opt/helpdesk/.env

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "Installing nginx..."
sudo apt update
sudo apt install -y nginx

# Configure nginx
echo "Configuring nginx..."
sudo tee /etc/nginx/sites-available/helpdesk << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
echo "Enabling nginx site..."
sudo ln -sf /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid!"
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "Nginx configuration error!"
    exit 1
fi

# Set up PM2 startup
echo "Setting up PM2 startup..."
pm2 startup

echo ""
echo "VM Setup Complete!"
echo ""
echo "IMPORTANT: Run the PM2 startup command that was just displayed above!"
echo "    It should look like: sudo env PATH=... pm2 startup systemd -u ubuntu --hp /home/ubuntu"
echo ""
echo "Verification:"
echo "  Environment file: /opt/helpdesk/.env"
echo "  PM2 installed globally"
echo "  Nginx installed and configured"
echo "  Site enabled and nginx reloaded"
echo ""
echo "Ready for automated deployment!"
echo "   Next: Configure GitHub secrets and push to trigger deployment"
