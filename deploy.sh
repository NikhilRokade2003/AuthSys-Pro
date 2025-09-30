#!/bin/bash

# HackerAuth Deployment Script
echo "🔥 Starting HackerAuth Deployment..."

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
    echo -e "${BLUE}$1${NC}"
}

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

print_header "🔥 ========================================= 🔥"
print_header "    HACKER AUTH SYSTEM - DEPLOYMENT    "
print_header "🔥 ========================================= 🔥"

# Environment setup
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_status "Please edit backend/.env with your configuration"
    else
        print_error "Backend .env.example not found!"
        exit 1
    fi
fi

# Frontend environment
if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend .env.local file not found. Creating from example..."
    if [ -f "frontend/.env.local.example" ]; then
        cp frontend/.env.local.example frontend/.env.local
        print_status "Please edit frontend/.env.local with your configuration"
    else
        print_error "Frontend .env.local.example not found!"
        exit 1
    fi
fi

# Build and start services
print_status "Building Docker images..."
docker-compose build

if [ $? -eq 0 ]; then
    print_status "Docker images built successfully!"
else
    print_error "Failed to build Docker images!"
    exit 1
fi

print_status "Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_status "Services started successfully!"
else
    print_error "Failed to start services!"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
print_status "Checking service health..."

# Check MongoDB
if docker-compose ps mongodb | grep -q "Up"; then
    print_status "✅ MongoDB is running"
else
    print_error "❌ MongoDB failed to start"
fi

# Check Backend
if curl -f http://localhost:5000/api/health &> /dev/null; then
    print_status "✅ Backend API is healthy"
else
    print_warning "⚠️ Backend API health check failed"
fi

# Check Frontend
if curl -f http://localhost:3000 &> /dev/null; then
    print_status "✅ Frontend is accessible"
else
    print_warning "⚠️ Frontend accessibility check failed"
fi

# Check Redis (optional)
if docker-compose ps redis | grep -q "Up"; then
    print_status "✅ Redis is running"
else
    print_warning "⚠️ Redis is not running (optional service)"
fi

print_header "🎉 Deployment Complete! 🎉"
print_status "Frontend: http://localhost:3000"
print_status "Backend API: http://localhost:5000"
print_status "API Health: http://localhost:5000/api/health"
print_status "MongoDB: localhost:27017"

print_header "📋 Next Steps:"
print_status "1. Configure your .env files with real credentials"
print_status "2. Set up OAuth applications (Google, Facebook)"
print_status "3. Configure email service (Gmail/SendGrid)"
print_status "4. Configure SMS service (Twilio)"
print_status "5. Set up image storage (Cloudinary)"

print_header "🛠️ Useful Commands:"
print_status "View logs: docker-compose logs -f"
print_status "Stop services: docker-compose down"
print_status "Restart services: docker-compose restart"
print_status "View running containers: docker-compose ps"

echo ""
print_header "🔥 HackerAuth is ready! Time to hack the authentication! 🔥"