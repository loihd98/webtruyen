# Database Backup and Restore Guide

This guide covers comprehensive database backup and restore procedures for the Web Truyện project.

## Prerequisites

- Docker and Docker Compose installed
- Access to the server/environment
- Basic knowledge of PostgreSQL commands

## Production Environment

### Automated Backup (Recommended)

The production deployment includes an automated backup script that runs daily at 2 AM.

#### Location and Schedule
- **Backup Directory**: `/opt/backups/webtruyen/`
- **Schedule**: Daily at 2 AM via cron job
- **Retention**: 7 days (older backups are automatically deleted)
- **Log File**: `/var/log/webtruyen-backup.log`

#### Backup Script Location
```bash
/opt/backups/backup-webtruyen.sh
```

### Manual Backup Commands

#### 1. Database Only Backup
```bash
# Navigate to project directory
cd /opt/webtruyen

# Create backup with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > backup_db_$DATE.sql

# Verify backup was created
ls -la backup_db_$DATE.sql
```

#### 2. Complete Backup (Database + Uploads)
```bash
# Navigate to project directory
cd /opt/webtruyen

# Create backup directory
mkdir -p backups

# Set timestamp
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > backups/db_$DATE.sql

# Uploads backup
tar -czf backups/uploads_$DATE.tar.gz uploads/

# Environment backup (excluding sensitive data)
cp .env.prod backups/env_$DATE.backup

echo "Backup completed: $DATE"
echo "Files created:"
ls -la backups/*$DATE*
```

#### 3. Compressed Database Backup
```bash
# For large databases, use compression
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod | gzip > backup_db_$DATE.sql.gz
```

### Database Restore

#### 1. Restore from SQL Backup
```bash
# Stop the application (but keep database running)
docker-compose -f docker-compose.prod.yml stop backend frontend nginx

# Restore database (replace BACKUP_FILE with your backup filename)
BACKUP_FILE="backup_db_20241002_143000.sql"
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U webtruyen_user -d webtruyen_prod < $BACKUP_FILE

# Restart all services
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Restore from Compressed Backup
```bash
# For compressed backups
BACKUP_FILE="backup_db_20241002_143000.sql.gz"
gunzip -c $BACKUP_FILE | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U webtruyen_user -d webtruyen_prod
```

#### 3. Complete System Restore
```bash
# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U webtruyen_user -d webtruyen_prod < backups/db_20241002_143000.sql

# Restore uploads
tar -xzf backups/uploads_20241002_143000.tar.gz

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Development Environment

### Manual Backup Commands

#### 1. Database Backup
```bash
# Navigate to project directory
cd /path/to/webtruyen

# Create backup
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U webtruyen_dev webtruyen_dev > backup_dev_$DATE.sql
```

#### 2. Database Restore
```bash
# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U webtruyen_dev -d webtruyen_dev < backup_dev_20241002_143000.sql
```

## Advanced Backup Scenarios

### 1. Point-in-Time Recovery Setup

For critical production environments, consider setting up continuous archiving:

```bash
# Enable WAL archiving in PostgreSQL configuration
# Add to postgresql.conf (inside container):
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

### 2. Remote Backup Storage

#### Upload to Cloud Storage (AWS S3 example)
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Upload backup to S3
DATE=$(date +%Y%m%d_%H%M%S)
aws s3 cp backup_db_$DATE.sql s3://your-backup-bucket/webtruyen/
```

#### Upload to Another Server (SCP)
```bash
# Upload via SCP
scp backup_db_$DATE.sql user@backup-server:/backups/webtruyen/
```

### 3. Incremental Backups

For large databases, use pg_basebackup for full backups and WAL archiving for incremental:

```bash
# Create base backup
docker-compose -f docker-compose.prod.yml exec postgres pg_basebackup -D /backup/base -Ft -z -P -U webtruyen_user
```

## Backup Verification

### 1. Test Backup Integrity
```bash
# Check if backup file is valid SQL
head -20 backup_db_20241002_143000.sql

# Check backup size (should not be empty)
ls -lh backup_db_20241002_143000.sql

# Verify with pg_dump --schema-only for structure check
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump --schema-only -U webtruyen_user webtruyen_prod > schema_check.sql
```

### 2. Test Restore in Development
```bash
# Create a test database
docker-compose -f docker-compose.dev.yml exec postgres createdb -U webtruyen_dev test_restore

# Restore backup to test database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U webtruyen_dev -d test_restore < backup_db_20241002_143000.sql

# Verify data
docker-compose -f docker-compose.dev.yml exec postgres psql -U webtruyen_dev -d test_restore -c "SELECT COUNT(*) FROM users;"
```

## Monitoring and Alerting

### 1. Backup Monitoring Script
```bash
#!/bin/bash
# /opt/scripts/check-backup-status.sh

BACKUP_DIR="/opt/backups/webtruyen"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/db_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No database backups found!"
    exit 1
fi

# Check if backup is less than 25 hours old
if [ $(find "$LATEST_BACKUP" -mtime -1 | wc -l) -eq 0 ]; then
    echo "WARNING: Latest backup is older than 24 hours!"
    exit 1
fi

echo "OK: Latest backup is recent - $LATEST_BACKUP"
```

### 2. Add to Cron for Daily Checks
```bash
# Add to crontab
crontab -e

# Add line:
0 9 * * * /opt/scripts/check-backup-status.sh >> /var/log/backup-check.log 2>&1
```

## Recovery Scenarios

### 1. Corrupted Database Recovery
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Remove corrupted data
docker volume rm webtruyen_postgres_data

# Start only database
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for database to initialize
sleep 30

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U webtruyen_user -d webtruyen_prod < backups/db_latest.sql

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Accidental Data Deletion
```bash
# Create backup of current state first
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > before_restore_$DATE.sql

# Restore from known good backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U webtruyen_user -d webtruyen_prod < backups/db_20241001_020000.sql
```

## Best Practices

1. **Regular Testing**: Test restore procedures monthly
2. **Multiple Locations**: Store backups in multiple locations
3. **Retention Policy**: Keep daily backups for 1 week, weekly for 1 month, monthly for 1 year
4. **Monitoring**: Set up alerts for backup failures
5. **Documentation**: Keep this guide updated with any changes
6. **Access Control**: Secure backup files with appropriate permissions
7. **Encryption**: Consider encrypting sensitive backups

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER /opt/backups/
   chmod +x /opt/backups/backup-webtruyen.sh
   ```

2. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose -f docker-compose.prod.yml ps postgres
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **Backup File Too Large**
   ```bash
   # Use compression
   docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod | gzip > backup_compressed.sql.gz
   ```

4. **Restore Hangs**
   ```bash
   # Check for blocking queries
   docker-compose -f docker-compose.prod.yml exec postgres psql -U webtruyen_user -d webtruyen_prod -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
   ```

## Support

For backup-related issues:
- Check backup logs: `/var/log/webtruyen-backup.log`
- PostgreSQL logs: `docker-compose logs postgres`
- Contact system administrator if issues persist