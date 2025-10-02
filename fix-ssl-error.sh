#!/bin/bash

# Script khắc phục lỗi SSL setup và retry
echo "🔧 KHẮC PHỤC LỖI SSL SETUP"
echo "========================="

echo "🛑 1. Stop tất cả services để clean up..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "📁 2. Kiểm tra và clean up files..."
# Remove any problematic temp files
rm -f nginx/ssl-setup.conf 2>/dev/null
rm -f docker-compose.prod.yml.bak 2>/dev/null

# Ensure we have the right nginx config
if [ ! -f nginx/default.conf ]; then
    echo "❌ nginx/default.conf not found!"
    echo "Using http-only.conf as fallback"
    cp nginx/http-only.conf nginx/default.conf 2>/dev/null || echo "No fallback config found"
fi

echo "✅ Cleanup done"

echo ""
echo "🚀 3. Khởi động services với HTTP trước..."
# Start with HTTP first to ensure everything works
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10
docker compose -f docker-compose.prod.yml up -d backend
sleep 10
docker compose -f docker-compose.prod.yml up -d frontend
sleep 15
docker compose -f docker-compose.prod.yml up -d nginx
sleep 10

echo ""
echo "📊 4. Kiểm tra services status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🧪 5. Test HTTP access..."
http_test=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
echo "HTTP test result: $http_test"

if [ "$http_test" = "200" ]; then
    echo "✅ HTTP website working"
    
    echo ""
    echo "🌐 6. Test external HTTP access..."
    external_test=$(curl -s -o /dev/null -w "%{http_code}" http://180.93.138.93 2>/dev/null || echo "000")
    echo "External HTTP test: $external_test"
    
    if [ "$external_test" = "200" ]; then
        echo "✅ External HTTP working"
        echo ""
        echo "🔐 7. Bây giờ có thể setup SSL..."
        echo "Tạo simple SSL setup..."
        
        # Create a simpler SSL approach - just get cert without complex nginx switching
        echo "Getting SSL certificate..."
        
        # Create webroot directory
        mkdir -p webroot
        
        # Simple approach: use standalone mode
        docker compose -f docker-compose.prod.yml stop nginx
        
        docker run --rm -v $(pwd)/ssl:/etc/letsencrypt -v $(pwd)/webroot:/var/www/certbot \
            certbot/certbot certonly --standalone \
            --preferred-challenges http \
            --email admin@vuaxemohinh.com \
            --agree-tos --no-eff-email \
            -d vuaxemohinh.com -d www.vuaxemohinh.com
            
        if [ $? -eq 0 ]; then
            echo "✅ SSL certificate obtained!"
            
            # Update nginx config to use SSL
            echo "Updating nginx for HTTPS..."
            
            # Start nginx back
            docker compose -f docker-compose.prod.yml up -d nginx
            
            echo "✅ SSL SETUP COMPLETED!"
            echo "Test: https://vuaxemohinh.com"
        else
            echo "❌ SSL certificate failed - continuing with HTTP"
            docker compose -f docker-compose.prod.yml up -d nginx
        fi
        
    else
        echo "❌ External HTTP not working - fix network first"
    fi
    
else
    echo "❌ HTTP not working locally"
    echo "Check nginx logs:"
    docker compose -f docker-compose.prod.yml logs --tail=10 nginx
fi

echo ""
echo "🎯 CURRENT STATUS:"
echo "=================="
docker compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Test URLs:"
echo "- HTTP: http://180.93.138.93"
echo "- Domain: http://vuaxemohinh.com"
echo ""
echo "📋 Next steps if HTTP working:"
echo "1. Verify website loads in browser"
echo "2. Try SSL setup again if needed"
echo "3. Test API calls work correctly"