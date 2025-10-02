#!/bin/bash

# Script test API endpoints và login functionality
echo "🔍 TEST API ENDPOINTS VÀ LOGIN"
echo "=============================="

echo "📊 1. KIỂM TRA API ROUTES:"

# Test API health
echo "Backend health check:"
curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Backend health OK" || echo "❌ Backend health FAILED"

# Test API qua nginx
echo "API qua nginx:"
curl -s http://localhost/api/health 2>/dev/null && echo "✅ API via nginx OK" || echo "❌ API via nginx FAILED"

echo ""
echo "🔑 2. TEST LOGIN ENDPOINT:"

# Test login endpoint
echo "Login endpoint test:"
login_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  http://localhost/api/auth/login 2>/dev/null)

echo "Login API response code: $login_response"

if [ "$login_response" = "200" ] || [ "$login_response" = "400" ] || [ "$login_response" = "401" ]; then
    echo "✅ Login endpoint accessible (code: $login_response)"
else
    echo "❌ Login endpoint not accessible (code: $login_response)"
fi

echo ""
echo "🌐 3. TEST EXTERNAL API CALLS:"

# Test từ external IP
echo "Test API from external (IP):"
external_api_response=$(curl -s -o /dev/null -w "%{http_code}" http://180.93.138.93/api/health 2>/dev/null)
echo "External API response: $external_api_response"

echo "Test API from external (domain):"
domain_api_response=$(curl -s -o /dev/null -w "%{http_code}" http://vuaxemohinh.com/api/health 2>/dev/null)
echo "Domain API response: $domain_api_response"

echo ""
echo "📋 4. KIỂM TRA NGINX API PROXY:"
echo "Nginx API proxy config:"
docker compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api/"

echo ""
echo "🔍 5. TEST FRONTEND API CONFIG:"
echo "Frontend environment variables:"
docker compose -f docker-compose.prod.yml exec frontend env | grep -E "(API_URL|FRONTEND_URL)" || echo "Cannot access frontend env"

echo ""
echo "📊 6. BACKEND LOGS (API related):"
echo "Recent backend logs:"
docker compose -f docker-compose.prod.yml logs --tail=5 backend | grep -E "(API|POST|GET|/api)" || echo "No API logs found"

echo ""
echo "🎯 DIAGNOSIS:"
echo "============"
echo "✅ Check if login API returns 400/401 (expected for invalid credentials)"
echo "✅ Check if API endpoints are accessible via nginx proxy"
echo "✅ Frontend should call API via: http://vuaxemohinh.com/api"
echo "✅ NOT localhost:5000 (internal Docker network)"

echo ""
echo "🛠️  IF LOGIN NOT WORKING:"
echo "1. Restart frontend to apply new env vars:"
echo "   docker compose -f docker-compose.prod.yml restart frontend"
echo "2. Check browser network tab for API calls"
echo "3. Check if API calls are going to http://vuaxemohinh.com/api"
echo "4. NOT http://localhost:5000/api"

echo ""
echo "🌐 CORRECT API FLOW:"
echo "Browser → http://vuaxemohinh.com/api/auth/login → Nginx → Backend:5000"
echo "NOT: Browser → http://localhost:5000/api/auth/login"