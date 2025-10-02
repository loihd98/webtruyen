#!/bin/bash

# Script khắc phục lỗi deployment nhanh
echo "🔧 KHẮC PHỤC LỖI DEPLOYMENT"
echo "=========================="

# Stop tất cả services
echo "🛑 Dừng tất cả services..."
docker compose -f docker-compose.prod.yml down

# Xóa images cũ để rebuild
echo "🗑️ Xóa frontend image cũ..."
docker rmi webtruyen-frontend 2>/dev/null || true

# Rebuild frontend với fix
echo "🔨 Rebuild frontend với fix..."
docker compose -f docker-compose.prod.yml build frontend

# Khởi động từng service theo thứ tự
echo "🚀 Khởi động services theo thứ tự..."

# 1. PostgreSQL trước
echo "📊 Khởi động PostgreSQL..."
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10

# 2. Backend
echo "⚙️ Khởi động Backend..."
docker compose -f docker-compose.prod.yml up -d backend
sleep 10

# 3. Frontend
echo "🌐 Khởi động Frontend..."
docker compose -f docker-compose.prod.yml up -d frontend
sleep 15

# 4. Nginx cuối cùng
echo "🔀 Khởi động Nginx..."
docker compose -f docker-compose.prod.yml up -d nginx

# Kiểm tra status
echo "📋 Kiểm tra status..."
docker compose -f docker-compose.prod.yml ps

# Test frontend trực tiếp
echo "🔍 Test Frontend..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend OK trên port 3000"
else
    echo "❌ Frontend vẫn lỗi"
    echo "📋 Frontend logs:"
    docker compose -f docker-compose.prod.yml logs --tail=10 frontend
fi

# Test backend
echo "🔍 Test Backend..."
if curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Backend OK trên port 5000"
else
    echo "❌ Backend lỗi"
    echo "📋 Backend logs:"
    docker compose -f docker-compose.prod.yml logs --tail=10 backend
fi

echo ""
echo "🌐 Test website: http://180.93.138.93"
echo "📊 Monitor: docker compose -f docker-compose.prod.yml logs -f"