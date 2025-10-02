#!/bin/bash

# Script test nhanh trạng thái website
echo "🔍 KIỂM TRA TRẠNG THÁI NHANH"
echo "==========================="

echo "📊 Docker Services:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Test Connections:"

# Test từng service
services=("postgres:5432" "backend:5000" "frontend:3000" "nginx:80")
for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $name (port $port) - OK"
    else
        echo "❌ $name (port $port) - FAILED"
    fi
done

echo ""
echo "🌐 HTTP Tests:"

# Test HTTP endpoints
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx health check - OK"
else
    echo "❌ Nginx health check - FAILED"
fi

if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend health check - OK"
else
    echo "❌ Backend health check - FAILED"
fi

frontend_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$frontend_code" = "200" ] || [ "$frontend_code" = "302" ] || [ "$frontend_code" = "404" ]; then
    echo "✅ Frontend (HTTP $frontend_code) - OK"
else
    echo "❌ Frontend (HTTP $frontend_code) - FAILED"
fi

if curl -f -s http://localhost > /dev/null 2>&1; then
    echo "✅ Website (via nginx) - OK"
else
    echo "❌ Website (via nginx) - FAILED"
fi

echo ""
echo "📋 Quick Commands:"
echo "- Xem logs: docker compose -f docker-compose.prod.yml logs -f [service]"
echo "- Restart: docker compose -f docker-compose.prod.yml restart [service]"
echo "- Rebuild: docker compose -f docker-compose.prod.yml build --no-cache [service]"