@echo off
REM YouTube API Automation Startup Script for Windows
REM Starts both the API key server and the main application

echo 🚀 Starting YouTube API Automation System
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if Google Cloud SDK is installed
gcloud --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Google Cloud SDK is not installed.
    echo 📋 Please install it first:
    echo    Windows: winget install Google.CloudSDK
    echo    Mac: brew install --cask google-cloud-sdk
    echo    Linux: curl https://sdk.cloud.google.com | bash
    echo.
    echo Then run: npm run youtube:setup
    pause
    exit /b 1
)

REM Check if user is authenticated
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Please authenticate with Google Cloud:
    echo    gcloud auth login
    echo    gcloud config set project YOUR_PROJECT_ID
    pause
    exit /b 1
)

REM Start the API key server in background
echo 🔧 Starting API key server...
start /b npm run youtube:server

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Check if server is running
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API key server started successfully
) else (
    echo ❌ Failed to start API key server
    pause
    exit /b 1
)

REM Start the main application
echo 🎬 Starting main application...
start /b npm run dev

echo.
echo 🎉 YouTube API Automation System is running!
echo =============================================
echo 📱 Frontend: http://localhost:5173
echo 🔧 API Server: http://localhost:3001
echo 📊 Health Check: http://localhost:3001/health
echo.
echo Press any key to stop all services
pause >nul

REM Cleanup
echo 🛑 Shutting down services...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Services stopped

