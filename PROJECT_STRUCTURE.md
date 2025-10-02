# 📁 CẤU TRÚC FILE DEPLOYMENT

## 🚀 Scripts chính (4 files)
- `vps-setup.sh` - Cài đặt VPS ban đầu
- `deploy.sh` - Deploy chính 
- `fix-build-error.sh` - Khắc phục lỗi build và deployment
- `setup-ssl.sh` - Setup SSL certificate
- `health-check.sh` - Kiểm tra trạng thái nhanh

## 📋 Documentation (4 files)
- `DEPLOYMENT_GUIDE.md` - Hướng dẫn deploy chi tiết
- `QUICK_DEPLOY.md` - Commands nhanh
- `VPS_OPTIMIZATION.md` - Tối ưu VPS
- `DATABASE_BACKUP_GUIDE.md` - Backup database

## ⚙️ Configuration files
- `docker-compose.prod.yml` - Production config
- `docker-compose.dev.yml` - Development config  
- `nginx/default.conf` - Nginx HTTPS config
- `nginx/http-only.conf` - Nginx HTTP config (testing)
- `nginx/nginx.conf` - Nginx main config

## 🗂️ Thư mục chính
- `backend/` - API server
- `frontend/` - Next.js app
- `uploads/` - User uploaded files
- `ssl/` - SSL certificates
- `logs/` - Application logs

## ✅ Files đã xóa (không cần thiết)
- ~~`deploy-optimized.sh`~~ (trùng với deploy.sh)
- ~~`fix-deployment.sh`~~ (thay bằng fix-build-error.sh)
- ~~`nginx/simple.conf`~~ (trùng với http-only.conf)
- ~~`PRODUCTION_DEPLOYMENT_GUIDE.md`~~ (trùng với DEPLOYMENT_GUIDE.md)

---

**Tổng cộng: 5 scripts + 4 docs + configs cần thiết = Tối ưu!**