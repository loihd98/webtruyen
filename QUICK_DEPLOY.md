# Quick Deploy## �️ Fix Build & Deployment Errors

```bash
chmod +x fix-build-error.sh && ./fix-build-error.sh
```

## 🩺 Health Check

```bash
chmod +x health-check.sh && ./health-check.sh
```

## 🔐 SSL Setup Onlyds

## 🚀 One-line deployment (after VPS setup)

```bash
git clone https://github.com/loihd98/webtruyen.git && cd webtruyen && chmod +x deploy.sh && ./deploy.sh
```

## 🛠️ VPS Initial Setup

```bash
curl -fsSL https://raw.githubusercontent.com/loihd98/webtruyen/master/vps-setup.sh -o vps-setup.sh && chmod +x vps-setup.sh && sudo ./vps-setup.sh
```

## � Fix Deployment Errors (Frontend/Nginx issues)

```bash
chmod +x fix-deployment.sh && ./fix-deployment.sh
```

## �🔐 SSL Setup Only

```bash
chmod +x setup-ssl.sh && ./setup-ssl.sh
```

## 📊 Status Check

```bash
docker compose -f docker-compose.prod.yml ps && curl -I https://vuaxemohinh.com
```

## 🔄 Update Deployment

```bash
git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d
```

## 🗄️ Database Backup

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres webtruyen_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🧹 Cleanup Docker

```bash
docker system prune -af --volumes
```

---

**VPS:** 180.93.138.93  
**Domain:** https://vuaxemohinh.com  
**Stack:** Docker + Nginx + PostgreSQL + Node.js + Next.js
