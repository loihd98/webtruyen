#!/bin/bash

# Script khắc phục lỗi external access
echo "🔧 KHẮC PHỤC LỖI EXTERNAL ACCESS"
echo "==============================="

echo "🛑 1. Stop tất cả services..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "🔥 2. Kiểm tra và cấu hình firewall..."
# Mở ports cần thiết
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw --force enable
ufw status

echo ""
echo "🌐 3. Kiểm tra network interface..."
ip addr show | grep inet || ifconfig

echo ""
echo "📁 4. Tạo nginx config đơn giản để test..."
cat > nginx/test.conf << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location /health {
        return 200 "Nginx OK\n";
        add_header Content-Type text/plain;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Created test nginx config"

echo ""
echo "📝 5. Update docker-compose để dùng test config..."
sed -i 's|http-only.conf|test.conf|g' docker-compose.prod.yml

echo ""
echo "🚀 6. Khởi động services theo thứ tự..."

# PostgreSQL
docker compose -f docker-compose.prod.yml up -d postgres
echo "⏳ Chờ PostgreSQL..."
sleep 10

# Backend
docker compose -f docker-compose.prod.yml up -d backend
echo "⏳ Chờ Backend..."
sleep 10

# Frontend
docker compose -f docker-compose.prod.yml up -d frontend
echo "⏳ Chờ Frontend..."
sleep 15

# Nginx
docker compose -f docker-compose.prod.yml up -d nginx
echo "⏳ Chờ Nginx..."
sleep 10

echo ""
echo "📊 7. Kiểm tra services..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 8. Test internal connections..."
sleep 5

# Test nginx health endpoint
curl -I http://localhost/health 2>/dev/null && echo "✅ Nginx health OK" || echo "❌ Nginx health FAILED"
curl -I http://localhost 2>/dev/null && echo "✅ Website OK" || echo "❌ Website FAILED"

echo ""
echo "🌐 9. Test external access preparation..."
echo "Server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Cannot get IP')"

echo ""
echo "📋 10. Port binding check..."
docker compose -f docker-compose.prod.yml port nginx 80 2>/dev/null || echo "❌ Port 80 not bound"

echo ""
echo "🔍 11. Network debugging..."
netstat -tlpn | grep :80 || ss -tlpn | grep :80

echo ""
echo "✅ KHẮC PHỤC HOÀN TẤT!"
echo "====================="
echo "🌐 Test truy cập:"
echo "- http://180.93.138.93/"
echo "- http://180.93.138.93/health"
echo "- http://vuaxemohinh.com/"
echo ""
echo "📊 Nếu vẫn không truy cập được:"
echo "1. Chạy: ./debug-network.sh"
echo "2. Kiểm tra VPS provider firewall/security groups"
echo "3. Kiểm tra cloud provider network settings"