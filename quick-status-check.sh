#!/bin/bash

echo "=================================================="
echo "🔍 HELPDESK DEPLOYMENT - QUICK STATUS CHECK"
echo "=================================================="
echo "Time: $(date)"
echo

echo "📊 TESTING SYSTEM ENDPOINTS:"
echo "=================================================="

echo "🌐 Testing Frontend (Port 80):"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" http://34.173.186.108/ || echo "❌ Frontend not responding"

echo
echo "🔧 Testing Backend Health (Port 3001):"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" http://34.173.186.108:3001/health || echo "❌ Backend health check failed"

echo
echo "📡 Testing Backend API (Port 3001):"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" http://34.173.186.108:3001/api/test || echo "❌ Backend API not responding"

echo
echo "=================================================="
echo "🎯 EXPECTED RESULTS:"
echo "✅ Frontend Status: 200 (OK)"
echo "✅ Backend Health: 200 (OK)" 
echo "✅ Backend API: 200 (OK)"
echo "=================================================="

echo
echo "🔗 QUICK ACCESS LINKS:"
echo "Main App: http://34.173.186.108"
echo "Backend: http://34.173.186.108:3001/health"
echo "GitHub: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions"
echo "=================================================="
