# 🚀 Quick Start Guide

This is a quick reference for developers to get started with the Web Truyện project.

## Development Setup (5 minutes)

1. **Clone & Enter**

   ```bash
   git clone https://github.com/loihd98/webtruyen.git
   cd webtruyen
   ```

2. **Setup Environment**

   ```bash
   cp .env.dev.example .env.dev
   ```

3. **Start Development**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access**
   - App: http://localhost:3000
   - API: http://localhost:5000
   - Admin: http://localhost:3000/admin

## Production Deployment

For VPS deployment to IP `180.93.138.93` with domain `vuaxemohinh.com`:

1. **Follow Production Guide**
   See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

2. **Quick Deploy**
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod with your production values
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Project Structure

```
webtruyen/
├── backend/           # Node.js API
├── frontend/          # Next.js App
├── nginx/             # Reverse Proxy
├── uploads/           # File Storage
└── logs/              # Application Logs
```

## Key Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production (Proper Sequence)
cp .env.prod .env
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check Status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx

# Database Setup (First Time)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# Database Backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > backup.sql
```

## Common Issues & Solutions

### Backend Container Unhealthy

```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Test health endpoint
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:5000/health

# Fix port issues - ensure .env has PORT=5000
grep "PORT=" .env
```

### Nginx Cannot Find Backend

```bash
# Error: host not found in upstream "backend:5000"
# Wait for backend to be healthy first
docker-compose -f docker-compose.prod.yml ps

# Restart nginx after backend is ready
docker-compose -f docker-compose.prod.yml restart nginx
```

### Backend "Cannot find module '/app/server.js'" Error

```bash
# This happens when Docker can't find the correct entry point
# Check if .env.dev exists
ls -la .env.dev*

# Create .env.dev if missing
cp .env.dev.example .env.dev

# Rebuild backend container
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache backend
docker compose -f docker-compose.dev.yml up -d

# Verify correct start command
docker compose -f docker-compose.dev.yml exec backend cat package.json | grep '"start"'
```

## Default Admin Account

After seeding the database:

- **Email**: admin@webtruyen.com
- **Password**: admin123

## Environment Files

- `.env.dev` - Development settings
- `.env.prod` - Production settings
- Use `.env.*.example` as templates

## Documentation

- [README.md](./README.md) - Full project documentation
- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Production setup
- [DATABASE_BACKUP_GUIDE.md](./DATABASE_BACKUP_GUIDE.md) - Backup procedures

npx prisma migrate dev --name init

---

**Happy Coding! 🎉**
