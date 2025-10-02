#!/bin/bash

# Script tối ưu hóa deployment trên VPS với RAM thấp
echo "🚀 Bắt đầu deployment tối ưu hóa..."

# Kiểm tra RAM và swap
echo "📊 Kiểm tra tài nguyên hệ thống:"
free -h
echo ""

# Tạo swap file nếu chưa có (giúp tránh OOM khi build)
if ! swapon --show | grep -q /swapfile; then
    echo "💾 Tạo swap file 2GB để tránh OOM..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Thêm vào fstab để tự động mount
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap file đã được tạo và kích hoạt"
else
    echo "✅ Swap file đã tồn tại"
fi

# Dọn dẹp Docker để giải phóng dung lượng
echo "🧹 Dọn dẹp Docker cũ..."
docker system prune -af --volumes
docker builder prune -af

# Build từng service một để tiết kiệm RAM
echo "🔨 Build backend trước..."
docker compose -f docker-compose.prod.yml build backend

echo "🔨 Build frontend với giới hạn memory..."
docker compose -f docker-compose.prod.yml build frontend

echo "🔨 Build các service còn lại..."
docker compose -f docker-compose.prod.yml build

# Deploy
echo "🚀 Deploy ứng dụng..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Deployment hoàn tất!"
echo "📋 Kiểm tra trạng thái:"
docker compose -f docker-compose.prod.yml ps