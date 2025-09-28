#!/bin/bash

echo "🏥 Web Truyện Health Check - $(date)"
echo "================================================"

# Check Docker containers
echo "🐳 Container Status:"
docker compose -f docker-compose.prod.yml ps

# Check application endpoints
echo -e "\n🌐 Application Health:"
curl -s -o /dev/null -w "Frontend: %{http_code} - %{time_total}s\n" http://localhost/health
curl -s -o /dev/null -w "Backend: %{http_code} - %{time_total}s\n" http://localhost/api/health

# Check database
echo -e "\n🗄️ Database Status:"
docker compose -f docker-compose.prod.yml exec -T db pg_isready -U webtruyen_prod -d webtruyen_prod

# Check disk usage
echo -e "\n💾 Disk Usage:"
df -h /var/www/webtruyen

# Check memory usage
echo -e "\n🧠 Memory Usage:"
free -h

# Check recent logs for errors
echo -e "\n📋 Recent Errors (last 10):"
docker compose -f docker-compose.prod.yml logs --tail=10 | grep -i error || echo "No recent errors found"