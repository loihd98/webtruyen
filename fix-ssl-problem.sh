#!/bin/bash

# Script để khắc phục vấn đề SSL certificate không tồn tại
echo "🔒 KHẮC PHỤC VẤN ĐỀ SSL CERTIFICATE"
echo "=================================="

# Kiểm tra nginx có đang lỗi vì SSL không
echo "🔍 Kiểm tra lỗi nginx..."
if docker compose -f docker-compose.prod.yml logs nginx 2>/dev/null | grep -q "cannot load certificate"; then
    echo "❌ Phát hiện lỗi SSL certificate không tồn tại"
    
    # Backup cấu hình SSL hiện tại
    if [ -f "nginx/default.conf.ssl-backup" ]; then
        echo "📁 SSL backup đã tồn tại"
    else
        echo "📁 Backup cấu hình SSL hiện tại"
        cp nginx/default.conf nginx/default.conf.ssl-backup
    fi
    
    # Chuyển sang HTTP-only
    echo "🔄 Chuyển sang cấu hình HTTP-only"
    cp nginx/http-only.conf nginx/default.conf
    
    # Restart nginx
    echo "🔄 Restart nginx với cấu hình HTTP-only"
    docker compose -f docker-compose.prod.yml restart nginx
    
    # Chờ nginx khởi động
    sleep 10
    
    # Test website
    echo "🌐 Test website..."
    if curl -f -s http://localhost > /dev/null 2>&1; then
        echo "✅ Website OK với HTTP (http://180.93.138.93)"
        echo ""
        echo "🎯 HƯỚNG DẪN THIẾT LẬP SSL:"
        echo "========================="
        echo "1. Website đã hoạt động với HTTP"
        echo "2. Chạy lệnh: ./simple-ssl.sh"
        echo "3. Hoặc thực hiện thủ công:"
        echo "   certbot certonly --webroot -w /var/www/certbot -d vuaxemohinh.com -d www.vuaxemohinh.com"
        echo "4. Sau khi có certificate:"
        echo "   cp nginx/default.conf.ssl-backup nginx/default.conf" 
        echo "   docker compose -f docker-compose.prod.yml restart nginx"
    else
        echo "❌ Website vẫn lỗi"
        echo "📋 Nginx logs:"
        docker compose -f docker-compose.prod.yml logs --tail=10 nginx
    fi
else
    echo "✅ Không phát hiện lỗi SSL certificate"
    echo "🔍 Kiểm tra lỗi khác..."
    docker compose -f docker-compose.prod.yml logs --tail=10 nginx
fi

echo ""
echo "📊 Status hiện tại:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Truy cập website:"
echo "- Local: http://localhost"
echo "- IP: http://180.93.138.93"
echo "- Domain (sau SSL): https://vuaxemohinh.com"