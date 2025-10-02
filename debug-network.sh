#!/bin/bash

# Script debug network connectivity và nginx issues
echo "🔍 DEBUG NETWORK & NGINX CONNECTIVITY"
echo "====================================="

echo "📊 1. DOCKER SERVICES STATUS:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔌 2. PORT BINDING CHECK:"
echo "Nginx ports:"
docker compose -f docker-compose.prod.yml port nginx 80 2>/dev/null || echo "❌ Port 80 not bound"
docker compose -f docker-compose.prod.yml port nginx 443 2>/dev/null || echo "❌ Port 443 not bound"

echo ""
echo "📡 3. NETWORK LISTENING:"
echo "Active listening ports:"
netstat -tlpn | grep -E ':(80|443|3000|5000)' || ss -tlpn | grep -E ':(80|443|3000|5000)'

echo ""
echo "🔥 4. FIREWALL STATUS:"
ufw status 2>/dev/null || iptables -L INPUT | grep -E '(80|443)' || echo "⚠️  Cannot check firewall"

echo ""
echo "🌐 5. NGINX CONFIG CHECK:"
echo "Nginx config test:"
docker compose -f docker-compose.prod.yml exec nginx nginx -t 2>/dev/null || echo "❌ Nginx config error"

echo ""
echo "📋 6. NGINX LOGS (last 10 lines):"
docker compose -f docker-compose.prod.yml logs --tail=10 nginx

echo ""
echo "🔍 7. INTERNAL CONNECTIVITY TESTS:"

# Test internal connections
echo "Testing internal connections:"
curl -I http://localhost:80 2>/dev/null && echo "✅ localhost:80 OK" || echo "❌ localhost:80 FAILED"
curl -I http://127.0.0.1:80 2>/dev/null && echo "✅ 127.0.0.1:80 OK" || echo "❌ 127.0.0.1:80 FAILED"

# Test if nginx can reach backend/frontend
echo ""
echo "Testing backend/frontend from inside nginx:"
docker compose -f docker-compose.prod.yml exec nginx sh -c "wget -q --spider http://backend:5000/health && echo '✅ Nginx -> Backend OK' || echo '❌ Nginx -> Backend FAILED'"
docker compose -f docker-compose.prod.yml exec nginx sh -c "wget -q --spider http://frontend:3000 && echo '✅ Nginx -> Frontend OK' || echo '❌ Nginx -> Frontend FAILED'"

echo ""
echo "🌍 8. EXTERNAL IP & DNS CHECK:"
echo "Server public IP:"
curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "Cannot get public IP"

echo ""
echo "Domain DNS resolution:"
nslookup vuaxemohinh.com || echo "❌ DNS resolution failed"

echo ""
echo "🔧 9. NGINX PROCESS CHECK:"
docker compose -f docker-compose.prod.yml exec nginx ps aux | grep nginx || echo "❌ Nginx process check failed"

echo ""
echo "📁 10. NGINX CONFIG FILES:"
echo "Active nginx config:"
docker compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/conf.d/default.conf | head -20

echo ""
echo "🔍 DIAGNOSIS SUMMARY:"
echo "===================="
echo "1. Check if all services show 'Up' status"
echo "2. Check if ports 80,443 are bound to 0.0.0.0 (not 127.0.0.1)"
echo "3. Check if firewall allows ports 80,443"
echo "4. Check if nginx config is valid"
echo "5. Check if nginx can reach backend/frontend internally"

echo ""
echo "🛠️  COMMON FIXES:"
echo "- Restart nginx: docker compose -f docker-compose.prod.yml restart nginx"
echo "- Check firewall: ufw allow 80 && ufw allow 443"
echo "- Rebuild nginx: docker compose -f docker-compose.prod.yml build nginx"
echo "- Check logs: docker compose -f docker-compose.prod.yml logs nginx"