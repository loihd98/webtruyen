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