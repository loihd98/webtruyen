#!/bin/bash

# Script kiểm tra và fix IPv4/IPv6 issues
echo "🌐 KIỂM TRA IPv4/IPv6 VÀ NETWORK"
echo "================================"

echo "🔍 1. KIỂM TRA IP ADDRESSES:"
echo "IPv4 addresses:"
ip -4 addr show | grep inet || echo "❌ No IPv4 found"

echo ""
echo "IPv6 addresses:"  
ip -6 addr show | grep inet6 | head -5

echo ""
echo "🌍 2. PUBLIC IP CHECK:"
echo "IPv4 public IP:"
curl -4 -s ifconfig.me 2>/dev/null || curl -4 -s ipinfo.io/ip 2>/dev/null || echo "❌ Cannot get IPv4"

echo "IPv6 public IP:"
curl -6 -s ifconfig.me 2>/dev/null || echo "❌ Cannot get IPv6"

echo ""
echo "🔌 3. NETWORK INTERFACES:"
ip link show | grep -E "(state UP|state DOWN)"

echo ""
echo "📡 4. ROUTING TABLE:"
echo "IPv4 routes:"
ip -4 route show | head -5

echo ""
echo "🧪 5. TEST EXTERNAL ACCESS:"
echo "Testing if website is actually accessible..."

# Test với curl từ external
external_test=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null)
echo "Local test: HTTP $external_test"

# Thử test với IPv4 binding cụ thể
ipv4_addr=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1)
if [ ! -z "$ipv4_addr" ]; then
    echo "Server IPv4: $ipv4_addr"
    echo "Test IPv4 direct: curl -I http://$ipv4_addr"
    curl -I "http://$ipv4_addr" 2>/dev/null && echo "✅ IPv4 direct access OK" || echo "❌ IPv4 direct access FAILED"
fi

echo ""
echo "🔧 6. NGINX EXTERNAL ACCESS TEST:"
# Thử tạo test endpoint
docker compose -f docker-compose.prod.yml exec nginx sh -c 'echo "server { listen 8080; location / { return 200 \"Nginx Test OK\"; } }" > /etc/nginx/conf.d/test.conf'
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Test port 8080:"
curl -s http://localhost:8080 2>/dev/null && echo "✅ Test port OK" || echo "❌ Test port FAILED"

echo ""
echo "🌐 7. DNS & DOMAIN CHECK:"
# Kiểm tra domain có trỏ đúng không
echo "Checking domain DNS..."
dig +short vuaxemohinh.com 2>/dev/null || nslookup vuaxemohinh.com 2>/dev/null || echo "❌ DNS tools not available"

echo ""
echo "🎯 DIAGNOSIS:"
echo "============"
if [ "$external_test" = "200" ]; then
    echo "✅ Website IS accessible internally"
    echo "✅ Check nginx logs - có request từ external IP: 204.76.203.219"
    echo "🔍 VẤN ĐỀ CÓ THỂ LÀ:"
    echo "   1. Browser cache - thử Ctrl+F5 hoặc incognito mode"
    echo "   2. DNS propagation delay"
    echo "   3. ISP blocking"
    echo "   4. CloudFlare hoặc CDN caching"
else
    echo "❌ Website not accessible even locally"
fi

echo ""
echo "🛠️  NEXT STEPS:"
echo "1. Website đã chạy OK - nginx logs show external requests!"
echo "2. Thử truy cập: http://$ipv4_addr (nếu có IPv4)"
echo "3. Thử incognito mode hoặc mobile data"
echo "4. Kiểm tra DNS: nslookup vuaxemohinh.com"
echo "5. Clear browser cache và thử lại"