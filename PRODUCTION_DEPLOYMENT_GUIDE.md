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

````bash
# For Ubuntu/Debi### PostgreSQL Container Health Check Failures

**Problem**: Container shows as unhealthy or fails to start with "dependency failed to start: container webtruyen-postgres-1 is unhealthy"

**Solution**:
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify database credentials in .env file
# Ensure POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are set with actual values

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Reset database if needed (WARNING: This will delete all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
````

### Backend Container Health Check Failures

**Problem**: Backend container fails to start with "dependency failed to start: container webtruyen-backend-1 is unhealthy"

**Solution**:

```bash
# Step 1: Check backend container logs
docker-compose -f docker-compose.prod.yml logs backend

# Step 2: Check if backend container is running
docker-compose -f docker-compose.prod.yml ps

# Step 3: Common fixes for backend issues:

# A) PORT MISMATCH ISSUE - Check if backend is running on wrong port
# If logs show "Server running on port 3001" but should be 5000:
# Check your .env file PORT setting:
grep "PORT=" .env

# Backend should run on port 5000 in production. If it's running on 3001:
# 1. Update .env file to set PORT=5000
# 2. Or update health check to use correct port
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3001/health

# B) Database connection issues - run Prisma migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# C) Check if DATABASE_URL is correct in .env file
grep "DATABASE_URL" .env

# D) Restart backend service specifically
docker-compose -f docker-compose.prod.yml restart backend

# E) If port mismatch, test the actual running port
# Check what port backend is actually using:
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3001/health || \
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:5000/health

# F) Full restart if needed
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

**Check specific backend logs**:

````bash
# Real-time backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 50 lines of backend logs
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
```&& sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
# or for newer versions:
sudo dnf update -y
````

### 1.3 Install Required Packages

```bash
# For Ubuntu/Debian
sudo apt install -y curl wget git vim nano htop ufw cron

# For CentOS/RHEL
sudo yum install -y curl wget git vim nano htop firewalld cronie
# or:
sudo dnf install -y curl wget git vim nano htop firewalld cronie

# Enable and start cron service
sudo systemctl enable cron 2>/dev/null || sudo systemctl enable crond
sudo systemctl start cron 2>/dev/null || sudo systemctl start crond
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

**Configure the following variables exactly:**

```env
# Database
DATABASE_URL="postgresql://webtruyen_user:your_secure_db_password@postgres:5432/webtruyen_prod"
POSTGRES_DB=webtruyen_prod
POSTGRES_USER=webtruyen_user
POSTGRES_PASSWORD=your_secure_db_password

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://vuaxemohinh.com
BACKEND_URL=https://vuaxemohinh.com

# Next.js Public Variables
NEXT_PUBLIC_API_URL=https://vuaxemohinh.com
NEXT_PUBLIC_FRONTEND_URL=https://vuaxemohinh.com

# JWT - Generate secure random strings
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_different_key_here

# File Upload
UPLOAD_DIR=/uploads
MAX_FILE_SIZE=10485760

# Domain
DOMAIN=vuaxemohinh.com

# Security
CORS_ORIGIN=https://vuaxemohinh.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

**IMPORTANT**: Replace the placeholder values:

- `your_secure_db_password` → Strong database password
- `your_super_secure_jwt_secret_key_here_32_chars_minimum` → Random 32+ character string
- `your_super_secure_refresh_secret_different_key_here` → Different random 32+ character string

### 4.3 Verify Environment File

```bash
# Check if .env.prod file exists and has content
ls -la .env.prod
echo "Environment file preview (first few lines):"
head -5 .env.prod

# Verify no empty values (should show no WARN messages)
docker-compose -f docker-compose.prod.yml config | head -10
```

### 4.4 Create Required Directories

```bash
mkdir -p uploads/images uploads/audio
mkdir -p ssl
mkdir -p logs/nginx logs/postgres logs/backend
sudo chown -R $USER:$USER uploads ssl logs
```

## Step 5: DNS Configuration (CRITICAL)

### 5.1 Verify DNS Settings

**IMPORTANT**: Before proceeding, ensure your domain points to your server IP.

```bash
# Check current DNS resolution
nslookup vuaxemohinh.com
ping vuaxemohinh.com

# Should return: 180.93.138.93
```

**If domain doesn't point to your server IP:**

1. Login to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS records:
   - A Record: `vuaxemohinh.com` → `180.93.138.93`
   - A Record: `www.vuaxemohinh.com` → `180.93.138.93`
3. Wait 5-15 minutes for DNS propagation
4. Verify again with `ping vuaxemohinh.com`

## 8. SSL Certificate Configuration

### 6.1 Install Certbot

```bash
# For Ubuntu/Debian
sudo apt install -y certbot

# For CentOS/RHEL
sudo yum install -y certbot
# or:
sudo dnf install -y certbot
```

### 6.2 Generate SSL Certificate

```bash
# Stop any services using ports 80/443
sudo systemctl stop nginx 2>/dev/null || true

# Verify domain points to this server
echo "Current server IP:"
curl -s ifconfig.me
echo ""
echo "Domain resolves to:"
nslookup vuaxemohinh.com | grep "Address:" | tail -1

# If domain points correctly, generate certificate
sudo certbot certonly --standalone -d vuaxemohinh.com -d www.vuaxemohinh.com

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/vuaxemohinh.com/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/
```

### 6.3 Alternative: Self-Signed Certificate (for testing)

If you can't get Let's Encrypt working immediately:

```bash
# Generate self-signed certificate for testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=VN/ST=HCM/L=HCM/O=WebTruyen/CN=vuaxemohinh.com"

sudo chown -R $USER:$USER ssl/
```

### 6.4 Setup Auto-renewal (Only for Let's Encrypt)

```bash
# Install crontab if not available
sudo apt install -y cron 2>/dev/null || sudo yum install -y cronie 2>/dev/null || sudo dnf install -y cronie 2>/dev/null

# Enable and start cron service
sudo systemctl enable cron 2>/dev/null || sudo systemctl enable crond
sudo systemctl start cron 2>/dev/null || sudo systemctl start crond

# Add cron job for certificate renewal (skip if using self-signed)
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/webtruyen/docker-compose.prod.yml restart nginx") | crontab -

# Verify cron job was added
crontab -l
```

## Step 7: Deploy Application

## 6. Configure Environment Variables

### 6.1 Generate Secure Passwords and Secrets

Before deploying, generate secure passwords and secrets:

```bash
# Generate database password
echo "DB_PASSWORD: $(openssl rand -base64 32)"

# Generate JWT secret
echo "JWT_SECRET: $(openssl rand -base64 64)"

# Generate JWT refresh secret
echo "JWT_REFRESH_SECRET: $(openssl rand -base64 64)"
```

### 6.2 Create Environment File

**IMPORTANT**: Docker Compose requires a `.env` file in the project root directory. Create it with all required variables:

```bash
# Navigate to project directory
cd /opt/webtruyen

# Create .env file with all required variables
cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=webtruyen_prod
POSTGRES_USER=webtruyen_user
POSTGRES_PASSWORD=YOUR_GENERATED_DB_PASSWORD_HERE

# Database URL for Prisma
DATABASE_URL=postgresql://webtruyen_user:YOUR_GENERATED_DB_PASSWORD_HERE@postgres:5432/webtruyen_prod

# JWT Secrets (Use generated values from step 6.1)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE

# Application URLs
FRONTEND_URL=https://vuaxemohinh.com
BACKEND_URL=https://vuaxemohinh.com
DOMAIN=vuaxemohinh.com

# Application Configuration
NODE_ENV=production
PORT=5000

# Security
CORS_ORIGIN=https://vuaxemohinh.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload Configuration
UPLOAD_DIR=/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
EOF
```

### 6.3 Update Environment Values

**Replace the placeholder values** with the secure values generated in step 6.1:

```bash
# Edit the .env file
nano .env

# Or use sed to replace values (example):
sed -i 's/YOUR_GENERATED_DB_PASSWORD_HERE/ActualGeneratedPassword/' .env
sed -i 's/YOUR_GENERATED_JWT_SECRET_HERE/ActualJWTSecret/' .env
sed -i 's/YOUR_GENERATED_REFRESH_SECRET_HERE/ActualRefreshSecret/' .env
```

### 6.4 Verify Environment Configuration

```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded (without showing sensitive values)
echo "Checking environment variables..."
docker-compose -f docker-compose.prod.yml config | grep -E "POSTGRES_|JWT_|DATABASE_URL" | head -5
```

## 7. Deploy with Docker Compose

### 7.1 Build and Start Services

```bash
# Build and start all services in detached mode
docker-compose -f docker-compose.prod.yml up --build -d

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs
```

### 7.2Initialize Database

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

### Environment Variable Issues

**Problem**: Docker shows warnings like "The POSTGRES_DB variable is not set"

**Symptoms**:

```
WARN[0000] The "POSTGRES_DB" variable is not set. Defaulting to a blank string.
WARN[0000] The "POSTGRES_USER" variable is not set. Defaulting to a blank string.
WARN[0000] The "DATABASE_URL" variable is not set. Defaulting to a blank string.
```

**Solution**:

```bash
# Step 1: Check if .env file exists
ls -la .env

# Step 2: If missing, create it (follow section 6.2)
# If exists, verify content:
cat .env

# Step 3: Ensure all required variables are set
grep -E "POSTGRES_|JWT_|DATABASE_URL" .env

# Step 4: Restart containers after fixing .env
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

**Alternative**: Use explicit env file:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

### PostgreSQL Container Health Check Failures

**Problem**: Container shows as unhealthy or fails to start with "dependency failed to start: container webtruyen-postgres-1 is unhealthy"

**Solution**:

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify database credentials in .env file
# Ensure POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are set with actual values

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Reset database if needed (WARNING: This will delete all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up --build -d
```

### Other Common Issues

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

## Quick Deployment Commands (Copy-Paste Ready)

### Update Source Code and Deploy

```bash
# Navigate to project directory
cd /opt/webtruyen

# Pull latest changes from GitHub
git pull origin master

# Copy updated environment file
cp .env.prod .env

# Stop containers and clear Docker cache
docker-compose -f docker-compose.prod.yml down
docker system prune -f

# Force rebuild without cache and start
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs backend
```

### Database Setup (First Time Only)

```bash
# Wait for containers to start
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# Restart backend after migrations
docker-compose -f docker-compose.prod.yml restart backend
```

### Check Deployment

```bash
# Check all containers are healthy
docker-compose -f docker-compose.prod.yml ps

# Test backend health
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:5000/health

# Test application
curl -I https://vuaxemohinh.com
```

## Support

For issues or questions:

- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- GitHub Issues: Create an issue in the repository
- Server logs: `/var/log/nginx/`, `/var/log/webtruyen-backup.log`
