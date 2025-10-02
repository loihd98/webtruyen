# Quick Deploy Commands - Thứ tự Scripts

## 🚀 DEPLOYMENT WORKFLOW (Theo thứ tự)

### BƯỚC 1: Setup VPS lần đầu

```bash
curl -fsSL https://raw.githubusercontent.com/loihd98/webtruyen/master/vps-setup.sh -o vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

### BƯỚC 2: Clone project và deploy

```bash
git clone https://github.com/loihd98/webtruyen.git
cd webtruyen
chmod +x deploy.sh
./deploy.sh
```

### BƯỚC 3: Nếu có lỗi build/deployment

```bash
chmod +x fix-build-error.sh
./fix-build-error.sh
```

### BƯỚC 4: Nếu không truy cập được từ external

```bash
chmod +x fix-external-access.sh
./fix-external-access.sh
```

### BƯỚC 5: Nếu SSL setup bị lỗi

```bash
chmod +x fix-ssl-error.sh
./fix-ssl-error.sh
```

### BƯỚC 6: Setup SSL đơn giản (sau khi HTTP OK)

```bash
chmod +x simple-ssl.sh
./simple-ssl.sh
```

---

## 🔧 TROUBLESHOOTING SCRIPTS

### Debug network issues

```bash
chmod +x debug-network.sh && ./debug-network.sh
```

### Check health status

```bash
chmod +x health-check.sh && ./health-check.sh
```

### Test HTTPS API

```bash
chmod +x test-https-api.sh && ./test-https-api.sh
```

### Success verification

```bash
chmod +x success-check.sh && ./success-check.sh
```

---

## 🎯 COMMON WORKFLOWS

### Fresh deployment (mới hoàn toàn)

```bash
# 1. Setup VPS
./vps-setup.sh

# 2. Deploy
./deploy.sh

# 3. Setup SSL
./simple-ssl.sh
```

### Fix deployment issues

```bash
# 1. Fix build errors
./fix-build-error.sh

# 2. Fix external access
./fix-external-access.sh

# 3. Setup SSL
./simple-ssl.sh
```

### SSL setup issues

```bash
# 1. Fix SSL errors
./fix-ssl-error.sh

# 2. Simple SSL setup
./simple-ssl.sh

# 3. Test HTTPS
./test-https-api.sh
```

---

## 📊 MAINTENANCE COMMANDS

### Status check

```bash
docker compose -f docker-compose.prod.yml ps
```

### Update deployment

```bash
git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d
```

### Database backup

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres webtruyen_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Cleanup Docker

```bash
docker system prune -af --volumes
```

---

**VPS:** 180.93.138.93  
**Domain:** https://vuaxemohinh.com  
**Stack:** Docker + Nginx + PostgreSQL + Node.js + Next.js
