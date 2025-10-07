#!/bin/bash

# YouTube API Automation Startup Script
# Starts both the API key server and the main application

echo "🚀 Starting YouTube API Automation System"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo "⚠️  Google Cloud SDK is not installed."
    echo "📋 Please install it first:"
    echo "   Windows: winget install Google.CloudSDK"
    echo "   Mac: brew install --cask google-cloud-sdk"
    echo "   Linux: curl https://sdk.cloud.google.com | bash"
    echo ""
    echo "Then run: npm run youtube:setup"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "🔑 Please authenticate with Google Cloud:"
    echo "   gcloud auth login"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

# Start the API key server in background
echo "🔧 Starting API key server..."
npm run youtube:server &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API key server started successfully"
else
    echo "❌ Failed to start API key server"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Start the main application
echo "🎬 Starting main application..."
npm run dev &
APP_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $SERVER_PID 2>/dev/null
    kill $APP_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo ""
echo "🎉 YouTube API Automation System is running!"
echo "============================================="
echo "📱 Frontend: http://localhost:5173"
echo "🔧 API Server: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait

