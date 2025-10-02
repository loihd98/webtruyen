# 🚀 WEBTRUYEN DEPLOYMENT - THỨ TỰ SCRIPTS

## 📋 THỨ TỰ CHẠY SCRIPTS

### 🆕 DEPLOYMENT LẦN ĐẦU

```bash
# 1. Setup VPS (chỉ chạy 1 lần)
sudo ./vps-setup.sh

# 2. Deploy application
./deploy.sh

# 3. Setup SSL (sau khi HTTP working)
./simple-ssl.sh
```

### 🔧 KHI CÓ LỖI DEPLOYMENT

```bash
# 1. Fix build/container errors
./fix-build-error.sh

# 2. Fix external access (nếu không truy cập được)
./fix-external-access.sh

# 3. Setup SSL
./simple-ssl.sh
```

### 🔐 KHI CÓ LỖI SSL

```bash
# 1. Fix SSL errors và restore HTTP
./fix-ssl-error.sh

# 2. Setup SSL lại (đơn giản)
./simple-ssl.sh

# 3. Test HTTPS API
./test-https-api.sh
```

---

## 🧪 SCRIPTS TESTING/DEBUG

```bash
# Check health tổng quát
./health-check.sh

# Debug network issues
./debug-network.sh

# Test HTTPS và API calls
./test-https-api.sh

# Verify deployment success
./success-check.sh
```

---

## 🎯 WORKFLOW HOÀN CHỈNH

### Scenario 1: Fresh VPS

```bash
1. ./vps-setup.sh          # Setup server
2. ./deploy.sh             # Deploy app
3. ./simple-ssl.sh         # Add SSL
4. ./success-check.sh      # Verify
```

### Scenario 2: Build errors

```bash
1. ./fix-build-error.sh    # Fix build
2. ./health-check.sh       # Check status
3. ./simple-ssl.sh         # Add SSL if needed
```

### Scenario 3: Network issues

```bash
1. ./debug-network.sh      # Diagnose
2. ./fix-external-access.sh # Fix access
3. ./health-check.sh       # Verify
```

### Scenario 4: SSL problems

```bash
1. ./fix-ssl-error.sh      # Clean SSL errors
2. ./simple-ssl.sh         # Retry SSL
3. ./test-https-api.sh     # Test HTTPS
```

---

## 📖 DOCUMENTATION

- **`DEPLOYMENT_GUIDE.md`** - Hướng dẫn chi tiết
- **`QUICK_DEPLOY_FIXED.md`** - Commands nhanh (đúng)
- **`PROJECT_STRUCTURE.md`** - Cấu trúc files

---

## 🌐 KẾT QUẢ MONG ĐỢI

- **Website**: https://vuaxemohinh.com ✅
- **API**: https://vuaxemohinh.com/api ✅
- **Admin**: https://vuaxemohinh.com/admin ✅
- **IP trực tiếp**: http://180.93.138.93 ✅

---

**🔥 LUÔN CHẠY SCRIPTS THEO THỨ TỰ TRÊN!**
