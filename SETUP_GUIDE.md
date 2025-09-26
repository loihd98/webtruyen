# Web Truyện - Hướng Dẫn Setup và Chạy Dự Án

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 13.0
- **Docker & Docker Compose** (tùy chọn)
- **npm** hoặc **yarn**

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/loihd98/webtruyen.git
cd webtruyen
```

### 2. Setup Environment Variables

Đảm bảo file `.env` ở thư mục gốc có các biến môi trường sau:

```env
# Database
POSTGRES_DB=web_truyen_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/web_truyen_dev"

# JWT Secrets
JWT_SECRET=dev-jwt-secret-minimum-32-characters-long-for-development
JWT_REFRESH_SECRET=dev-refresh-secret-minimum-32-characters-long-for-development

# OAuth (để trống cho development)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# URLs
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret-minimum-32-characters-long

# Email (tùy chọn)
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@localhost

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Environment
NODE_ENV=development
PORT=5000
```

### 3. Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo Prisma client
npx prisma generate

# Chạy migration để tạo database schema
npx prisma migrate dev --name init

# Seed database với dữ liệu mẫu
node src/scripts/seed.js

# Khởi động backend server
npm run dev
```

docker-compose exec backend sh // run in backend

### 4. Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm run dev
```

## 🐳 Chạy với Docker

### 1. Khởi động tất cả services

```bash
docker-compose up -d
```

### 2. Seed database (sau khi containers đã chạy)

```bash
docker-compose exec backend node src/scripts/seed.js
```

### 3. Dừng services

```bash
docker-compose down
```

## 📊 Dữ Liệu Mẫu

Sau khi chạy script seed, bạn sẽ có:

### 👤 Tài Khoản Demo

- **Admin**: `admin@webtruyen.com` / `admin123456`
- **User**: `user@example.com` / `user123456`

### 📚 Dữ Liệu Mẫu

- 4 truyện (2 TEXT, 2 AUDIO)
- 10 thể loại
- Các chương với nội dung
- Comments và bookmarks
- File audio mẫu

## 🎯 Tính Năng Chính

### 🔐 Authentication & Authorization

- Đăng nhập/Đăng ký
- Role-based access control (USER, ADMIN)
- JWT token authentication
- Avatar upload và display

### 📖 Story Management

- Text stories với rich content
- Audio stories với player
- Chapter management
- Bookmarking system
- Comment system

### 🎛️ Admin Dashboard

- Responsive design
- User management
- Story management (CRUD)
- Media upload với drag-drop
- System settings
- Analytics dashboard

### 🔍 Advanced Features

- Multi-language support (VI, EN, ZH, KO, JA)
- Advanced story filtering
- Search functionality
- Dark/Light theme
- Mobile responsive

## 📁 Cấu Trúc Dự Án

```
web_truyen/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Authentication, validation
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database scripts
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema
│   └── uploads/            # File uploads
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   └── public/             # Static files
├── nginx/                  # Nginx configuration
└── ssl/                    # SSL certificates
```

## 🛠️ Scripts Hữu Ích

### Backend

```bash
# Development
npm run dev                 # Khởi động dev server
npm run build              # Build production
npm start                  # Chạy production server

# Database
npx prisma studio          # Mở Prisma Studio
npx prisma migrate reset   # Reset database
npx prisma db push         # Push schema changes
```

### Frontend

```bash
# Development
npm run dev                # Khởi động dev server
npm run build             # Build production
npm start                 # Chạy production server
npm run lint              # Check linting errors
```

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Kiểm tra PostgreSQL đang chạy
psql -h localhost -U postgres -d web_truyen_dev

# Reset database
cd backend
npx prisma migrate reset
node src/scripts/seed.js
```

### Docker Issues

```bash
# Restart Docker services
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

### Build Errors

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install

# TypeScript errors
npm run type-check
```

## 🎨 UI/UX Features

### Admin Dashboard

- ✅ Responsive sidebar navigation
- ✅ Statistics cards với real-time data
- ✅ Story management với thumbnails
- ✅ User management với role controls
- ✅ Media upload với drag-drop
- ✅ System settings với tabbed interface

### User Interface

- ✅ Navbar với avatar dropdown
- ✅ Advanced story filtering
- ✅ Audio player controls
- ✅ Mobile-responsive design
- ✅ Dark/Light theme toggle
- ✅ Multi-language support

## 📱 Mobile Responsive

Dự án được thiết kế hoàn toàn responsive:

- Mobile-first approach
- Touch-friendly controls
- Optimized layouts cho tablet và mobile
- Progressive Web App features

## 🌐 Deployment

### Production Environment

1. Update `.env` với production values
2. Setup SSL certificates
3. Configure Nginx reverse proxy
4. Setup CI/CD pipeline

### Environment Variables cho Production

- Thay đổi JWT secrets
- Cập nhật database credentials
- Configure OAuth applications
- Setup email service
- Add analytics tracking

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs trong terminal
2. Xem browser console cho errors
3. Kiểm tra database connection
4. Verify environment variables

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
