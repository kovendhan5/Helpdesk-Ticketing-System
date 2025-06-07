#!/bin/bash
# 🚀 One-Click Fix for 403 Forbidden Error

echo "🔧 Fixing 403 Forbidden Error..."

# Go to application directory
cd /opt/helpdesk

# Quick fix: Rebuild frontend container
echo "🔄 Rebuilding frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend
docker-compose -f docker-compose.prod.yml rm -f frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 30

# Check status
echo "📊 Container Status:"
docker ps | grep helpdesk

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Backend health:"
curl -I http://localhost:3001/health 2>/dev/null | head -1 || echo "❌ Backend not responding"

echo "Frontend:"
curl -I http://localhost:80/ 2>/dev/null | head -1 || echo "❌ Frontend not responding"

echo ""
echo "🌐 Try accessing: http://34.173.186.108"
echo "📋 If still 403, run: docker logs helpdesk-frontend-prod"
