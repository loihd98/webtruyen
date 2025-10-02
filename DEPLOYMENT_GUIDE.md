# 🚀 HƯỚNG DẪN DEPLOY WEBTRUYEN LÊN VPS

**VPS Info:**

- **IP:** 180.93.138.93
- **Domain:** https://vuaxemohinh.com
- **Stack:** Docker + Nginx + PostgreSQL + Node.js + Next.js

---

## 📋 REQUIREMENTS

### VPS Requirements

- **RAM:** Tối thiểu 2GB (khuyến nghị 4GB)
- **Storage:** Tối thiểu 20GB
- **OS:** Ubuntu 20.04+ hoặc Debian 11+
- **Network:** Port 80, 443 mở

### Domain Requirements

- Domain `vuaxemohinh.com` đã trỏ A record về IP `180.93.138.93`
- Subdomain `www.vuaxemohinh.com` (optional)

---

## 🛠️ BƯỚC 1: SETUP VPS BAN ĐẦU

### 1.1 Kết nối VPS

```bash
ssh root@180.93.138.93
```

### 1.2 Chạy script setup tự động

```bash
curl -fsSL https://raw.githubusercontent.com/loihd98/webtruyen/master/vps-setup.sh -o vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

**Script này sẽ:**

- ✅ Cài đặt Docker & Docker Compose
- ✅ Cấu hình firewall (port 80, 443, SSH)
- ✅ Tạo swap file 2GB
- ✅ Tối ưu kernel parameters
- ✅ Setup user `deploy`

### 1.3 Kiểm tra cài đặt

```bash
docker --version
docker-compose --version
free -h  # Kiểm tra RAM và swap
```

---

## 🔧 BƯỚC 2: CLONE PROJECT VÀ SETUP

### 2.1 Clone project

```bash
git clone https://github.com/loihd98/webtruyen.git
cd webtruyen
```

### 2.2 Cấu hình environment variables

Chỉnh sửa file `docker-compose.prod.yml`:

```yaml
# Thay đổi passwords mạnh
POSTGRES_PASSWORD: your_strong_password_here
JWT_SECRET: your_jwt_secret_here_minimum_32_characters
JWT_REFRESH_SECRET: your_jwt_refresh_secret_here_minimum_32_characters
```

### 2.3 Tạo thư mục cần thiết

```bash
mkdir -p uploads/{images,audio}
mkdir -p logs/{backend,nginx,postgres}
mkdir -p ssl
chmod -R 755 uploads
```

---

## 🚀 BƯỚC 3: DEPLOYMENT

### 3.1 Deploy tự động (Khuyến nghị)

```bash
chmod +x deploy.sh
./deploy.sh
```

**Script sẽ tự động:**

- 🔨 Build Docker images
- 🐘 Setup PostgreSQL
- 🚀 Deploy backend & frontend
- 🔐 Setup SSL certificate (Let's Encrypt)
- 🌐 Configure Nginx

### 3.2 Deploy manual (nếu cần)

#### Build images

```bash
# Dọn dẹp Docker cũ
docker system prune -af

# Build từng service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build frontend
```

#### Deploy services

```bash
# Deploy PostgreSQL trước
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Deploy backend
docker compose -f docker-compose.prod.yml up -d backend
sleep 5

# Deploy frontend
docker compose -f docker-compose.prod.yml up -d frontend
sleep 5

# Deploy nginx
docker compose -f docker-compose.prod.yml up -d nginx
```

---

## 🔐 BƯỚC 4: SETUP SSL CERTIFICATE

### 4.1 SSL tự động (đã tích hợp trong deploy.sh)

SSL sẽ được setup tự động khi chạy `./deploy.sh`

### 4.2 SSL manual (nếu cần)

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

---

## ✅ BƯỚC 5: VERIFICATION

### 5.1 Kiểm tra services

```bash
docker compose -f docker-compose.prod.yml ps
```

Tất cả services phải có status `Up`:

- ✅ postgres
- ✅ backend
- ✅ frontend
- ✅ nginx

### 5.2 Kiểm tra logs

```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker compose -f docker-compose.prod.yml logs frontend

