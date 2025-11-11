@echo off
title Compact Enhanced YouTube Scraper
color 0A

echo.
echo ============================================
echo    Compact Enhanced YouTube Scraper
echo ============================================
echo.
echo 🎯 Smaller, more efficient interface
echo 📊 Same powerful scraping features
echo 📈 Real-time progress and logs
echo.
echo Starting compact scraper...
echo.

cd /d "%~dp0"

python compact_gui.py

if errorlevel 1 (
    echo.
    echo ❌ Error occurred!
    echo.
    echo Make sure you have:
    echo   ✅ Python 3.8+ installed
    echo   ✅ Dependencies installed: pip install -r requirements.txt
    echo   ✅ Database configured in .env file
    echo.
    echo Press any key to exit...
    pause >nul
) else (
    echo.
    echo ✅ Compact scraper closed successfully!
    echo.
    pause
)



