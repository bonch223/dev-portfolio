@echo off
title Enhanced YouTube Scraper
color 0A

echo.
echo ============================================
echo    Enhanced YouTube Scraper
echo ============================================
echo.
echo 🎯 Difficulty-Specific Scraping
echo 📊 Advanced Quality Scoring  
echo 🧠 Smart Filtering
echo 📈 Real-time Progress
echo.
echo Starting enhanced scraper...
echo.

cd /d "%~dp0"

python enhanced_gui.py

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
    echo ✅ Enhanced scraper closed successfully!
    echo.
    pause
)



