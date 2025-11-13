@echo off
echo ==========================================
echo YouTube Scraper - Installation Script
echo ==========================================
echo.

echo [1/4] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found! Please install Python 3.11+
    pause
    exit /b 1
)
echo ✅ Python found
echo.

echo [2/4] Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo [3/4] Setting up environment file...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your:
    echo    - Database credentials
    echo    - YouTube API key(s)
    echo.
    notepad .env
) else (
    echo ✅ .env file already exists
)
echo.

echo [4/4] Testing database connection...
python -c "from config.database import db_manager; print('✅ Database connected' if db_manager.test_connection() else '❌ Database connection failed')"
echo.

echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo To run the application:
echo   python main.py
echo.
pause






