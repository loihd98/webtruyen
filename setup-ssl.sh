#!/bin/bash

# Script cài đặt SSL Certificate cho vuaxemohinh.com
# Chạy script này trên VPS TRƯỚC khi deploy

echo "🔐 Cài đặt SSL Certificate cho vuaxemohinh.com"

# Kiểm tra domain đã trỏ về IP chưa
echo "📍 Kiểm tra DNS pointing..."
if ! nslookup vuaxemohinh.com | grep -q "180.93.138.93"; then
    echo "⚠️  Cảnh báo: Domain chưa trỏ về IP 180.93.138.93"
    echo "Vui lòng cấu hình DNS trước khi tiếp tục"
    read -p "Nhấn Enter để tiếp tục hoặc Ctrl+C để dừng..."
fi

# Tạo thư mục cần thiết
echo "📁 Tạo thư mục..."
mkdir -p ssl
mkdir -p uploads/{images,audio}

# Chạy nginx tạm để verify domain
echo "🚀 Khởi động nginx tạm để verify domain..."
docker compose -f docker-compose.prod.yml up -d nginx

# Chờ nginx khởi động
sleep 5

# Lấy SSL certificate
echo "🔐 Lấy SSL certificate từ Let's Encrypt..."
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
    
    # Copy certificate để nginx có thể đọc
    docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/vuaxemohinh.com/
    
    echo "🔄 Restart nginx với SSL..."
    docker compose -f docker-compose.prod.yml restart nginx
    
    echo "✅ SSL setup hoàn tất!"
    echo "🌐 Truy cập: https://vuaxemohinh.com"
else
    echo "❌ Lỗi khi tạo SSL certificate"
    echo "Vui lòng kiểm tra:"
    echo "1. Domain đã trỏ về IP 180.93.138.93"
    echo "2. Port 80, 443 không bị firewall chặn"
    echo "3. Chạy lại script sau khi khắc phục"
fi