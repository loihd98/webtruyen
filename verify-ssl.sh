#!/bin/bash

echo "🔍 SSL VERIFICATION & TROUBLESHOOTING"
echo "===================================="

echo "📊 1. Check container status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 2. Check nginx logs..."
docker compose -f docker-compose.prod.yml logs nginx --tail=10

echo ""
echo "🧪 3. Test HTTP (should redirect to HTTPS)..."
curl -I -s http://vuaxemohinh.com || echo "❌ HTTP failed"

echo ""
echo "🔐 4. Test HTTPS..."
curl -I -s https://vuaxemohinh.com || echo "❌ HTTPS failed"

echo ""
echo "🌐 5. Test website accessibility..."
echo "Testing HTTP redirect..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://vuaxemohinh.com)
echo "HTTP Status: $HTTP_STATUS"

echo "Testing HTTPS..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com)
echo "HTTPS Status: $HTTPS_STATUS"

echo ""
echo "🔧 6. Test API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com/api/health)
echo "API Health Status: $API_STATUS"

echo ""
echo "📁 7. Check SSL certificate files in container..."
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/nginx/ssl/ 2>/dev/null || echo "❌ SSL directory not found in container"

echo ""
echo "🗂️ 8. Check nginx config in container..."
docker compose -f docker-compose.prod.yml exec nginx nginx -t 2>/dev/null || echo "❌ Nginx config test failed"

echo ""
echo "🔄 9. If issues found, try restart nginx..."
echo "Run: docker compose -f docker-compose.prod.yml restart nginx"

echo ""
echo "✅ FINAL RESULTS:"
echo "=================="
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "🎉 HTTPS Website: ✅ Working"
    echo "🌐 Visit: https://vuaxemohinh.com"
else
    echo "⚠️  HTTPS Website: ❌ Issues detected"
fi

if [ "$API_STATUS" = "200" ]; then
    echo "🎉 HTTPS API: ✅ Working" 
    echo "🔗 API: https://vuaxemohinh.com/api"
else
    echo "⚠️  HTTPS API: ❌ Issues detected"
fi