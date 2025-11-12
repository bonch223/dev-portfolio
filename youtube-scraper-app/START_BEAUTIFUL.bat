@echo off
title Beautiful Enhanced YouTube Scraper
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           🎓 Beautiful Enhanced YouTube Scraper              ║
echo ║                                                              ║
echo ║  ✨ Modern GUI with beautiful styling                       ║
echo ║  🎯 Difficulty-specific scraping (Beginner/Intermediate/Advanced) ║
echo ║  📊 Advanced quality scoring and smart filtering            ║
echo ║  📈 Real-time progress tracking with detailed logs          ║
echo ║  🎨 Beautiful color-coded database viewer                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting beautiful enhanced scraper...
echo.

cd /d "%~dp0"

python beautiful_gui.py

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
    echo ✅ Beautiful scraper closed successfully!
    echo.
    pause
)




