# 🚀 Hướng Dẫn Deploy Web Truyện Lên VPS (Docker)

## 📋 Thông Tin VPS
- **IP:** 180.93.138.93
- **Domain (nếu có):** yourdomain.com
- **OS:** Ubuntu/CentOS (giả định)
- **Deploy Method:** Docker + Docker Compose

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1 Kết nối SSH
```bash
ssh root@180.93.138.93
# hoặc
ssh username@180.93.138.93
```

### 1.2 Cập nhật hệ thống
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.3 Cài đặt Docker & Docker Compose
```bash
# Ubuntu/Debian - Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Khởi động Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Kiểm tra cài đặt
docker --version
docker-compose --version
```

### 1.4 Cài đặt Git và Nginx
```bash
# Ubuntu/Debian
sudo apt install -y git nginx

# CentOS/RHEL
sudo yum install -y git nginx
```

### 1.5 Tạo thư mục project
```bash
sudo mkdir -p /var/www/web-truyen
sudo chown $USER:$USER /var/www/web-truyen
cd /var/www/web-truyen
```

## 📦 Bước 2: Upload Source Code

### 2.1 Clone repository (phương pháp Git - khuyến nghị)
```bash
cd /var/www/web-truyen
git clone https://github.com/loihd98/webtruyen.git .

# Hoặc clone từ branch cụ thể
git clone -b main https://github.com/loihd98/webtruyen.git .
```

### 2.2 Tạo file environment variables
```bash
# Tạo .env file cho production
cp .env.example .env
nano .env
```

**Nội dung file .env:**
```env
# Database
DATABASE_URL="postgresql://web_truyen_user:your-strong-password@db:5432/web_truyen_prod"

# JWT
JWT_SECRET="your-jwt-secret-key-here-make-it-very-long-and-secure"

# Server
NODE_ENV=production
PORT=3001

# Frontend URL (cho CORS)
FRONTEND_URL=http://180.93.138.93:3000

# Email (nếu có)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Upload paths
UPLOAD_PATH=/app/uploads
```

## � Bước 3: Cấu Hình Docker Production

### 3.1 Cập nhật docker-compose.prod.yml
```bash
nano docker-compose.prod.yml
```

**Nội dung file docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    container_name: web-truyen-db
    environment:
      POSTGRES_DB: web_truyen_prod
      POSTGRES_USER: web_truyen_user
      POSTGRES_PASSWORD: your-strong-password-here
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - web-truyen-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: web-truyen-backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://web_truyen_user:your-strong-password-here@db:5432/web_truyen_prod
      - JWT_SECRET=your-jwt-secret-key-here
      - PORT=3001
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - web-truyen-network

  # Frontend Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://180.93.138.93:3001
    container_name: web-truyen-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://180.93.138.93:3001
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - web-truyen-network

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: web-truyen-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - web-truyen-network

volumes:
  postgres_data:

networks:
  web-truyen-network:
    driver: bridge
```

## 🚀 Bước 4: Deploy Application

### 4.1 Build và khởi động containers
```bash
# Build và khởi động tất cả services
docker-compose -f docker-compose.prod.yml up -d --build

# Kiểm tra trạng thái containers
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4.2 Chạy database migrations
```bash
# Chạy Prisma migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# Seed database (tùy chọn)
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```
## 🌐 Bước 5: Cấu Hình Nginx

### 5.1 Tạo Nginx Dockerfile
```bash
mkdir -p nginx
nano nginx/Dockerfile
```

**Nội dung nginx/Dockerfile:**
```dockerfile
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directory
RUN mkdir -p /var/log/nginx

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 Cấu hình Nginx reverse proxy
```bash
nano nginx/nginx.conf
```

**Nội dung nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=20r/s;
    
    # Backend upstream
    upstream backend {
        server backend:3001;
    }
    
    # Frontend upstream  
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name 180.93.138.93;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Static file uploads
        location /uploads/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static files
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # Frontend routes
        location / {
            limit_req zone=web burst=50 nodelay;
            
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## � Bước 6: SSL/HTTPS (Tùy chọn)

### 6.1 Cài đặt Certbot trong container riêng
```bash
# Tạo docker-compose.ssl.yml
nano docker-compose.ssl.yml
```

```yaml
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./ssl-challenge:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com
```

### 6.2 Cập nhật Nginx cho HTTPS
```nginx
# Thêm vào nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Redirect HTTP to HTTPS
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔧 Bước 7: Scripts Quản Lý

