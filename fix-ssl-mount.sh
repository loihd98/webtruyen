#!/bin/bash

echo "🔧 FIX SSL CERTIFICATE MOUNTING"
echo "==============================="

echo "📍 1. Stop nginx container..."
docker compose -f docker-compose.prod.yml stop nginx

echo ""
echo "📁 2. Check SSL certificates on host..."
ls -la /etc/letsencrypt/live/vuaxemohinh.com/ || {
    echo "❌ SSL certificates not found!"
    echo "Please run setup-ssl.sh first"
    exit 1
}

echo ""
echo "🔗 3. Create SSL symlinks for nginx container..."
sudo mkdir -p /home/webtruyen/ssl
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/fullchain.pem /home/webtruyen/ssl/
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/privkey.pem /home/webtruyen/ssl/
sudo chmod 644 /home/webtruyen/ssl/fullchain.pem
sudo chmod 600 /home/webtruyen/ssl/privkey.pem

echo "✅ SSL files copied to project directory"

echo ""
echo "📝 4. Update docker-compose.prod.yml to mount SSL certificates..."

# Check if SSL volume mount already exists
if grep -q "/home/webtruyen/ssl:/etc/nginx/ssl" docker-compose.prod.yml; then
    echo "✅ SSL volume mount already configured"
else
    echo "Adding SSL volume mount..."
    # Add SSL volume mount to nginx service
    sed -i '/nginx:/,/volumes:/{
        /volumes:/a\
      - /home/webtruyen/ssl:/etc/nginx/ssl:ro
    }' docker-compose.prod.yml
    echo "✅ SSL volume mount added"
fi

echo ""
echo "🚀 5. Start nginx with SSL certificates..."
docker compose -f docker-compose.prod.yml up -d nginx

echo ""
echo "⏳ 6. Wait for nginx to start..."
sleep 5

echo ""
echo "🧪 7. Test HTTPS..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com 2>/dev/null || echo "000")
echo "HTTPS Status: $HTTPS_STATUS"

echo ""
echo "📋 8. Check nginx logs..."
docker compose -f docker-compose.prod.yml logs nginx --tail=5

echo ""
echo "📁 9. Verify SSL files in container..."
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/nginx/ssl/

echo ""
echo "✅ RESULTS:"
echo "==========="
if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    echo "🎉 SUCCESS! HTTPS is working!"
    echo "🌐 Website: https://vuaxemohinh.com"
    echo "🔑 API: https://vuaxemohinh.com/api"
else
    echo "⚠️  HTTPS still not working. Check nginx logs above."
    echo "🔄 Try: docker compose -f docker-compose.prod.yml restart nginx"
fi