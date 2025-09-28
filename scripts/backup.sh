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