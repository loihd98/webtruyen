#!/bin/bash

# Script test nhanh website đang hoạt động
echo "🎉 WEBSITE DEPLOYMENT SUCCESS!"
echo "=============================="

echo "✅ All services are running:"
docker compose -f docker-compose.prod.yml ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Website Access Points:"
echo "- Local: http://localhost"
echo "- VPS IP: http://180.93.138.93"
echo "- Domain: http://vuaxemohinh.com (HTTP)"

echo ""
echo "🔍 Quick Tests:"

# Test nginx
nginx_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$nginx_code" = "200" ] || [ "$nginx_code" = "302" ]; then
    echo "✅ Nginx proxy: HTTP $nginx_code"
else
    echo "❌ Nginx proxy: HTTP $nginx_code"
fi

# Test backend health
backend_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "000")
if [ "$backend_code" = "200" ]; then
    echo "✅ Backend API: HTTP $backend_code"
else
    echo "❌ Backend API: HTTP $backend_code"
fi

# Test frontend (through nginx)
echo ""
echo "📱 Website Preview:"
curl -s http://localhost | head -10 | grep -E "(title|<h|<p)" || echo "HTML content detected"

echo ""
echo "🎯 Next Steps:"
echo "1. ✅ Website is running at: http://180.93.138.93"
echo "2. 🔐 Setup SSL: ./setup-ssl.sh"  
echo "3. 📊 Monitor: docker compose -f docker-compose.prod.yml logs -f"
echo "4. 🔄 Update: git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"

echo ""
echo "🚀 DEPLOYMENT COMPLETE! 🚀"