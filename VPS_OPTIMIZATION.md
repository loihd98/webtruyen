# VPS Deployment Optimization Guide

## Vấn đề gặp phải
- Build frontend bị "Killed" do hết RAM
- Next.js build rất tốn memory (có thể lên đến 2-4GB)
- VPS thường có RAM hạn chế

## Giải pháp đã áp dụng

### 1. Thêm Memory Limits vào Docker Compose
```yaml
deploy:
  resources:
    limits:
      memory: 1G        # Giới hạn tối đa
    reservations:
      memory: 512M      # Đảm bảo tối thiểu
```

### 2. Tối ưu Node.js Memory
- `NODE_OPTIONS=--max-old-space-size=2048` cho build
- `NODE_OPTIONS=--max-old-space-size=1024` cho runtime

### 3. Build Strategy
- Build từng service một thay vì tất cả cùng lúc
- Dọn dẹp Docker cache trước khi build

## Hướng dẫn deploy

### Cách 1: Sử dụng script tự động
```bash
chmod +x deploy-optimized.sh
./deploy-optimized.sh
```

### Cách 2: Manual deployment
```bash
# 1. Tạo swap file (nếu chưa có)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. Dọn dẹp Docker
docker system prune -af --volumes

# 3. Build từng service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build frontend

# 4. Deploy
docker compose -f docker-compose.prod.yml up -d
```

## Kiểm tra tài nguyên

### Kiểm tra RAM và Swap
```bash
free -h
```

### Kiểm tra Docker containers
```bash
docker stats
```

### Kiểm tra logs nếu có lỗi
```bash
docker compose -f docker-compose.prod.yml logs frontend
```

## Tối ưu thêm cho VPS RAM thấp

### 1. Giảm concurrent builds
Thêm vào `.env.prod`:
```
DOCKER_BUILDKIT=1
BUILDKIT_STEP_LOG_MAX_SIZE=10485760
```

### 2. Sử dụng multi-stage build hiệu quả hơn
- Dockerfile đã được tối ưu để chỉ copy những file cần thiết
- Sử dụng alpine images để giảm kích thước

### 3. Monitor tài nguyên
```bash
# Theo dõi realtime
htop
# hoặc
docker stats --no-stream
```

## Troubleshooting

### Nếu vẫn bị "Killed":
1. Tăng swap file lên 4GB
2. Giảm `max-old-space-size` xuống 1024 cho build
3. Build trên máy local rồi push image lên registry

### Nếu build chậm:
1. Sử dụng `.dockerignore` để loại bỏ file không cần thiết
2. Enable BuildKit: `export DOCKER_BUILDKIT=1`
3. Cache layers hiệu quả hơn

## VPS Requirements
- **Minimum**: 2GB RAM + 2GB Swap
- **Recommended**: 4GB RAM + 2GB Swap
- **Storage**: Ít nhất 10GB free space cho Docker images