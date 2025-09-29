# 🚀 Hướng Dẫn Deploy Web Truyện Lên VPS

## 📖 Mục Lục

1. [Thông Tin Cơ Bản](#thông-tin-cơ-bản)
2. [Chuẩn Bị VPS](#chuẩn-bị-vps)
3. [Clone Source Code](#clone-source-code)
4. [Cấu Hình Environment](#cấu-hình-environment)
5. [Deploy Development](#deploy-development)
6. [Deploy Production](#deploy-production)
7. [SSL và Domain](#ssl-và-domain)
8. [Monitoring và Maintenance](#monitoring-và-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 📋 Thông Tin Cơ Bản

### Server Information

- **IP:** 180.93.138.93
- **Domain:** yourdomain.com (optional)
- **OS:** Ubuntu 20.04+ LTS
- **RAM:** Minimum 2GB (Recommended 4GB+)
- **Storage:** Minimum 20GB SSD
- **Deploy Methods:** Docker + Docker Compose

### Application Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL 15
- **Reverse Proxy:** Nginx
- **File Storage:** Local file system
- **Process Manager:** Docker Compose

---

## 🔧 Chuẩn Bị VPS

### 1.1 Kết nối SSH

```bash
# Kết nối với user root
ssh root@180.93.138.93

# Hoặc với user thường (nếu có)
ssh username@180.93.138.93
```

### 1.2 Tạo user deploy (khuyến nghị cho security)

```bash
# Tạo user deploy
adduser deploy
usermod -aG sudo deploy

# Tạo SSH key cho user deploy
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copy authorized_keys từ root (nếu cần)
sudo cp /root/.ssh/authorized_keys ~/.ssh/
sudo chown deploy:deploy ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 1.3 Cập nhật hệ thống

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Cài đặt các tools cần thiết
sudo apt install -y curl wget git nano htop unzip software-properties-common
```

### 1.4 Cài đặt Docker & Docker Compose

```bash
# Gỡ bỏ Docker cũ (nếu có)
sudo apt remove docker docker-engine docker.io containerd runc

# Cài đặt Docker từ official repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Thêm user vào docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker deploy

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker

# Kiểm tra cài đặt
docker --version
docker compose version
```

### 1.5 Cài đặt Node.js (cho các scripts utility)

```bash
# Cài đặt Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra
node --version
npm --version
```

### 1.6 Cài đặt Nginx (cho reverse proxy)

```bash
sudo apt install -y nginx

# Khởi động Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Kiểm tra
sudo systemctl status nginx
```

---

## 📦 Clone Source Code

### 2.1 Tạo thư mục project

```bash
# Tạo thư mục với user deploy
sudo mkdir -p /var/www/webtruyen
sudo chown -R deploy:deploy /var/www/webtruyen
cd /var/www/webtruyen
```

### 2.2 Clone repository

```bash
# Clone source code
git clone https://github.com/loihd98/webtruyen.git .

# Hoặc clone branch cụ thể
git clone -b master https://github.com/loihd98/webtruyen.git .

# Kiểm tra structure
ls -la
```

### 2.3 Tạo các thư mục cần thiết

```bash
# Tạo thư mục uploads
mkdir -p uploads/{images,audio}
chmod -R 755 uploads

# Tạo thư mục logs
mkdir -p logs/{nginx,app}
chmod -R 755 logs

# Tạo thư mục SSL (cho HTTPS)
mkdir -p ssl
chmod 700 ssl

# Tạo thư mục backups
mkdir -p backups
chmod 755 backups
```

---

## ⚙️ Cấu Hình Environment

### 3.1 Environment Variables cho Development

```bash
# Tạo .env cho development
cp .env.example .env.dev
nano .env.dev
```

**Nội dung .env.dev:**

```env
# ===========================================
# WEB TRUYEN - DEVELOPMENT ENVIRONMENT
# ===========================================

# Environment
NODE_ENV=development
DEBUG=true

# Database - PostgreSQL
DATABASE_URL="postgresql://webtruyen_dev:dev_password_123@db:5432/webtruyen_dev"
POSTGRES_DB=webtruyen_dev
POSTGRES_USER=webtruyen_dev
POSTGRES_PASSWORD=dev_password_123

# JWT Authentication
JWT_SECRET="dev-jwt-secret-key-make-it-long-enough-for-security"
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET="dev-refresh-token-secret-key"
REFRESH_TOKEN_EXPIRES_IN=30d

# Server Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000
API_BASE_URL=http://localhost:3001

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="dev-nextauth-secret-minimum-32-characters"

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpeg,jpg,png,webp,gif
ALLOWED_AUDIO_TYPES=mp3,wav,m4a,aac
UPLOAD_PATH=/app/uploads

# Email Configuration (Development - Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-dev-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@localhost

# Redis (Optional - for caching)
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Rate Limiting (per minute)
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Development Tools
ENABLE_SWAGGER=true
ENABLE_CORS_DEBUG=true
```

### 3.2 Environment Variables cho Production

```bash
# Tạo .env cho production
cp .env.example .env.prod
nano .env.prod
```

**Nội dung .env.prod:**

```env
# ===========================================
# WEB TRUYEN - PRODUCTION ENVIRONMENT
# ===========================================

# Environment
NODE_ENV=production
DEBUG=false

# Database - PostgreSQL
DATABASE_URL="postgresql://webtruyen_prod:CHANGE_THIS_STRONG_PASSWORD@db:5432/webtruyen_prod"
POSTGRES_DB=webtruyen_prod
POSTGRES_USER=webtruyen_prod
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# JWT Authentication (CHANGE THESE IN PRODUCTION!)
JWT_SECRET="PRODUCTION-JWT-SECRET-MAKE-IT-VERY-LONG-AND-RANDOM-AT-LEAST-64-CHARACTERS"
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET="PRODUCTION-REFRESH-TOKEN-SECRET-DIFFERENT-FROM-JWT"
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000
API_BASE_URL=http://180.93.138.93:3001

# CORS Origins (your actual domains)
CORS_ORIGINS=http://180.93.138.93:3000,https://yourdomain.com,https://www.yourdomain.com

# NextAuth.js
NEXTAUTH_URL=http://180.93.138.93:3000
NEXTAUTH_SECRET="PRODUCTION-NEXTAUTH-SECRET-MINIMUM-64-CHARACTERS-RANDOM"

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_IMAGE_TYPES=jpeg,jpg,png,webp
ALLOWED_AUDIO_TYPES=mp3,wav,m4a
UPLOAD_PATH=/app/uploads

# Email Configuration (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-production-app-password
SMTP_FROM=noreply@yourdomain.com

# Redis (Recommended for production)
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password

# Logging
LOG_LEVEL=warn
LOG_FILE=logs/app.log

# Rate Limiting (per minute)
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_ENABLED=true
ENABLE_SWAGGER=false
ENABLE_CORS_DEBUG=false

# Monitoring
HEALTH_CHECK_INTERVAL=30000
```

---

## 🔧 Deploy Development

### 4.1 Docker Compose cho Development

```bash
# Tạo docker-compose.dev.yml
nano docker-compose.dev.yml
```

**Nội dung docker-compose.dev.yml:**

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: webtruyen-db-dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: webtruyen_dev
      POSTGRES_USER: webtruyen_dev
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./logs/postgres:/var/log/postgres
    networks:
      - webtruyen-network

  # Redis (Optional - for caching)
  redis:
    image: redis:7-alpine
    container_name: webtruyen-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - webtruyen-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: webtruyen-backend-dev
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://webtruyen_dev:dev_password_123@db:5432/webtruyen_dev
      - JWT_SECRET=dev-jwt-secret-key-make-it-long-enough-for-security
      - PORT=3001
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads
      - ./logs/backend:/app/logs
      - /app/node_modules
    depends_on:
      - db
      - redis
    networks:
      - webtruyen-network
    command: npm run dev

  # Frontend Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: webtruyen-frontend-dev
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXTAUTH_URL=http://localhost:3000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - webtruyen-network
    command: npm run dev

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  webtruyen-network:
    driver: bridge
```

### 4.2 Dockerfile cho Development

**Backend Dockerfile.dev:**

```bash
nano backend/Dockerfile.dev
```

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3001

# Development command with nodemon
CMD ["npm", "run", "dev"]
```

**Frontend Dockerfile.dev:**

```bash
nano frontend/Dockerfile.dev
```

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]
```

### 4.3 Chạy Development Environment

```bash
# Build và khởi động development environment
docker compose -f docker-compose.dev.yml up -d --build

# Xem logs
docker compose -f docker-compose.dev.yml logs -f

# Chạy migrations
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Seed database
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

---

## 🚀 Deploy Production

### 5.1 Docker Compose cho Production

```bash
# Tạo docker-compose.prod.yml
nano docker-compose.prod.yml
```

**Nội dung docker-compose.prod.yml:**

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: webtruyen-db-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: webtruyen_prod
      POSTGRES_USER: webtruyen_prod
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups
      - ./logs/postgres:/var/log/postgres
    networks:
      - webtruyen-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U webtruyen_prod -d webtruyen_prod"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: webtruyen-redis-prod
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - webtruyen-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: webtruyen-backend-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3001
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - ./uploads:/app/uploads
      - ./logs/backend:/app/logs
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - webtruyen-network
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        - NEXT_PUBLIC_API_URL=${API_BASE_URL}
        - NEXTAUTH_URL=${NEXTAUTH_URL}
        - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    container_name: webtruyen-frontend-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_BASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - webtruyen-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: webtruyen-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
      - ./uploads:/var/www/uploads:ro
    depends_on:
      frontend:
        condition: service_healthy
      backend:
        condition: service_healthy
    networks:
      - webtruyen-network

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  webtruyen-network:
    driver: bridge
```

### 5.2 Production Dockerfiles

**Backend Production Dockerfile:**

```bash
nano backend/Dockerfile
```

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies stage
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create directories
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/index.js"]
```

**Frontend Production Dockerfile:**

```bash
nano frontend/Dockerfile
```

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies stage
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
RUN npm ci
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### 5.3 Nginx Configuration

```bash
# Tạo Nginx Dockerfile
mkdir -p nginx
nano nginx/Dockerfile
```

```dockerfile
FROM nginx:alpine

# Copy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directory
RUN mkdir -p /var/log/nginx

# Install curl for health checks
RUN apk add --no-cache curl

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration:**

```bash
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream backends
    upstream backend {
        server backend:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend {
        server frontend:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    server {
        listen 80;
        server_name 180.93.138.93 yourdomain.com www.yourdomain.com;

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

        # Authentication routes (stricter rate limiting)
        location ~ ^/api/(auth|admin)/ {
            limit_req zone=login burst=5 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # File uploads
        location /uploads/ {
            alias /var/www/uploads/;
            expires 30d;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options "nosniff";

            # Security: Only allow specific file types
            location ~* \.(jpg|jpeg|png|gif|webp|mp3|wav|m4a|aac)$ {
                expires 30d;
                add_header Cache-Control "public, immutable";
            }

            # Deny access to other file types
            location ~* \.(php|pl|py|sh|cgi)$ {
                deny all;
            }
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

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Deny access to sensitive files
        location ~ /\. {
            deny all;
        }

        location ~ \.(env|git|svn|htaccess|htpasswd)$ {
            deny all;
        }
    }
}
```

### 5.4 Deploy Production

```bash
# Copy environment file cho production
cp .env.prod .env

# Build và khởi động production
docker compose -f docker-compose.prod.yml up -d --build

# Xem trạng thái
docker compose -f docker-compose.prod.yml ps

# Chạy migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database
docker compose -f docker-compose.prod.yml exec backend npm run seed

# Xem logs
docker compose -f docker-compose.prod.yml logs -f
```

npx prisma migrate dev --name init

---

## 🔒 SSL và Domain

### 6.1 Cài đặt SSL với Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tạo SSL certificate (thay yourdomain.com bằng domain thực)
sudo certbot certonly --webroot \
  --webroot-path=/var/www/html \
  --email your-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com

# Copy certificates vào project
sudo cp -r /etc/letsencrypt/live/yourdomain.com /var/www/webtruyen/ssl/
sudo chown -R deploy:deploy /var/www/webtruyen/ssl/
```

### 6.2 Cập nhật Nginx cho HTTPS

```bash
nano nginx/nginx.conf
```

**Thêm HTTPS server block:**

```nginx
# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/nginx/ssl/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # ... (rest of the server configuration same as HTTP)
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring và Maintenance

### 7.1 Health Check Scripts

```bash
# Tạo health check script
nano scripts/health-check.sh
chmod +x scripts/health-check.sh
```

```bash
#!/bin/bash

echo "🏥 Web Truyện Health Check - $(date)"
echo "================================================"

# Check Docker containers
echo "🐳 Container Status:"
docker compose -f docker-compose.prod.yml ps

# Check application endpoints
echo -e "\n🌐 Application Health:"
curl -s -o /dev/null -w "Frontend: %{http_code} - %{time_total}s\n" http://localhost/health
curl -s -o /dev/null -w "Backend: %{http_code} - %{time_total}s\n" http://localhost/api/health

# Check database
echo -e "\n🗄️ Database Status:"
docker compose -f docker-compose.prod.yml exec -T db pg_isready -U webtruyen_prod -d webtruyen_prod

# Check disk usage
echo -e "\n💾 Disk Usage:"
df -h /var/www/webtruyen

# Check memory usage
echo -e "\n🧠 Memory Usage:"
free -h

# Check recent logs for errors
echo -e "\n📋 Recent Errors (last 10):"
docker compose -f docker-compose.prod.yml logs --tail=10 | grep -i error || echo "No recent errors found"
```

### 7.2 Backup Scripts

```bash
# Tạo backup script
nano scripts/backup.sh
chmod +x scripts/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/www/webtruyen/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/var/www/webtruyen"

echo "📦 Starting backup process - $DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "🗄️ Backing up database..."
docker compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U webtruyen_prod \
  -d webtruyen_prod \
  --clean --if-exists \
  > $BACKUP_DIR/database_$DATE.sql

# Uploads backup
echo "📁 Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $PROJECT_DIR uploads/

# Configuration backup
echo "⚙️ Backing up configurations..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  -C $PROJECT_DIR \
  .env nginx/ docker-compose.prod.yml

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "✅ Backup completed! Total size: $BACKUP_SIZE"

# Log backup info
echo "$(date): Backup completed - Size: $BACKUP_SIZE" >> $BACKUP_DIR/backup.log
```

### 7.3 Log Rotation

```bash
# Tạo logrotate config
sudo nano /etc/logrotate.d/webtruyen
```

```
/var/www/webtruyen/logs/*/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 deploy deploy
    postrotate
        docker compose -f /var/www/webtruyen/docker-compose.prod.yml restart nginx
    endscript
}
```

### 7.4 Automated Deployment Script

```bash
# Tạo deployment script
nano scripts/deploy.sh
chmod +x scripts/deploy.sh
```

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# Define variables
PROJECT_DIR="/var/www/webtruyen"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="$PROJECT_DIR/backups"

cd $PROJECT_DIR

# Pre-deployment backup
echo "📦 Creating pre-deployment backup..."
./scripts/backup.sh

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git fetch origin
git pull origin master

# Build and deploy
echo "🔨 Building and deploying services..."

# Stop services gracefully
docker compose -f $COMPOSE_FILE down --timeout 30

# Build with no cache for clean deployment
docker compose -f $COMPOSE_FILE build --no-cache

# Start services
docker compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

# Health check
echo "🏥 Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "⏳ Waiting for application to be ready... ($i/10)"
    sleep 10
done

# Final status check
echo "📊 Final status check:"
docker compose -f $COMPOSE_FILE ps

echo "🎉 Deployment completed successfully!"

# Log deployment
echo "$(date): Deployment completed successfully" >> $PROJECT_DIR/logs/deployment.log
```

### 7.5 Crontab cho Automated Tasks

```bash
# Setup crontab
crontab -e
```

**Thêm các dòng sau:**

```bash
# Daily backup at 2:00 AM
0 2 * * * /var/www/webtruyen/scripts/backup.sh >> /var/www/webtruyen/logs/backup.log 2>&1

# Health check every 15 minutes
*/15 * * * * /var/www/webtruyen/scripts/health-check.sh >> /var/www/webtruyen/logs/health-check.log 2>&1

# SSL certificate renewal check (monthly)
0 0 1 * * /usr/bin/certbot renew --quiet && docker compose -f /var/www/webtruyen/docker-compose.prod.yml restart nginx

# Clean up old logs (weekly)
0 0 * * 0 find /var/www/webtruyen/logs -name "*.log" -mtime +30 -delete
```

---

## 🚨 Troubleshooting

### 8.1 Common Issues

**Container won't start:**

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Check system resources
docker system df
free -h
df -h

# Restart specific service
docker compose -f docker-compose.prod.yml restart [service-name]
```

**Database connection issues:**

```bash
# Check database status
docker compose -f docker-compose.prod.yml exec db pg_isready

# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Reset database (CAUTION: Will lose data!)
docker compose -f docker-compose.prod.yml down
docker volume rm webtruyen_postgres_prod_data
docker compose -f docker-compose.prod.yml up -d
```

**Frontend build failures:**

```bash
# Clear build cache
docker system prune -a

# Rebuild frontend only
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

**SSL/HTTPS issues:**

```bash
# Check SSL certificate validity
openssl x509 -in /var/www/webtruyen/ssl/yourdomain.com/fullchain.pem -text -noout

# Renew SSL certificate
sudo certbot renew --dry-run
sudo certbot renew

# Restart nginx after SSL renewal
docker compose -f docker-compose.prod.yml restart nginx
```

### 8.2 Debugging Commands

```bash
# View all containers
docker ps -a

# View container resources usage
docker stats

# Enter container shell
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec frontend sh

# View container filesystem
docker compose -f docker-compose.prod.yml exec backend ls -la /app

# Check network connectivity
docker compose -f docker-compose.prod.yml exec backend ping db
docker compose -f docker-compose.prod.yml exec frontend ping backend

# View environment variables
docker compose -f docker-compose.prod.yml exec backend env
```

### 8.3 Recovery Procedures

**Restore from backup:**

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore database
docker compose -f docker-compose.prod.yml up -d db
sleep 10
cat backups/database_YYYYMMDD_HHMMSS.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U webtruyen_prod -d webtruyen_prod

# Restore uploads
tar -xzf backups/uploads_YYYYMMDD_HHMMSS.tar.gz

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

**Complete reset (DANGEROUS - Will lose all data!):**

```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v
docker system prune -a --volumes

# Remove all project data (CAUTION!)
rm -rf uploads/* logs/*

# Fresh deployment
./scripts/deploy.sh
```

---

## 📝 Quick Commands Reference

### Development

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker compose -f docker-compose.dev.yml down
```

### Production

```bash
# Deploy production
./scripts/deploy.sh

# View status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop production
docker compose -f docker-compose.prod.yml down
```

### Maintenance

```bash
# Backup
./scripts/backup.sh

# Health check
./scripts/health-check.sh

# Update SSL certificates
sudo certbot renew
```

---

## 🎯 Post-Deployment Checklist

- [ ] All containers are running healthy
- [ ] Database is accessible and seeded
- [ ] Frontend loads correctly at http://180.93.138.93:3000
- [ ] API responds at http://180.93.138.93:3001/api
- [ ] Admin panel accessible at http://180.93.138.93:3000/admin
- [ ] File uploads work correctly
- [ ] HTTPS configured (if using domain)
- [ ] Backup scripts are working
- [ ] Monitoring scripts are in crontab
- [ ] Log rotation is configured
- [ ] Firewall rules are set
- [ ] SSL auto-renewal is configured

## 🔐 Default Credentials

**Admin Account (after seeding):**

- Email: admin@webtruyen.com
- Password: admin123456

**Database:**

- Host: localhost:5432
- Database: webtruyen_prod
- Username: webtruyen_prod
- Password: (as set in .env.prod)

---

**🎉 Congratulations! Your Web Truyện application is now deployed and ready for use!**

Remember to:

1. Change all default passwords
2. Set up proper domain and SSL
3. Configure email settings
4. Set up monitoring alerts
5. Regular backups and security updates