### 7.1 Tạo script deploy
```bash
nano deploy.sh
chmod +x deploy.sh
```

**Nội dung deploy.sh:**
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Stop containers
echo "📦 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Rebuild and start
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "🗄️ Running database migrations..."
sleep 10
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Check health
echo "🏥 Checking application health..."
sleep 15
curl -f http://localhost:3000/health || echo "❌ Health check failed"

echo "✅ Deployment completed!"
```

### 7.2 Tạo script backup database
```bash
nano backup.sh
chmod +x backup.sh
```

**Nội dung backup.sh:**
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/webtruyen"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U web_truyen_user web_truyen_prod > $BACKUP_DIR/db_backup_$DATE.sql

echo "📁 Creating uploads backup..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

## 📊 Bước 8: Monitoring và Logs

### 8.1 Theo dõi logs
```bash
# Xem logs tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Xem logs service cụ thể
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# Xem logs với số dòng giới hạn
docker-compose -f docker-compose.prod.yml logs --tail=100 -f
```

### 8.2 Kiểm tra trạng thái containers
```bash
# Kiểm tra containers đang chạy
docker ps

# Kiểm tra resource usage
docker stats

# Kiểm tra disk usage
docker system df
```

### 8.3 Tạo script monitoring
```bash
nano monitor.sh
chmod +x monitor.sh
```

**Nội dung monitor.sh:**
```bash
#!/bin/bash

echo "🔍 Web Truyen Monitoring Report"
echo "================================"
echo "📅 Date: $(date)"
echo ""

echo "🐳 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💾 Disk Usage:"
df -h /var/www/webtruyen

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "🌐 Application Health:"
curl -s http://localhost:3000/health && echo " - Frontend: ✅ OK" || echo " - Frontend: ❌ FAIL"
curl -s http://localhost:3001/api/health && echo " - Backend: ✅ OK" || echo " - Backend: ❌ FAIL"

echo ""
echo "📊 Database Status:"
docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U web_truyen_user -d web_truyen_prod
```

## 🚨 Bước 9: Troubleshooting

### 9.1 Các lệnh debug phổ biến
```bash
# Kiểm tra logs chi tiết
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Vào container để debug
docker-compose -f docker-compose.prod.yml exec backend bash
docker-compose -f docker-compose.prod.yml exec frontend sh

# Kiểm tra network
docker network ls
docker network inspect web-truyen_web-truyen-network

# Restart services
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

### 9.2 Các vấn đề thường gặp

**Database connection failed:**
```bash
# Kiểm tra database container
docker-compose -f docker-compose.prod.yml logs db

# Kiểm tra database connection
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push --preview-feature
```

**Frontend không build được:**
```bash
# Clear cache và rebuild
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml up -d --build
```

**Port đã được sử dụng:**
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Kill process sử dụng port
sudo kill -9 $(sudo lsof -t -i:3000)
```

## 🔄 Bước 10: Cập Nhật Application

### 10.1 Script cập nhật tự động
```bash
nano update.sh
chmod +x update.sh
```

**Nội dung update.sh:**
```bash
#!/bin/bash

echo "🔄 Updating Web Truyen..."

# Backup trước khi update
./backup.sh

# Pull latest code
git pull origin main

# Rebuild và restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations nếu có
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo "✅ Update completed!"
```

### 10.2 Crontab tự động backup
```bash
# Mở crontab
crontab -e

# Thêm các dòng sau để backup hàng ngày lúc 2:00 AM
0 2 * * * /var/www/webtruyen/backup.sh

# Chạy monitoring mỗi 30 phút
*/30 * * * * /var/www/webtruyen/monitor.sh >> /var/log/webtruyen-monitor.log
```

## 🎯 Bước 11: Hoàn Thành

### 11.1 Kiểm tra final
```bash
# Kiểm tra tất cả containers đang chạy
docker-compose -f docker-compose.prod.yml ps

# Test application
curl http://180.93.138.93:3000
curl http://180.93.138.93:3001/api/health
```

### 11.2 URLs để truy cập
- **Frontend:** http://180.93.138.93:3000
- **Backend API:** http://180.93.138.93:3001/api
- **Admin Panel:** http://180.93.138.93:3000/admin

### 11.3 Thông tin đăng nhập admin (sau khi seed)
- **Email:** admin@webtruyen.com
- **Password:** admin123456

---

## 📝 Ghi Chú Quan Trọng

1. **Security:** Thay đổi tất cả mật khẩu mặc định
2. **SSL:** Cài đặt SSL certificate cho production
3. **Backup:** Thiết lập backup tự động
4. **Monitoring:** Theo dõi logs và performance thường xuyên
5. **Updates:** Cập nhật dependencies và security patches

**Chúc mừng! 🎉 Web Truyện của bạn đã được deploy thành công với Docker!**

# NextAuth
NEXTAUTH_URL=http://180.93.138.93:3000
NEXTAUTH_SECRET=your-production-nextauth-secret-minimum-64-characters

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# File upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/webtruyen/uploads

# Environment
NODE_ENV=production
PORT=5000
```

