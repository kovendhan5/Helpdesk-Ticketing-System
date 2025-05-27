#!/bin/bash

# Secure Setup Script for Helpdesk Ticketing System
# This script helps you configure secure environment variables

set -e

echo "🔐 Helpdesk Ticketing System - Secure Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists. This will create .env.new to avoid overwriting.${NC}"
    ENV_FILE=".env.new"
else
    ENV_FILE=".env"
fi

echo -e "${BLUE}📝 Creating secure environment configuration...${NC}"

# Generate secure JWT secret
echo -e "${GREEN}🔑 Generating secure JWT secret...${NC}"
JWT_SECRET=$(openssl rand -hex 64)

# Generate secure database password
echo -e "${GREEN}🔒 Generating secure database password...${NC}"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create .env file
cat > $ENV_FILE << EOF
# 🔐 Helpdesk Ticketing System - Environment Variables
# Generated on: $(date)
# ⚠️  NEVER commit this file to version control!

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration (Auto-generated secure secret)
JWT_SECRET=$JWT_SECRET

# Session Configuration
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# Admin Configuration
ADMIN_EMAIL=admin@yourcompany.com

# Production Database (uncomment and configure for production)
# DB_HOST=your_cloud_sql_host
# DB_USER=your_production_db_user
# DB_PASSWORD=your_production_db_password
EOF

echo -e "${GREEN}✅ Environment file created: $ENV_FILE${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo -e "Database Password: ${GREEN}$DB_PASSWORD${NC}"
echo -e "JWT Secret: ${GREEN}Generated (64 bytes)${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo -e "${RED}1. Keep your .env file secure and never commit it to version control${NC}"
echo -e "${RED}2. Change the ADMIN_EMAIL to your actual email${NC}"
echo -e "${RED}3. For production, use a managed database service${NC}"
echo -e "${RED}4. Regularly rotate your JWT secret${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Review and update the $ENV_FILE file"
echo "2. Run: docker-compose up -d postgres"
echo "3. Run: npm run setup-db-secure (in backend directory)"
echo "4. Run: docker-compose up"
echo ""
echo -e "${GREEN}✅ Setup complete! Your system is now configured securely.${NC}"
