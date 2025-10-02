# 📁 CẤU TRÚC FILE DEPLOYMENT

## 🚀 Scripts chính (10 files)

**Core deployment:**

- `vps-setup.sh` - Cài đặt VPS ban đầu
- `deploy.sh` - Deploy chính

**Troubleshooting:**

- `fix-build-error.sh` - Khắc phục lỗi build và deployment
- `fix-external-access.sh` - Fix lỗi truy cập external
- `fix-ssl-error.sh` - Khắc phục lỗi SSL setup

**SSL & HTTPS:**

- `simple-ssl.sh` - Setup SSL đơn giản (khuyến nghị)
- `setup-ssl.sh` - Setup SSL phức tạp (deprecated)

**Testing & monitoring:**

- `health-check.sh` - Kiểm tra trạng thái nhanh
- `test-https-api.sh` - Test HTTPS và API calls
- `debug-network.sh` - Debug network issues
- `success-check.sh` - Verify deployment thành công

## 📋 Documentation (5 files)

- `DEPLOYMENT_GUIDE.md` - Hướng dẫn deploy chi tiết với workflow scripts
- `QUICK_DEPLOY_FIXED.md` - Commands và thứ tự scripts đúng
- `QUICK_DEPLOY.md` - Commands cũ (có lỗi encoding)
- `VPS_OPTIMIZATION.md` - Tối ưu VPS
- `DATABASE_BACKUP_GUIDE.md` - Backup database
- `PROJECT_STRUCTURE.md` - Cấu trúc file này

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
