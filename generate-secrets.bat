# SECURE SECRETS GENERATION EXAMPLES
# Use these commands to generate secure secrets for your deployment

# Generate Database Password (32 characters)
echo "DB_PASSWORD example:"
openssl rand -base64 32 2>/dev/null || echo "K8mP2nL9rT5wX1sF0gH4jC7vB6eN3qR8"

# Generate JWT Secret (64 characters) 
echo ""
echo "JWT_SECRET example:"
openssl rand -base64 64 2>/dev/null || echo "A9k2L5m8N1p4Q7r0S3t6U9w2X5y8Z1a4B7c0D3e6F9g2H5j8K1l4M7n0P3q6R9s2T5u8V1w4X7y0Z3"

echo ""
echo "Copy these values to your GitHub Secrets configuration."
