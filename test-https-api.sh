#!/bin/bash

# Script test API calls và verify không còn gọi localhost:5000
echo "🔍 TEST API CALLS VÀ VERIFY HTTPS"
echo "================================="

echo "📊 1. KIỂM TRA SERVICES STATUS:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 2. TEST HTTPS WEBSITE:"
https_response=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com 2>/dev/null || echo "000")
echo "HTTPS website response: $https_response"

if [ "$https_response" = "200" ]; then
    echo "✅ HTTPS website OK"
else
    echo "❌ HTTPS website FAILED"
fi

echo ""
echo "🔑 3. TEST HTTPS API:"
api_response=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com/api/health 2>/dev/null || echo "000")
echo "HTTPS API response: $api_response"

if [ "$api_response" = "200" ] || [ "$api_response" = "404" ]; then
    echo "✅ HTTPS API accessible"
else
    echo "❌ HTTPS API not accessible"
fi

echo ""
echo "🔍 4. TEST LOGIN API:"
login_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  https://vuaxemohinh.com/api/auth/login 2>/dev/null || echo "000")

echo "Login API response: $login_response"

if [ "$login_response" = "400" ] || [ "$login_response" = "401" ]; then
    echo "✅ Login API working (returns expected error for invalid credentials)"
elif [ "$login_response" = "200" ]; then
    echo "✅ Login API working (success - unexpected but OK)"
else
    echo "❌ Login API not accessible (code: $login_response)"
fi

echo ""
echo "📋 5. VERIFY FRONTEND ENV VARIABLES:"
echo "Frontend environment check:"
docker compose -f docker-compose.prod.yml exec frontend env | grep -E "(API_URL|FRONTEND_URL)" 2>/dev/null || echo "Cannot check frontend env directly"

echo ""
echo "🔍 6. CHECK NGINX LOGS FOR API CALLS:"
echo "Recent nginx logs (looking for API calls):"
docker compose -f docker-compose.prod.yml logs --tail=10 nginx | grep -E "(/api/|POST|GET)" || echo "No API calls in recent logs"

echo ""
echo "📝 7. FRONTEND API CONFIG VERIFICATION:"
echo "Checking if frontend uses correct API URL..."

# Check if we can see the API URL in built frontend
frontend_config=$(docker compose -f docker-compose.prod.yml exec frontend find /app -name "*.js" -exec grep -l "localhost:5000" {} \; 2>/dev/null | head -3)
if [ ! -z "$frontend_config" ]; then
    echo "⚠️  Found localhost:5000 references in frontend build"
    echo "Files: $frontend_config"
    echo "Need to rebuild frontend with correct env vars"
else
    echo "✅ No localhost:5000 found in frontend build (or cannot check)"
fi

echo ""
echo "🎯 VERIFICATION SUMMARY:"
echo "======================="
echo "✅ Check HTTPS website works"
echo "✅ Check HTTPS API accessible"  
echo "✅ Check login API responds correctly"
echo "✅ Check frontend env has correct API_URL"

echo ""
echo "🌐 CORRECT API FLOW SHOULD BE:"
echo "Browser → https://vuaxemohinh.com/api/auth/login → Nginx → Backend:5000"
echo ""
echo "🚫 INCORRECT (OLD):"
echo "Browser → http://localhost:5000/api/auth/login"

echo ""
echo "🔧 IF API STILL CALLS LOCALHOST:5000:"
echo "1. Rebuild frontend: docker compose -f docker-compose.prod.yml build frontend"
echo "2. Restart frontend: docker compose -f docker-compose.prod.yml restart frontend"
echo "3. Clear browser cache completely"
echo "4. Check browser Network tab during login"

echo ""
echo "📱 BROWSER TEST INSTRUCTIONS:"
echo "1. Open https://vuaxemohinh.com"
echo "2. Open browser Developer Tools (F12)"
echo "3. Go to Network tab"
echo "4. Try to login"
echo "5. Check API calls - should go to vuaxemohinh.com/api, NOT localhost:5000"