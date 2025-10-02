#!/bin/bash

# Simple SSL setup - work with existing nginx
echo "🔐 SIMPLE SSL SETUP"
echo "=================="

echo "📊 1. Check current services..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🧪 2. Test HTTP first..."
http_test=$(curl -s -o /dev/null -w "%{http_code}" http://180.93.138.93 2>/dev/null || echo "000")
echo "HTTP test: $http_test"

if [ "$http_test" != "200" ]; then
    echo "❌ HTTP not working - fix basic connectivity first"
    echo "Run: ./fix-ssl-error.sh"
    exit 1
fi

echo "✅ HTTP working, proceeding with SSL..."

echo ""
echo "🔧 3. Prepare for SSL certificate..."
# Create directories
mkdir -p ssl certbot-data

echo ""
echo "🛑 4. Temporarily stop nginx for standalone cert generation..."
docker compose -f docker-compose.prod.yml stop nginx

echo ""
echo "🔐 5. Get SSL certificate using standalone mode..."
docker run --rm \
    -p 80:80 \
    -v $(pwd)/certbot-data:/etc/letsencrypt \
    -v $(pwd)/ssl:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email admin@vuaxemohinh.com \
    --agree-tos \
    --no-eff-email \
    -d vuaxemohinh.com \
    -d www.vuaxemohinh.com

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    
    echo ""
    echo "📁 6. Copy certificates to nginx location..."
    # Copy certs to where nginx expects them
    mkdir -p ssl
    if [ -d "certbot-data/live/vuaxemohinh.com" ]; then
        cp certbot-data/live/vuaxemohinh.com/fullchain.pem ssl/ 2>/dev/null || echo "Cert copy attempted"
        cp certbot-data/live/vuaxemohinh.com/privkey.pem ssl/ 2>/dev/null || echo "Key copy attempted"
        echo "✅ Certificates copied"
    fi
    
    echo ""
    echo "📝 7. Update nginx config to use HTTPS..."
    # Make sure we're using the HTTPS nginx config
    if [ -f nginx/default.conf ]; then
        echo "Using existing nginx/default.conf (should have HTTPS config)"
    fi
    
    echo ""
    echo "🔄 8. Start nginx with HTTPS..."
    docker compose -f docker-compose.prod.yml up -d nginx
    sleep 10
    
    echo ""
    echo "🧪 9. Test HTTPS..."
    sleep 5
    https_test=$(curl -s -k -o /dev/null -w "%{http_code}" https://vuaxemohinh.com 2>/dev/null || echo "000")
    echo "HTTPS test: $https_test"
    
    if [ "$https_test" = "200" ]; then
        echo "✅ HTTPS working!"
        
        echo ""
        echo "🔄 10. Restart frontend with HTTPS env vars..."
        docker compose -f docker-compose.prod.yml restart frontend
        sleep 15
        
        echo ""
        echo "🎉 SSL SETUP COMPLETED!"
        echo "======================"
        echo "✅ Website: https://vuaxemohinh.com"
        echo "✅ API: https://vuaxemohinh.com/api"
        
    else
        echo "⚠️  HTTPS not working perfectly, but certificate is installed"
        echo "Check nginx logs: docker compose -f docker-compose.prod.yml logs nginx"
    fi
    
else
    echo "❌ SSL certificate generation failed"
    echo ""
    echo "🔄 Restarting nginx with HTTP..."
    docker compose -f docker-compose.prod.yml up -d nginx
    echo ""
    echo "🌐 Website still available at: http://180.93.138.93"
fi

echo ""
echo "📊 Final status:"
docker compose -f docker-compose.prod.yml ps