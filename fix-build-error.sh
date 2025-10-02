#!/bin/bash

# Script khắc phục lỗi frontend build và deployment
echo "🔧 KHẮC PHỤC LỖI FRONTEND BUILD"
echo "==============================="

# Dừng tất cả services
echo "🛑 Dừng tất cả services..."
docker compose -f docker-compose.prod.yml down

# Xóa toàn bộ images và build lại từ đầu
echo "🗑️ Xóa images cũ..."
docker rmi webtruyen-frontend webtruyen-backend 2>/dev/null || true
docker system prune -f

# Kiểm tra thư mục public có tồn tại không
echo "📁 Kiểm tra cấu trúc frontend..."
if [ ! -d "frontend/public" ]; then
    echo "📁 Tạo thư mục public..."
    mkdir -p frontend/public
    echo "# Public assets" > frontend/public/.gitkeep
fi

# Build lại tất cả images
echo "🔨 Build lại images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Khởi động từng service một cách an toàn
echo "🚀 Khởi động services..."

# PostgreSQL
echo "📊 Khởi động PostgreSQL..."
docker compose -f docker-compose.prod.yml up -d postgres
echo "⏳ Chờ PostgreSQL sẵn sàng..."
sleep 15

# Backend  
echo "⚙️ Khởi động Backend..."
docker compose -f docker-compose.prod.yml up -d backend
echo "⏳ Chờ Backend sẵn sàng..."
sleep 15

# Frontend
echo "🌐 Khởi động Frontend..."
docker compose -f docker-compose.prod.yml up -d frontend
echo "⏳ Chờ Frontend sẵn sàng..."
sleep 20

# Nginx
echo "🔀 Khởi động Nginx..."
docker compose -f docker-compose.prod.yml up -d nginx
echo "⏳ Chờ Nginx sẵn sàng..."
sleep 10

# Kiểm tra status chi tiết
echo ""
echo "📋 KIỂM TRA TRẠNG THÁI CHI TIẾT"
echo "==============================="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 TEST SERVICES"
echo "================"

# Test PostgreSQL
echo "📊 Test PostgreSQL..."
if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL OK"
else
    echo "❌ PostgreSQL lỗi"
    docker compose -f docker-compose.prod.yml logs --tail=5 postgres
fi

# Test Backend
echo "⚙️ Test Backend..."
sleep 5
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend OK (port 5000)"
else
    echo "❌ Backend lỗi"
    echo "📋 Backend logs (5 dòng cuối):"
    docker compose -f docker-compose.prod.yml logs --tail=5 backend
fi

# Test Frontend
echo "🌐 Test Frontend..."
sleep 5

# Test frontend trực tiếp
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$frontend_response" = "200" ] || [ "$frontend_response" = "302" ] || [ "$frontend_response" = "404" ]; then
    echo "✅ Frontend OK (port 3000) - HTTP $frontend_response"
else
    echo "❌ Frontend không phản hồi (code: $frontend_response)"
    echo "📋 Frontend logs (5 dòng cuối):"
    docker compose -f docker-compose.prod.yml logs --tail=5 frontend
    
    # Kiểm tra container có đang chạy không
    if docker compose -f docker-compose.prod.yml ps frontend | grep -q "Up"; then
        echo "⚠️  Container chạy nhưng không phản hồi HTTP, có thể đang khởi động..."
        sleep 10
        frontend_response2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
        if [ "$frontend_response2" = "200" ] || [ "$frontend_response2" = "302" ] || [ "$frontend_response2" = "404" ]; then
            echo "✅ Frontend OK sau khi chờ thêm (HTTP $frontend_response2)"
        else
            echo "❌ Frontend vẫn không phản hồi"
        fi
    fi
fi

# Test website qua nginx
echo "🌐 Test website (nginx)..."
sleep 5
if curl -f -s http://localhost > /dev/null 2>&1; then
    echo "✅ Website OK qua Nginx (port 80)"
else
    echo "❌ Website lỗi qua Nginx"
    echo "📋 Nginx logs (5 dòng cuối):"
    docker compose -f docker-compose.prod.yml logs --tail=5 nginx
fi

echo ""
echo "🎯 KẾT QUẢ"
echo "=========="
echo "🌐 Website local: http://localhost"
echo "🌐 Website IP: http://180.93.138.93"
echo "📊 Monitor: docker compose -f docker-compose.prod.yml logs -f"
echo "🔄 Restart service: docker compose -f docker-compose.prod.yml restart [service]"

# Final check
echo ""
echo "🔍 FINAL STATUS CHECK:"
docker compose -f docker-compose.prod.yml ps