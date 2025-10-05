# 🚀 SIMPLE DEPLOYMENT GUIDE - WebTruyen

**Domain:** vuaxemohinh.com  
**VPS IP:** 180.93.138.93  
**Stack:** Docker + Nginx + PostgreSQL + Node.js + Next.js

---

## 📋 PHẦN 1: CHẠY LOCAL (Development)

### 1. Clone project

```bash
git clone https://github.com/loihd98/webtruyen.git
cd webtruyen
```

### 2. Setup environment

```bash
# Environment file đã có sẵn .env.dev với config:
# - NEXT_PUBLIC_API_URL=http://localhost/api
# - NEXT_PUBLIC_FRONTEND_URL=http://localhost
# - NEXT_PUBLIC_MEDIA_URL=http://localhost
# - All traffic goes through nginx on port 80
```

### 3. Start development với Docker

```bash
# Build và start tất cả services local
docker compose -f docker-compose.dev.yml up -d --build

# Kiểm tra services
docker compose -f docker-compose.dev.yml ps

# Check logs nếu có lỗi
docker compose -f docker-compose.dev.yml logs -f
```

### 4. Truy cập local

- **Website:** http://localhost (nginx reverse proxy)
- **API:** http://localhost/api (nginx → backend:5000)
- **Uploads:** http://localhost/uploads/\* (nginx static files)
- **Direct Backend:** http://localhost:5000 (dev debug only)
- **Direct Frontend:** http://localhost:3000 (dev debug only)
- **Database:** PostgreSQL localhost:5432

### 5. Architecture Development

```
Browser → nginx:80 → {
  /api/* → backend:5000
  /uploads/* → static files
  /* → frontend:3000
}
```

---

## 🌐 PHẦN 2: DEPLOY PRODUCTION (VPS)

### 1. Setup VPS Ubuntu 24.04

```bash
# SSH vào VPS
ssh root@180.93.138.93

# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw

# Mở firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### 3. Clone project trên VPS

```bash
cd /opt
sudo git clone https://github.com/loihd98/webtruyen.git
sudo chown -R $USER:$USER webtruyen
cd webtruyen

# Tạo uploads directory
mkdir -p uploads
```

### 4. Setup production environment

```bash
# Environment file .env.prod đã có config:
# - NEXT_PUBLIC_API_URL=https://khotruyen.vn/api
# - NEXT_PUBLIC_BASE_URL=https://khotruyen.vn
# - NEXT_PUBLIC_MEDIA_URL=https://khotruyen.vn
# - BASE_URL=https://khotruyen.vn
# - CORS_ORIGIN=https://khotruyen.vn

# ⚠️ QUAN TRỌNG: Đổi các secrets trong .env.prod
nano .env.prod
# Thay đổi:
# - JWT_SECRET=your-new-strong-secret-min-32-chars
# - JWT_REFRESH_SECRET=your-new-refresh-secret-min-32-chars
# - NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
# - POSTGRES_PASSWORD=your-strong-db-password
```

### 5. Configure DNS

Trong domain registrar của bạn, set A record:

- **@** → 180.93.138.93
- **www** → 180.93.138.93

Verify DNS:

```bash
dig +short vuaxemohinh.com
# Phải trả về: 180.93.138.93
```

### 6. Start production containers

```bash
# Build và start production
docker compose -f docker-compose.prod.yml up -d --build

# Check containers
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Configure DNS

Trong domain registrar của bạn, set A record:

- **@** → 180.93.138.93
- **www** → 180.93.138.93

Verify DNS:

```bash
dig +short vuaxemohinh.com
# Phải trả về: 180.93.138.93
```

### 5. Start production containers

```bash
# Build và start production
docker compose -f docker-compose.prod.yml up -d --build

# Check containers
docker compose -f docker-compose.prod.yml ps
```

### 7. Test HTTP first (before SSL)

```bash
# Test website HTTP access
curl -I http://khotruyen.vn
curl -I http://180.93.138.93

# Test API
curl http://khotruyen.vn/api/health
curl http://180.93.138.93/api/health

# If works, proceed to SSL setup
```

### 8. Setup SSL với Let's Encrypt

```bash
# Get SSL certificates
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d vuaxemohinh.com -d www.vuaxemohinh.com \
  --email your@email.com --agree-tos --no-eff-email

# Restart nginx để load SSL
docker compose -f docker-compose.prod.yml restart nginx

# Wait for nginx to restart
sleep 5
```

### 9. Run database migrations

```bash
# Chạy Prisma migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Hoặc nếu exec không work:
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

### 10. Verify production website

- **HTTPS:** https://khotruyen.vn
- **HTTP redirect:** http://khotruyen.vn → https://khotruyen.vn
- **API:** https://khotruyen.vn/api/health
- **Uploads:** https://khotruyen.vn/uploads/* (static files)

### 11. Production Architecture

```
Browser → nginx:443/80 → {
  HTTP → HTTPS redirect
  /api/* → backend:5000
  /uploads/* → static files
  /* → frontend:3000
}
```

---

## 🔧 KIỂM TRA & DEBUG

### Check logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Test API

```bash
# Health check
curl -i https://khotruyen.vn/api/health

# From browser console
fetch('https://khotruyen.vn/api/health')
```

### Restart services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 🔄 AUTO SSL RENEWAL

Add cron job cho SSL renewal:

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 3 AM)
0 3 * * * cd /opt/webtruyen && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml restart nginx
```

---

## 📊 COMMON TROUBLESHOOTING

### 1. Nginx 502 Bad Gateway

```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

### 2. SSL Certificate errors

```bash
# Check certificate files
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/vuaxemohinh.com/

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### 3. CORS errors

- Check `.env.prod` has correct `CORS_ORIGIN=https://khotruyen.vn`
- Check `NEXT_PUBLIC_API_URL=https://khotruyen.vn/api`

### 4. Database connection errors

```bash
# Check PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres

# Check DATABASE_URL in .env.prod
```

---

## 🎯 API ENDPOINTS MAPPING

### Development (localhost)

| URL                          | Proxy To             | Description     |
| ---------------------------- | -------------------- | --------------- |
| `http://localhost/`          | `frontend:3000`      | Next.js website |
| `http://localhost/api/*`     | `backend:5000/api/*` | API endpoints   |
| `http://localhost/uploads/*` | `/uploads/*`         | Static files    |

### Production (vuaxemohinh.com)

| URL                              | Proxy To             | Description     |
| -------------------------------- | -------------------- | --------------- |
| `https://khotruyen.vn/`          | `frontend:3000`      | Next.js website |
| `https://khotruyen.vn/api/*`     | `backend:5000/api/*` | API endpoints   |
| `https://khotruyen.vn/uploads/*` | `/uploads/*`         | Static files    |

### Frontend API calls:

```javascript
// ✅ Production
const response = await fetch("https://khotruyen.vn/api/stories");

// ✅ Development (updated - via nginx)
const response = await fetch("http://localhost/api/stories");

// ❌ Old way (direct backend - don't use)
const response = await fetch("http://localhost:5000/api/stories");
```

### Environment Variables Summary:

```bash
# Development (.env.dev)
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_MEDIA_URL=http://localhost

# Production (.env.prod)
NEXT_PUBLIC_API_URL=https://khotruyen.vn/api
NEXT_PUBLIC_MEDIA_URL=https://khotruyen.vn
```

---

**🎉 HOÀN TẤT!** Website đã sẵn sàng tại https://khotruyen.vn
