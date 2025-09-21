# Website Đọc & Nghe Truyện - Full Stack

Một website đọc và nghe truyện với đầy đủ chức năng như Vivu Truyện Hay, được xây dựng với kiến trúc production-ready.

## 🚀 Tính năng chính

### Frontend (Next.js + TailwindCSS)

- ✅ **SEO tối ưu**: SSR/ISR, meta tags, sitemap.xml, robots.txt, JSON-LD schema.org
- ✅ **Mobile-first**: Fully responsive design
- ✅ **State management**: Redux Toolkit (auth, bookmarks, unlockStates, settings)
- ✅ **Analytics**: Google Analytics GA4 integration
- ✅ **Animation**: Framer Motion cho UX mượt mà

### Backend (Node.js + Express + Prisma)

- ✅ **Authentication**: JWT (access + refresh), OAuth (Google, Facebook)
- ✅ **Authorization**: Role-based access (admin, user)
- ✅ **Database**: PostgreSQL với Prisma ORM
- ✅ **File Upload**: MP3 upload với static serving
- ✅ **Rate Limiting**: API protection
- ✅ **Security**: Helmet, CORS, input validation

### Core Features

- 📚 **Truyện Text**: Đọc chapter, unlock qua affiliate
- 🎵 **Truyện Audio**: Audio player custom, speed control
- 🔓 **Chapter Unlock**: Affiliate link integration
- 💬 **Comment System**: Nested comments, moderation
- 🔖 **Bookmark**: Save stories và chapters
- 🔍 **Search**: Tìm kiếm truyện theo tiêu đề, tác giả, thể loại
- 👑 **Admin Dashboard**: CRUD đầy đủ cho stories, chapters, users

## 🏗️ Kiến trúc

```
web_truyen/
├── frontend/          # Next.js app
├── backend/           # Node.js API
├── nginx/             # Reverse proxy config
├── uploads/           # Static files (MP3, images)
├── docker-compose.yml # Multi-service orchestration
└── .env              # Environment variables
```

## 🛠️ Tech Stack

**Frontend:**

- Next.js 14 (React 18)
- TailwindCSS + Framer Motion
- Redux Toolkit + Redux Persist
- NextAuth.js (OAuth)
- TypeScript

**Backend:**

- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT Authentication
- Passport.js (OAuth)
- Multer (File upload)

**Infrastructure:**

- Docker + Docker Compose
- Nginx (Reverse proxy + Static serving)
- PostgreSQL
- SSL/TLS support

## 🚀 Quick Start

### 1. Clone và Setup

```bash
git clone <repo-url>
cd web_truyen

# Copy environment file
cp .env.example .env
# Chỉnh sửa .env với các giá trị thực
```

### 2. Development

```bash
# Chạy tất cả services
docker-compose up --build

# Hoặc chạy riêng lẻ
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### 3. Production Deploy

```bash
# Trên Ubuntu VPS
git clone <repo-url>
cd web_truyen

# Setup environment
cp .env.example .env
nano .env  # Cập nhật các giá trị production

# Deploy với Docker
docker-compose -f docker-compose.yml up -d --build

# Setup SSL với Certbot
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

## 📱 User Flows

### Truyện Text Flow

1. **Trang chủ** → Click thumbnail truyện
2. **Affiliate click** → Mở tab mới + load trang detail
3. **Trang detail** → Hiển thị Chapter 1 mặc định
4. **Chapter locked** → Click icon 🔒 → Mở affiliate + unlock chapter
5. **Navigation** → Chuyển chapter với `← →`

### Truyện Audio Flow

1. **Trang chủ** → Click thumbnail audio
2. **Affiliate click** → Mở tab mới + load trang detail
3. **Audio player** → Play/pause, seek, speed control
4. **Chapter locked** → Click icon 🔒 → Mở affiliate + load audio
5. **Background play** → Tiếp tục phát khi browse

### Authentication Flow

- **Guest**: Unlock tạm lưu Redux/localStorage
- **Logged in**: Unlock lưu database permanent
- **OAuth**: Google/Facebook one-click login
- **Admin**: Truy cập dashboard CRUD

## 🔧 Configuration

### Environment Variables

```bash
# Database
POSTGRES_DB=web_truyen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password

# JWT
JWT_SECRET=your-jwt-secret-32-chars-min
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Database Schema

- **User**: email, password, role (user|admin), OAuth profiles
- **Story**: title, description, type (text|audio), affiliate links
- **Chapter**: content, audio file, lock status, unlock tracking
- **Comment**: nested comments với moderation
- **Bookmark**: user story/chapter saves
- **Analytics**: affiliate clicks, page views tracking

## 📊 Admin Features

### Dashboard Analytics

- Total users, stories, chapters
- Popular stories, view statistics
- Affiliate click tracking
- User engagement metrics

### Content Management

- **Stories**: CRUD, SEO settings, affiliate links
- **Chapters**: Content editor, audio upload, lock management
- **Users**: Role management, activity monitoring
- **Comments**: Moderation queue, approve/reject

### Media Management

- MP3 file upload với progress
- Audio file optimization
- Static file serving với CDN-ready

## 🔒 Security Features

- **Rate Limiting**: API endpoints protection
- **CORS**: Configured for production domains
- **Helmet**: Security headers
- **Input Validation**: Server-side validation
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: Content sanitization
- **JWT Security**: Secure token handling

## 📈 SEO & Performance

### SEO Optimization

- **SSR/ISR**: Server-side rendering cho crawler
- **Meta Tags**: Dynamic OG tags, Twitter cards
- **Sitemap**: Auto-generated XML sitemap
- **Schema.org**: JSON-LD structured data
- **Robots.txt**: Search engine directives

### Performance

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Redis-ready, CDN-friendly headers
- **Compression**: Gzip, Brotli support
- **Lazy Loading**: Components và images

## 🚀 Deployment

### VPS Requirements

- Ubuntu 20.04+
- 2GB RAM minimum
- 20GB storage
- Docker + Docker Compose
- Domain với DNS pointing

### Automated Deploy

```bash
# Clone repo
git clone <repo-url> /var/www/web_truyen
cd /var/www/web_truyen

# Environment setup
cp .env.example .env
nano .env

# SSL certificates
mkdir -p ssl/
# Copy cert.pem và key.pem vào ssl/

# Deploy
docker-compose up -d --build

# Verify
docker-compose ps
curl http://localhost/health
```

## 📞 Support

- **Documentation**: `/docs` endpoint
- **API Docs**: `/api/docs` (Swagger)
- **Health Check**: `/health`
- **Admin Panel**: `/admin`

---

**Developed by**: Web Truyen Team  
**License**: MIT  
**Version**: 1.0.0
