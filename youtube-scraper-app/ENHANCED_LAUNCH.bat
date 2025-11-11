@echo off
echo ============================================
echo Enhanced YouTube Scraper
echo ============================================
echo.
echo Starting enhanced scraper with difficulty-specific controls...
echo.

cd /d "%~dp0"
python enhanced_gui.py

if errorlevel 1 (
    echo.
    echo Error occurred. Make sure Python and dependencies are installed.
    echo Run: pip install -r requirements.txt
    pause
)



