@echo off
REM Start script for the Authentication System

echo 🚀 Starting Full-Stack Authentication System
echo =============================================

REM Check if backend .authsys file exists
if not exist ".\backend\.authsys" (
    echo ❌ Backend .authsys file not found!
    echo 📝 Please copy .authsys.example to .authsys and configure it
    pause
    exit /b 1
)

REM Check if frontend .env.local file exists
if not exist ".\frontend\.env.local" (
    echo ❌ Frontend .env.local file not found!
    echo 📝 Please copy .env.local.example to .env.local and configure it
    pause
    exit /b 1
)

echo ✅ Configuration files found
echo.

REM Start backend
echo 🔧 Starting Backend Server...
start "Backend Server" cmd /c "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo 🎨 Starting Frontend Server...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo 🎉 Both servers are starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul