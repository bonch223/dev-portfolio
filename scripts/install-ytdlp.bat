@echo off
echo Installing yt-dlp for YouTube scraping...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    echo Please install Python from https://python.org
    echo Then run: pip install yt-dlp
    pause
    exit /b 1
)

echo Installing yt-dlp...
pip install yt-dlp

if errorlevel 1 (
    echo ERROR: Failed to install yt-dlp
    pause
    exit /b 1
)

echo.
echo yt-dlp installed successfully!
echo You can now run: npm run scrape-videos
echo.
pause
