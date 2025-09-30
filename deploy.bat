@echo off
REM HackerAuth Deployment Script for Windows
echo 🔥 Starting HackerAuth Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo 🔥 ========================================= 🔥
echo     HACKER AUTH SYSTEM - DEPLOYMENT    
echo 🔥 ========================================= 🔥

REM Environment setup
echo [INFO] Setting up environment files...

REM Backend environment
if not exist "backend\.env" (
    echo [WARNING] Backend .env file not found. Creating from example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
        echo [INFO] Please edit backend\.env with your configuration
    ) else (
        echo [ERROR] Backend .env.example not found!
        pause
        exit /b 1
    )
)

REM Frontend environment
if not exist "frontend\.env.local" (
    echo [WARNING] Frontend .env.local file not found. Creating from example...
    if exist "frontend\.env.local.example" (
        copy "frontend\.env.local.example" "frontend\.env.local"
        echo [INFO] Please edit frontend\.env.local with your configuration
    ) else (
        echo [ERROR] Frontend .env.local.example not found!
        pause
        exit /b 1
    )
)

REM Build and start services
echo [INFO] Building Docker images...
docker-compose build

if %ERRORLEVEL% equ 0 (
    echo [INFO] Docker images built successfully!
) else (
    echo [ERROR] Failed to build Docker images!
    pause
    exit /b 1
)

echo [INFO] Starting services...
docker-compose up -d

if %ERRORLEVEL% equ 0 (
    echo [INFO] Services started successfully!
) else (
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo [INFO] Checking service health...

REM Check if services are running
docker-compose ps

echo 🎉 Deployment Complete! 🎉
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend API: http://localhost:5000
echo [INFO] API Health: http://localhost:5000/api/health
echo [INFO] MongoDB: localhost:27017

echo 📋 Next Steps:
echo [INFO] 1. Configure your .env files with real credentials
echo [INFO] 2. Set up OAuth applications (Google, Facebook)
echo [INFO] 3. Configure email service (Gmail/SendGrid)
echo [INFO] 4. Configure SMS service (Twilio)
echo [INFO] 5. Set up image storage (Cloudinary)

echo 🛠️ Useful Commands:
echo [INFO] View logs: docker-compose logs -f
echo [INFO] Stop services: docker-compose down
echo [INFO] Restart services: docker-compose restart
echo [INFO] View running containers: docker-compose ps

echo.
echo 🔥 HackerAuth is ready! Time to hack the authentication! 🔥
pause