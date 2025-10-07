#!/bin/bash

echo "🚀 Railway Setup Script"
echo "======================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI is installed"

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "railway login"
    echo "This will open a browser for authentication."
    exit 1
fi

echo "✅ Logged in to Railway"

# Create project
echo "📦 Creating Railway project..."
railway init workflow-automation-platform

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
echo "🔧 Setting environment variables..."
echo "Please set your YouTube API key:"
read -p "Enter your YouTube API key: " YOUTUBE_API_KEY
railway variables set YOUTUBE_API_KEY=$YOUTUBE_API_KEY

echo "Please set your frontend URL:"
read -p "Enter your frontend URL (e.g., https://your-domain.com): " FRONTEND_URL
railway variables set FRONTEND_URL=$FRONTEND_URL

# Deploy backend
echo "🚀 Deploying backend to Railway..."
railway up

# Setup database
echo "📊 Setting up database schema..."
railway run npm run setup-db

echo "✅ Setup complete!"
echo "🎉 Your backend is now live on Railway!"
echo "📝 Check status with: railway status"
echo "📊 View logs with: railway logs"
