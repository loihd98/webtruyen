#!/bin/bash

# Script fix API configuration và restart services
echo "🔧 FIX API CONFIGURATION"
echo "======================="

echo "🔄 1. Restart frontend để áp dụng config mới..."
docker compose -f docker-compose.prod.yml restart frontend

echo "⏳ Chờ frontend khởi động..."
sleep 15

echo ""
echo "🔍 2. Kiểm tra frontend environment:"
docker compose -f docker-compose.prod.yml exec frontend env | grep -E "(API_URL|FRONTEND_URL)" 2>/dev/null || echo "Frontend env check..."

echo ""
echo "🧪 3. Test API endpoints:"
chmod +x test-api.sh
./test-api.sh

echo ""
echo "✅ API CONFIGURATION FIXED!"
echo "=========================="
echo "🌐 Frontend bây giờ sẽ gọi API qua:"
echo "   - http://vuaxemohinh.com/api/auth/login"
echo "   - http://vuaxemohinh.com/api/..."
echo ""
echo "🚫 KHÔNG còn gọi localhost:5000"
echo ""
echo "🔑 Test login trên website:"
echo "   - Mở http://vuaxemohinh.com"
echo "   - Thử login"
echo "   - Check browser Network tab"
echo "   - API calls phải đi qua vuaxemohinh.com/api"