## 🏗️ Bước 5: Build & Deploy Backend

### 5.1 Cài đặt dependencies
```bash
cd /var/www/webtruyen/backend
npm install --production
```

### 5.2 Chạy Prisma migrations
```bash
npx prisma generate
npx prisma db push
# hoặc nếu có migrations
npx prisma migrate deploy
```

### 5.3 Seed database (tùy chọn)
```bash
node src/scripts/seed.js
```

### 5.4 Tạo thư mục uploads
```bash
mkdir -p /var/www/webtruyen/uploads/{images,audio}
chmod 755 /var/www/webtruyen/uploads
```

### 5.5 Khởi động backend với PM2
```bash
cd /var/www/webtruyen/backend

# Tạo ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'webtruyen-backend',
    script: 'src/index.js',
    cwd: '/var/www/webtruyen/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Khởi động
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🎨 Bước 6: Build & Deploy Frontend

### 6.1 Cài đặt dependencies
```bash
cd /var/www/webtruyen/frontend
npm install
```

### 6.2 Build production
```bash
npm run build
```

### 6.3 Khởi động frontend với PM2
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'webtruyen-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/webtruyen/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

pm2 start ecosystem.config.js
```

## 🌐 Bước 7: Cấu Hình Nginx

### 7.1 Tạo Nginx config
```bash
sudo nano /etc/nginx/sites-available/webtruyen
```

### 7.2 Nội dung config
```nginx
server {
    listen 80;
    server_name 180.93.138.93 yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/webtruyen/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

### 7.3 Kích hoạt site
```bash
sudo ln -s /etc/nginx/sites-available/webtruyen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Bước 8: Cài Đặt SSL (Tùy chọn - nếu có domain)

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 🔥 Bước 9: Cấu Hình Firewall

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 Bước 10: Monitoring & Logs

### 10.1 PM2 monitoring
```bash
# Xem status
pm2 status

# Xem logs
pm2 logs

# Restart apps
pm2 restart all

# Monitor
pm2 monit
```

### 10.2 Nginx logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 10.3 System monitoring
```bash
# Cài đặt htop
sudo apt install htop

# Monitor resources
htop
```

## 🚀 Bước 11: Automated Deployment Script

### 11.1 Tạo script deploy
```bash
nano /var/www/webtruyen/deploy.sh
```

### 11.2 Nội dung script
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/webtruyen

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Backend deployment
echo "🔧 Deploying backend..."
cd backend
npm install --production
npx prisma generate
npx prisma db push
pm2 restart webtruyen-backend

# Frontend deployment
echo "🎨 Deploying frontend..."
cd ../frontend
npm install
npm run build
pm2 restart webtruyen-frontend

echo "✅ Deployment completed!"

# Show status
pm2 status
```

### 11.3 Làm cho script executable
```bash
chmod +x /var/www/webtruyen/deploy.sh
```

## 🔧 Troubleshooting

### Kiểm tra services
```bash
# PM2 processes
pm2 status

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# Check ports
sudo netstat -tulpn | grep -E ':(3000|5000|80|5432)'
```

### Restart toàn bộ
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### Logs debugging
```bash
# PM2 logs
pm2 logs --lines 50

# Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

## 🌍 Truy Cập Ứng Dụng

Sau khi hoàn thành tất cả các bước:

- **Frontend:** http://180.93.138.93 (hoặc yourdomain.com)
- **API:** http://180.93.138.93/api
- **Admin:** http://180.93.138.93/admin

## 👤 Thông Tin Đăng Nhập

Từ script seed:
- **Admin:** admin@webtruyen.com / admin123456
- **User:** user@example.com / user123456

## 🔄 Cập Nhật Code

Để cập nhật code sau này:
```bash
cd /var/www/webtruyen
./deploy.sh
```

---

**📌 Lưu ý:** Thay thế `yourdomain.com` bằng domain thực tế của bạn và cập nhật các passwords/secrets cho phù hợp với production environment.