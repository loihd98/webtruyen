#!/bin/bash

# Script cấu hình VPS ban đầu
# Chạy với quyền root: sudo ./vps-setup.sh

echo "🛠️  SETUP VPS INITIAL CONFIGURATION"
echo "IP: 180.93.138.93"
echo "Domain: vuaxemohinh.com"
echo "=================================="

# Update system
echo "📦 Cập nhật hệ thống..."
apt update && apt upgrade -y

# Cài đặt các gói cần thiết
echo "📦 Cài đặt packages cần thiết..."
apt install -y curl wget git nano htop ufw

# Cài đặt Docker
echo "🐳 Cài đặt Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker đã được cài đặt"
else
    echo "✅ Docker đã tồn tại"
fi

# Cài đặt Docker Compose
echo "🐙 Cài đặt Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose đã được cài đặt"
else
    echo "✅ Docker Compose đã tồn tại"
fi

# Cấu hình firewall
echo "🔥 Cấu hình firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✅ Firewall đã được cấu hình"

# Tạo swap file
echo "💾 Tạo swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swap file 2GB đã được tạo"
else
    echo "✅ Swap file đã tồn tại"
fi

# Tạo user deploy (optional)
echo "👤 Tạo user deploy..."
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    usermod -aG sudo deploy
    echo "✅ User deploy đã được tạo"
else
    echo "✅ User deploy đã tồn tại"
fi

# Tối ưu kernel parameters
echo "⚙️ Tối ưu kernel parameters..."
cat >> /etc/sysctl.conf << EOF
# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 16384 16777216

# File handle limits
fs.file-max = 65536
EOF

sysctl -p

# Tăng limit cho user
echo "📈 Tăng resource limits..."
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

# Cấu hình timezone
echo "🕒 Cấu hình timezone..."
timedatectl set-timezone Asia/Ho_Chi_Minh

# Disable unnecessary services
echo "🔇 Disable services không cần thiết..."
systemctl disable apache2 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true

# Show system info
echo ""
echo "🎉 VPS SETUP HOÀN TẤT!"
echo "=================================="
echo "🖥️  System Info:"
echo "- OS: $(lsb_release -d | cut -f2)"
echo "- RAM: $(free -h | grep Mem | awk '{print $2}')"
echo "- Disk: $(df -h / | tail -1 | awk '{print $4}') free"
echo "- Swap: $(free -h | grep Swap | awk '{print $2}')"
echo ""
echo "🔧 Docker Version:"
docker --version
docker-compose --version
echo ""
echo "🌐 Network:"
echo "- IP: $(curl -s ifconfig.me)"
echo "- Domain: vuaxemohinh.com (kiểm tra DNS pointing)"
echo ""
echo "📋 Next Steps:"
echo "1. Clone project: git clone https://github.com/loihd98/webtruyen.git"
echo "2. Cd vào project: cd webtruyen"
echo "3. Chạy deploy: chmod +x deploy.sh && ./deploy.sh"
echo ""
echo "🔐 Security Notes:"
echo "- SSH key authentication khuyến nghị"
echo "- Thay đổi SSH port mặc định"
echo "- Setup fail2ban cho SSH protection"