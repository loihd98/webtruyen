#!/bin/bash

echo "🔧 FIX SSL CERTIFICATE PATH"
echo "============================"

echo "📍 1. Stop nginx container..."
docker compose -f docker-compose.prod.yml stop nginx

echo ""
echo "📁 2. Check SSL certificates exist..."
docker compose -f docker-compose.prod.yml run --rm certbot ls -la /etc/letsencrypt/live/vuaxemohinh.com/ || {
    echo "❌ SSL certificates not found!"
    echo "Please run setup-ssl.sh first"
    exit 1
}

echo ""
echo "📝 3. Update nginx config to use correct certificate paths..."
# Backup current config
cp nginx/default.conf nginx/default.conf.backup

# Update certificate paths in nginx config
sed -i 's|/etc/nginx/ssl/fullchain.pem|/etc/letsencrypt/live/vuaxemohinh.com/fullchain.pem|g' nginx/default.conf
sed -i 's|/etc/nginx/ssl/privkey.pem|/etc/letsencrypt/live/vuaxemohinh.com/privkey.pem|g' nginx/default.conf

echo "✅ Nginx config updated to use correct certificate paths"

echo ""
echo "🚀 4. Start nginx with updated config..."
docker compose -f docker-compose.prod.yml up -d nginx

echo ""
echo "⏳ 5. Wait for nginx to start..."
sleep 5

echo ""
echo "📋 6. Check nginx logs..."
docker compose -f docker-compose.prod.yml logs nginx --tail=10

echo ""
echo "🧪 7. Test HTTPS..."
echo "Testing HTTPS connection..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com 2>/dev/null || echo "000")
echo "HTTPS Status: $HTTPS_STATUS"

echo ""
echo "🔐 8. Test HTTPS with more details..."
curl -I -s --connect-timeout 10 https://vuaxemohinh.com 2>/dev/null || echo "❌ HTTPS connection failed"

echo ""
echo "📁 9. Verify certificate files in container..."
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/vuaxemohinh.com/ 2>/dev/null || echo "❌ Certificate files not accessible"

echo ""
echo "🧪 10. Test API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com/api/health 2>/dev/null || echo "000")
echo "API Status: $API_STATUS"

echo ""
echo "✅ FINAL RESULTS:"
echo "=================="
if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    echo "🎉 SUCCESS! HTTPS Website is working!"
    echo "🌐 Website: https://vuaxemohinh.com"
    
    if [ "$API_STATUS" = "200" ]; then
        echo "🎉 SUCCESS! HTTPS API is working!"
        echo "🔑 API: https://vuaxemohinh.com/api"
    else
        echo "⚠️  API needs checking: Status $API_STATUS"
    fi
    
    echo ""
    echo "🎊 SSL SETUP COMPLETE!"
    echo "Your website is now fully secure with HTTPS!"
else
    echo "⚠️  HTTPS still not working. Status: $HTTPS_STATUS"
    echo "Check nginx logs above for details"
    echo "🔄 Try manual restart: docker compose -f docker-compose.prod.yml restart nginx"
fi