# Nginx logs
docker compose -f docker-compose.prod.yml logs nginx
```

### 5.3 Test website

- ✅ HTTP redirect: http://vuaxemohinh.com → https://vuaxemohinh.com
- ✅ HTTPS: https://vuaxemohinh.com
- ✅ API: https://vuaxemohinh.com/api
- ✅ Uploads: https://vuaxemohinh.com/uploads

---

## 🔧 QUẢN LÝ VÀ MAINTENANCE

### Restart services

```bash
docker compose -f docker-compose.prod.yml restart [service_name]
```

### Stop all services

```bash
docker compose -f docker-compose.prod.yml down
```

### Update code

```bash
git pull origin master
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Backup database

```bash
docker compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U postgres webtruyen_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### View real-time logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Monitor resources

```bash
docker stats
htop
df -h  # Disk usage
```

---

## 🚨 TROUBLESHOOTING

### ❌ Problem: Frontend build bị "Killed"

**Solution:**

```bash
# Kiểm tra swap
free -h

# Tăng swap nếu cần
sudo fallocate -l 4G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### ❌ Problem: SSL certificate failed

**Solutions:**

1. Kiểm tra DNS: `nslookup vuaxemohinh.com`
2. Kiểm tra firewall: `ufw status`
3. Chạy lại: `./setup-ssl.sh`

### ❌ Problem: Database connection failed

**Solutions:**

1. Kiểm tra PostgreSQL: `docker compose -f docker-compose.prod.yml logs postgres`
2. Kiểm tra DATABASE_URL trong docker-compose.prod.yml
3. Restart PostgreSQL: `docker compose -f docker-compose.prod.yml restart postgres`

### ❌ Problem: Nginx 502 Bad Gateway

**Solutions:**

1. Kiểm tra backend/frontend: `docker compose -f docker-compose.prod.yml ps`
2. Kiểm tra logs: `docker compose -f docker-compose.prod.yml logs nginx`
3. Restart services: `docker compose -f docker-compose.prod.yml restart`

### ❌ Problem: Out of disk space

**Solutions:**

```bash
# Dọn dẹp Docker
docker system prune -af --volumes

# Dọn dẹp logs
sudo journalctl --vacuum-time=7d

# Kiểm tra disk usage
df -h
du -sh /var/lib/docker
```

---

## 📊 MONITORING

### Health checks

```bash
# Website health
curl -I https://vuaxemohinh.com

# API health
curl -I https://vuaxemohinh.com/api

# Services status
docker compose -f docker-compose.prod.yml ps
```

### Performance monitoring

```bash
# Resource usage
docker stats --no-stream

# System resources
htop
iostat 1

# Network connections
netstat -tulpn | grep -E ':(80|443|3000|5000|5432)'
```

---

## 🔒 SECURITY RECOMMENDATIONS

### 1. SSH Security

```bash
# Thay đổi SSH port
sudo nano /etc/ssh/sshd_config
# Port 2222

# Disable root login
# PermitRootLogin no

sudo systemctl restart ssh
```

### 2. Setup Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Auto SSL renewal

```bash
# Add to crontab
crontab -e

# Add line:
0 3 * * * docker compose -f /path/to/webtruyen/docker-compose.prod.yml run --rm certbot renew && docker compose -f /path/to/webtruyen/docker-compose.prod.yml restart nginx
```

---

## 📞 SUPPORT

### Log locations

- **Backend logs:** `docker compose -f docker-compose.prod.yml logs backend`
- **Frontend logs:** `docker compose -f docker-compose.prod.yml logs frontend`
- **Nginx logs:** `logs/nginx/`
- **System logs:** `/var/log/syslog`

### Useful commands

```bash
# Service status
systemctl status docker

# Docker info
docker info
docker system df

# Network test
ping vuaxemohinh.com
telnet vuaxemohinh.com 80
telnet vuaxemohinh.com 443
```

---

## 🎉 DEPLOYMENT CHECKLIST

- [ ] VPS setup completed (`vps-setup.sh`)
- [ ] Project cloned and configured
- [ ] Environment variables updated
- [ ] Docker images built successfully
- [ ] All services running (`docker compose ps`)
- [ ] SSL certificate installed
- [ ] Website accessible via HTTPS
- [ ] API endpoints working
- [ ] File uploads working
- [ ] Database connected
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

**🌐 Final Result:** https://vuaxemohinh.com

**📧 Contact:** admin@vuaxemohinh.com
