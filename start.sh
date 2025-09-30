#!/bin/bash

# Start script for the Authentication System

echo "🚀 Starting Full-Stack Authentication System"
echo "============================================="

# Check if backend .authsys file exists
if [ ! -f "./backend/.authsys" ]; then
    echo "❌ Backend .authsys file not found!"
    echo "📝 Please copy .authsys.example to .authsys and configure it"
    exit 1
fi

# Check if frontend .env.local file exists
if [ ! -f "./frontend/.env.local" ]; then
    echo "❌ Frontend .env.local file not found!"
    echo "📝 Please copy .env.local.example to .env.local and configure it"
    exit 1
fi

echo "✅ Configuration files found"
echo ""

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Both servers are starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for any process to exit
wait $BACKEND_PID $FRONTEND_PID