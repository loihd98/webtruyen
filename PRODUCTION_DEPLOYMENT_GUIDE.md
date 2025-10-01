# Web Truyện - Production Deployment Guide

## Server Information
- **Server IP**: 180.93.138.93
- **Domain**: vuaxemohinh.com
- **OS**: Ubuntu/CentOS 8
- **Architecture**: Docker Compose + Nginx + SSL

## Prerequisites
- Domain `vuaxemohinh.com` pointing to IP `180.93.138.93`
- SSH access to the server
- Root or sudo privileges

## Step 1: Initial Server Setup

### 1.1 Connect to Server
```bash
ssh root@180.93.138.93
# or if using non-root user:
ssh username@180.93.138.93
```

### 1.2 Update System
```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
# or for newer versions:
sudo dnf update -y
```

### 1.3 Install Required Packages
```bash
# For Ubuntu/Debian
sudo apt install -y curl wget git vim nano htop ufw

# For CentOS/RHEL
sudo yum install -y curl wget git vim nano htop firewalld
# or:
sudo dnf install -y curl wget git vim nano htop firewalld
```

## Step 2: Install Docker and Docker Compose

### 2.1 Install Docker
```bash
# For Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# For CentOS/RHEL
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2.2 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2.3 Start Docker Service
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

## Step 3: Firewall Configuration

```bash
# For Ubuntu (UFW)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# For CentOS (firewalld)
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Step 4: Clone and Setup Project

### 4.1 Clone Repository
```bash
cd /opt
sudo git clone https://github.com/loihd98/webtruyen.git
sudo chown -R $USER:$USER /opt/webtruyen
cd /opt/webtruyen
```

### 4.2 Create Production Environment File
```bash
cp .env.prod.example .env.prod
nano .env.prod
```

**Configure the following variables:**
```env
# Database
DATABASE_URL="postgresql://webtruyen_user:secure_password_here@postgres:5432/webtruyen_prod"
POSTGRES_DB=webtruyen_prod
POSTGRES_USER=webtruyen_user
POSTGRES_PASSWORD=secure_password_here

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://vuaxemohinh.com
BACKEND_URL=https://vuaxemohinh.com

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here

# File Upload
UPLOAD_DIR=/uploads

# Domain
DOMAIN=vuaxemohinh.com
```

### 4.3 Create Required Directories
```bash
mkdir -p uploads/images uploads/audio
mkdir -p ssl
mkdir -p logs/nginx
sudo chown -R $USER:$USER uploads ssl logs
```

## Step 5: SSL Certificate Setup

### 5.1 Install Certbot
```bash
# For Ubuntu/Debian
sudo apt install -y certbot

# For CentOS/RHEL
sudo yum install -y certbot
# or:
sudo dnf install -y certbot
```

### 5.2 Generate SSL Certificate
```bash
# Stop any services using ports 80/443
sudo systemctl stop nginx 2>/dev/null || true

# Generate certificate
sudo certbot certonly --standalone -d vuaxemohinh.com -d www.vuaxemohinh.com

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/
```

### 5.3 Setup Auto-renewal
```bash
# Add cron job for certificate renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/webtruyen/docker-compose.prod.yml restart nginx") | crontab -
```

## Step 6: Deploy Application

### 6.1 Build and Start Services
```bash
cd /opt/webtruyen

# Pull latest changes
git pull origin master

# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### 6.2 Initialize Database
```bash
# Wait for database to be ready
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:generate

# (Optional) Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## Step 7: Monitoring and Logs

### 7.1 View Logs
```bash
# View all service logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 7.2 Check Service Health
```bash
# Check if all services are running
docker-compose -f docker-compose.prod.yml ps

# Check system resources
htop
df -h
```

## Step 8: Backup Setup

### 8.1 Create Backup Directory
```bash
mkdir -p /opt/backups/webtruyen
```

### 8.2 Setup Automated Backups
```bash
# Create backup script
sudo tee /opt/backups/backup-webtruyen.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/webtruyen"
DATE=\$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose -f /opt/webtruyen/docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > \$BACKUP_DIR/db_\$DATE.sql

# Uploads backup
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C /opt/webtruyen uploads/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

sudo chmod +x /opt/backups/backup-webtruyen.sh

# Add to crontab (daily backup at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup-webtruyen.sh >> /var/log/webtruyen-backup.log 2>&1") | crontab -
```

## Step 9: Domain Configuration

### 9.1 DNS Settings
Make sure your domain DNS settings point to your server:
```
A Record: vuaxemohinh.com → 180.93.138.93
A Record: www.vuaxemohinh.com → 180.93.138.93
```

### 9.2 Test Domain Access
```bash
# Test HTTP redirect to HTTPS
curl -I http://vuaxemohinh.com

# Test HTTPS access
curl -I https://vuaxemohinh.com
```

## Step 10: Maintenance Commands

### 10.1 Update Application
```bash
cd /opt/webtruyen
git pull origin master
docker-compose -f docker-compose.prod.yml up --build -d
```

### 10.2 View Application Status
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Check disk space
df -h
```

### 10.3 Emergency Commands
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Remove all containers and start fresh
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up --build -d
```

## Troubleshooting

### Common Issues

1. **Port 80/443 already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   # Kill conflicting processes
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/fullchain.pem -text -noout
   
   # Renew certificate manually
   sudo certbot renew --force-renewal
   ```

3. **Database connection issues**
   ```bash
   # Check database container
   docker-compose -f docker-compose.prod.yml logs postgres
   
   # Connect to database directly
   docker-compose -f docker-compose.prod.yml exec postgres psql -U webtruyen_user -d webtruyen_prod
   ```

4. **Out of disk space**
   ```bash
   # Clean Docker images
   docker system prune -a
   
   # Check large files
   du -sh /* | sort -rh
   ```

## Security Recommendations

1. **Change default passwords** in `.env.prod`
2. **Setup fail2ban** for SSH protection
3. **Regular security updates**
4. **Monitor logs** for suspicious activity
5. **Backup regularly** and test restore procedures

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- GitHub Issues: Create an issue in the repository
- Server logs: `/var/log/nginx/`, `/var/log/webtruyen-backup.log`