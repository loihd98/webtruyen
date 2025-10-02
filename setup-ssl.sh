#!/bin/bash

# Script setup SSL Certificate và fix API configuration
echo "🔐 SETUP SSL & FIX API CONFIGURATION"
echo "===================================="

echo "📍 1. Kiểm tra DNS pointing..."
dns_check=$(nslookup vuaxemohinh.com | grep "180.93.138.93" || echo "not_found")
if [ "$dns_check" = "not_found" ]; then
    echo "⚠️  Domain chưa trỏ về IP 180.93.138.93"
    echo "Tiếp tục setup..."
fi

echo ""
echo "🔧 2. Tạo nginx config tạm cho SSL verification..."
cat > nginx/ssl-setup.conf << 'EOF'
server {
    listen 80;
    server_name vuaxemohinh.com www.vuaxemohinh.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }
    
    location / {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Created SSL setup config"

echo ""
echo "📝 3. Update docker-compose để dùng SSL setup config..."
# Backup current config
cp docker-compose.prod.yml docker-compose.prod.yml.bak
sed -i 's|default.conf|ssl-setup.conf|g' docker-compose.prod.yml

echo ""
echo "🚀 4. Stop nginx và restart với config tạm..."
docker compose -f docker-compose.prod.yml stop nginx
sleep 2
docker compose -f docker-compose.prod.yml up -d nginx
sleep 10

echo "🔍 Check nginx status..."
docker compose -f docker-compose.prod.yml ps nginx

echo ""
echo "🔐 5. Lấy SSL certificate từ Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@vuaxemohinh.com \
    --agree-tos \
    --no-eff-email \
    -d vuaxemohinh.com \
    -d www.vuaxemohinh.com

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate đã được tạo thành công!"
    
    echo ""
    echo "📝 6. Restore nginx config về HTTPS..."
    sed -i 's|ssl-setup.conf|default.conf|g' docker-compose.prod.yml
    
    echo ""
    echo "🔄 7. Restart services với HTTPS config..."
    docker compose -f docker-compose.prod.yml restart frontend
    sleep 10
    docker compose -f docker-compose.prod.yml restart nginx
    sleep 5
    
    echo ""
    echo "🧪 8. Test HTTPS..."
    sleep 5
    https_test=$(curl -s -o /dev/null -w "%{http_code}" https://vuaxemohinh.com 2>/dev/null || echo "000")
    if [ "$https_test" = "200" ]; then
        echo "✅ HTTPS working! ($https_test)"
    else
        echo "⚠️  HTTPS response: $https_test"
    fi
    
    echo ""
    echo "✅ SSL SETUP HOÀN TẤT!"
    echo "====================="
    echo "🌐 Website: https://vuaxemohinh.com"
    echo "🔑 API: https://vuaxemohinh.com/api"
    echo ""
    echo "🧪 Test API calls:"
    echo "- Browser sẽ gọi: https://vuaxemohinh.com/api"
    echo "- KHÔNG còn localhost:5000"
    
else
    echo "❌ Lỗi khi tạo SSL certificate"
    echo "Restore config..."
    cp docker-compose.prod.yml.bak docker-compose.prod.yml
    docker compose -f docker-compose.prod.yml restart nginx
    
    echo ""
    echo "🔍 DEBUG INFO:"
    echo "Nginx status:"
    docker compose -f docker-compose.prod.yml ps nginx
    echo ""
    echo "Test HTTP access:"
    curl -I http://localhost 2>/dev/null | head -3 || echo "Cannot access nginx"
    echo ""
    echo "🛠️  TROUBLESHOOTING:"
    echo "1. Make sure nginx is running: docker compose -f docker-compose.prod.yml ps"
    echo "2. Test HTTP: curl http://180.93.138.93"
    echo "3. Check nginx logs: docker compose -f docker-compose.prod.yml logs nginx"
    echo "4. Try manual SSL later when HTTP is working"
fi