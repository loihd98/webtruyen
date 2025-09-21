#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

print_header "🚀 Web Truyen Deployment Script"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create one from .env.example"
    exit 1
fi

print_status "Found .env file ✓"

# Ask for deployment type
echo "Select deployment type:"
echo "1) Development (docker-compose.yml)"
echo "2) Production (docker-compose.prod.yml)"
read -p "Enter choice (1 or 2): " deployment_type

if [ "$deployment_type" = "1" ]; then
    COMPOSE_FILE="docker-compose.yml"
    ENV_TYPE="development"
elif [ "$deployment_type" = "2" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_TYPE="production"
else
    print_error "Invalid choice. Exiting."
    exit 1
fi

print_status "Deploying in $ENV_TYPE mode using $COMPOSE_FILE"

# Pull latest changes if this is an update
if [ "$1" = "update" ]; then
    print_header "📥 Pulling Latest Changes"
    git pull origin main
    if [ $? -ne 0 ]; then
        print_error "Failed to pull latest changes"
        exit 1
    fi
    print_status "Latest changes pulled successfully ✓"
fi

# Stop existing containers
print_header "🛑 Stopping Existing Containers"
docker-compose -f $COMPOSE_FILE down
print_status "Containers stopped ✓"

# Remove old images (optional, for clean rebuild)
if [ "$1" = "clean" ] || [ "$2" = "clean" ]; then
    print_header "🧹 Cleaning Old Images"
    docker-compose -f $COMPOSE_FILE down --rmi all -v
    docker system prune -f
    print_status "Old images cleaned ✓"
fi

# Build and start containers
print_header "🔨 Building and Starting Containers"
docker-compose -f $COMPOSE_FILE up -d --build

if [ $? -ne 0 ]; then
    print_error "Failed to build and start containers"
    exit 1
fi

print_status "Containers built and started successfully ✓"

# Wait for services to be ready
print_header "⏳ Waiting for Services to be Ready"
sleep 10

# Check if backend is healthy
print_status "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:5000/health &> /dev/null; then
        print_status "Backend is healthy ✓"
        break
    fi
    echo -n "."
    sleep 2
done

# Check if frontend is healthy
print_status "Checking frontend health..."
for i in {1..30}; do
    if curl -f http://localhost:3000 &> /dev/null; then
        print_status "Frontend is healthy ✓"
        break
    fi
    echo -n "."
    sleep 2
done

# Run database migrations
print_header "🗄️ Running Database Migrations"
docker-compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

if [ $? -eq 0 ]; then
    print_status "Database migrations completed ✓"
else
    print_warning "Database migrations failed or already up to date"
fi

# Seed database (optional)
read -p "Do you want to seed the database? (y/n): " seed_db
if [ "$seed_db" = "y" ] || [ "$seed_db" = "Y" ]; then
    print_header "🌱 Seeding Database"
    docker-compose -f $COMPOSE_FILE exec -T backend npm run seed
    if [ $? -eq 0 ]; then
        print_status "Database seeded successfully ✓"
    else
        print_warning "Database seeding failed or already seeded"
    fi
fi

# Show running containers
print_header "📊 Running Containers"
docker-compose -f $COMPOSE_FILE ps

# Show service URLs
print_header "🌐 Service URLs"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend API:${NC} http://localhost:5000"
echo -e "${GREEN}Backend Health:${NC} http://localhost:5000/health"

if [ "$ENV_TYPE" = "production" ]; then
    echo -e "${GREEN}Production URL:${NC} https://yourdomain.com"
fi

print_header "✅ Deployment Complete!"

# Show useful commands
echo ""
echo "Useful commands:"
echo "  View logs:           docker-compose -f $COMPOSE_FILE logs -f"
echo "  Stop services:       docker-compose -f $COMPOSE_FILE down"
echo "  Restart services:    docker-compose -f $COMPOSE_FILE restart"
echo "  Update deployment:   ./deploy.sh update"
echo "  Clean deployment:    ./deploy.sh clean"

echo ""
print_status "🎉 Web Truyen is now running!"