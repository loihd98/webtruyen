#!/bin/bash

# Script deployment hoàn chỉnh cho VPS 180.93.138.93
# Domain: vuaxemohinh.com

echo "🚀 BẮT ĐẦU DEPLOYMENT WEBTRUYEN LÊN VPS"
echo "📍 VPS IP: 180.93.138.93"
echo "🌐 Domain: vuaxemohinh.com"
echo "=================================="

# Kiểm tra requirements
echo "🔍 Kiểm tra requirements..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt!"
    echo "Cài đặt Docker:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Kiểm tra Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt!"
    exit 1
fi

echo "✅ Docker và Docker Compose OK"

# Tạo swap nếu cần (tránh OOM khi build)
echo "💾 Kiểm tra swap..."
if ! swapon --show | grep -q /swapfile; then
    echo "📝 Tạo swap file 2GB..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap file đã được tạo"
else
    echo "✅ Swap file đã tồn tại"
fi

# Tạo thư mục cần thiết
echo "📁 Tạo thư mục cần thiết..."
mkdir -p uploads/{images,audio}
mkdir -p logs/{backend,nginx,postgres}
mkdir -p ssl

# Đặt quyền cho thư mục uploads
chmod -R 755 uploads

# Dọn dẹp Docker cũ
echo "🧹 Dọn dẹp Docker cũ..."
docker system prune -af

# Build images
echo "🔨 Build Docker images..."
echo "📦 Building backend..."
if ! docker compose -f docker-compose.prod.yml build backend; then
    echo "❌ Lỗi build backend"
    exit 1
fi

echo "📦 Building frontend..."
if ! docker compose -f docker-compose.prod.yml build frontend; then
    echo "❌ Lỗi build frontend"
    exit 1
fi

echo "✅ Build hoàn tất!"

# Deploy services
echo "🚀 Deploy services..."
docker compose -f docker-compose.prod.yml up -d postgres
echo "⏳ Chờ PostgreSQL khởi động..."
sleep 10

docker compose -f docker-compose.prod.yml up -d backend
echo "⏳ Chờ Backend khởi động..."
sleep 5

docker compose -f docker-compose.prod.yml up -d frontend
echo "⏳ Chờ Frontend khởi động..."
sleep 5

# Setup nginx với SSL (nếu chưa có)
if [ ! -f "ssl/cert.pem" ] && [ ! -d "/etc/letsencrypt/live/vuaxemohinh.com" ]; then
    echo "🔐 Setup SSL certificate..."
    
    # Start nginx để verify domain
    docker compose -f docker-compose.prod.yml up -d nginx
    sleep 5
    
    # Lấy SSL certificate
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@vuaxemohinh.com \
        --agree-tos \
        --no-eff-email \
        -d vuaxemohinh.com \
        -d www.vuaxemohinh.com
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate đã được tạo!"
        docker compose -f docker-compose.prod.yml restart nginx
    else
        echo "⚠️  SSL certificate tạo không thành công, sử dụng HTTP"
        # Sử dụng nginx config đơn giản cho HTTP
        cp nginx/simple.conf nginx/default.conf
    fi
else
    echo "✅ SSL certificate đã tồn tại"
    docker compose -f docker-compose.prod.yml up -d nginx
fi

# Kiểm tra trạng thái
echo "📊 Kiểm tra trạng thái services..."
docker compose -f docker-compose.prod.yml ps

# Kiểm tra logs
echo "📋 Kiểm tra logs..."
echo "Backend logs:"
docker compose -f docker-compose.prod.yml logs --tail=5 backend

echo "Frontend logs:"
docker compose -f docker-compose.prod.yml logs --tail=5 frontend

# Test connectivity
echo "🔍 Test kết nối..."
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend responding on port 3000"
else
    echo "⚠️  Frontend không response trên port 3000"
fi

if curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Backend responding on port 5000"
else
    echo "⚠️  Backend không response trên port 5000"
fi

echo ""
echo "🎉 DEPLOYMENT HOÀN TẤT!"
echo "=================================="
echo "🌐 Website: https://vuaxemohinh.com"
echo "📍 IP: 180.93.138.93"
echo ""
echo "📋 Các lệnh hữu ích:"
echo "- Xem logs: docker compose -f docker-compose.prod.yml logs -f [service]"
echo "- Restart: docker compose -f docker-compose.prod.yml restart [service]"
echo "- Status: docker compose -f docker-compose.prod.yml ps"
echo "- Stop all: docker compose -f docker-compose.prod.yml down"
echo ""
echo "🔧 Nếu có lỗi SSL, chạy lại: ./setup-ssl.sh"