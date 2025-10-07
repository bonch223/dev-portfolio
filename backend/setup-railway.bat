@echo off
echo 🚀 Railway Setup Script
echo ======================

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

echo ✅ Railway CLI is installed

REM Check if user is logged in
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Railway. Please run:
    echo railway login
    echo This will open a browser for authentication.
    pause
    exit /b 1
)

echo ✅ Logged in to Railway

REM Create project
echo 📦 Creating Railway project...
railway init workflow-automation-platform

REM Add PostgreSQL database
echo 🗄️ Adding PostgreSQL database...
railway add postgresql

REM Set environment variables
echo 🔧 Setting environment variables...
set /p YOUTUBE_API_KEY="Enter your YouTube API key: "
railway variables set YOUTUBE_API_KEY=%YOUTUBE_API_KEY%

set /p FRONTEND_URL="Enter your frontend URL (e.g., https://your-domain.com): "
railway variables set FRONTEND_URL=%FRONTEND_URL%

REM Deploy backend
echo 🚀 Deploying backend to Railway...
railway up

REM Setup database
echo 📊 Setting up database schema...
railway run npm run setup-db

echo ✅ Setup complete!
echo 🎉 Your backend is now live on Railway!
echo 📝 Check status with: railway status
echo 📊 View logs with: railway logs
pause
