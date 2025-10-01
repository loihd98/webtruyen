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

# Production
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs nginx

# Database Backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U webtruyen_user webtruyen_prod > backup.sql
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
