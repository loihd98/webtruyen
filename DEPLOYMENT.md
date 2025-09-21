# VPS Deployment Guide

## 🚀 Single Repository Deployment to VPS

This project is structured as a monorepo with both frontend (Next.js) and backend (Node.js) in a single repository, optimized for VPS deployment.

## 📋 Prerequisites

### On VPS Server:

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt update
sudo apt install git -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y
```

## 🔧 Deployment Steps

### 1. Clone Repository on VPS

```bash
# Clone your repository
git clone https://github.com/yourusername/web_truyen.git
cd web_truyen

# Make sure you're on the main branch
git checkout main
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables for production
nano .env
```

### 3. Production Environment Variables

Create/update `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:your_strong_password@postgres:5432/web_truyen_db"
POSTGRES_DB=web_truyen_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password

# JWT
JWT_SECRET=your_very_strong_jwt_secret_key_here
JWT_REFRESH_SECRET=your_very_strong_refresh_secret_key_here

# Server
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 4. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose exec backend npm run seed
```

### 5. Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/web_truyen`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend (Next.js)
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

    # Static files and uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/web_truyen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 Update Deployment

### Quick Update Script

Create `update.sh`:

```bash
#!/bin/bash
echo "🔄 Updating Web Truyen..."

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build

# Run any new migrations
docker-compose exec backend npx prisma migrate deploy

echo "✅ Update complete!"
```

Make it executable:

```bash
chmod +x update.sh
```

### Update Process:

```bash
# Navigate to project directory
cd /path/to/web_truyen

# Run update script
./update.sh
```

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
# Docker services
docker-compose ps

# Service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# System resources
htop
df -h
```

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres web_truyen_db > backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
EOF

chmod +x backup.sh

# Run daily backup (crontab)
0 2 * * * /path/to/web_truyen/backup.sh
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure ports 3000, 5000, 5432 are available
2. **Permission issues**: Check Docker group membership
3. **Database connection**: Verify DATABASE_URL and postgres service
4. **Environment variables**: Double-check .env file

### Debug Commands:

```bash
# Check Docker logs
docker-compose logs -f backend

# Access backend container
docker-compose exec backend bash

# Check database
docker-compose exec postgres psql -U postgres -d web_truyen_db

# Test API endpoints
curl http://localhost:5000/api/health
```

## 🚀 Production Optimizations

### For Better Performance:

1. **Enable Nginx gzip compression**
2. **Setup Redis for caching** (optional)
3. **Configure log rotation**
4. **Set up monitoring** (Prometheus + Grafana)
5. **Database connection pooling**

### Security Best Practices:

1. **Use strong passwords**
2. **Keep Docker images updated**
3. **Regular security updates**
4. **Firewall configuration**
5. **Regular backups**

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all services are running
4. Check firewall settings
5. Verify domain DNS settings
