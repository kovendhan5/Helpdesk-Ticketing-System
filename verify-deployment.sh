#!/bin/bash
# HELPDESK APPLICATION VERIFICATION SCRIPT
# Tests all endpoints and functionality

echo "=== HELPDESK SYSTEM VERIFICATION ==="
echo "Date: $(date)"
echo "Testing IP: 34.173.186.108"
echo ""

# Test 1: Frontend availability
echo "1. Testing Frontend (Port 80)..."
if curl -f -s http://34.173.186.108 > /dev/null; then
    echo "   ✅ Frontend is accessible"
else
    echo "   ❌ Frontend is not accessible"
fi

# Test 2: Backend health
echo "2. Testing Backend Health (Port 3001)..."
HEALTH_RESPONSE=$(curl -f -s http://34.173.186.108:3001/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Backend health check passed"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "   ❌ Backend health check failed"
fi

# Test 3: Database connection
echo "3. Testing Database Connection..."
DB_RESPONSE=$(curl -f -s http://34.173.186.108:3001/api/auth/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Database connection working"
else
    echo "   ❌ Database connection failed"
fi

# Test 4: Authentication endpoint
echo "4. Testing Authentication Endpoint..."
AUTH_RESPONSE=$(curl -f -s -X POST http://34.173.186.108:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')
if [ $? -eq 0 ]; then
    echo "   ✅ Authentication endpoint working"
else
    echo "   ❌ Authentication endpoint failed"
fi

# Test 5: WebSocket availability
echo "5. Testing WebSocket Support..."
WS_RESPONSE=$(curl -f -s -I http://34.173.186.108:3001/socket.io/)
if echo "$WS_RESPONSE" | grep -q "200\|101"; then
    echo "   ✅ WebSocket endpoint accessible"
else
    echo "   ❌ WebSocket endpoint failed"
fi

# Test 6: Container status
echo "6. Testing Container Status..."
echo "   Docker containers running:"
docker ps --format "   {{.Names}}: {{.Status}}" 2>/dev/null || echo "   ❌ Cannot check containers (docker access required)"

echo ""
echo "=== VERIFICATION COMPLETE ==="
echo ""
echo "ACCESS INFORMATION:"
echo "Frontend URL: http://34.173.186.108"
echo "Backend API: http://34.173.186.108:3001"
echo "Admin Login: admin@example.com / admin123"
echo "User Login: user@example.com / user123"
echo ""
echo "TROUBLESHOOTING:"
echo "- If frontend fails: Check port 80 firewall rules"
echo "- If backend fails: Check port 3001 firewall rules" 
echo "- If database fails: Check PostgreSQL container"
echo "- If auth fails: Check database initialization"
