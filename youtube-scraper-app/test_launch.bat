@echo off
cd /d "%~dp0"
echo ============================================
echo YouTube Scraper - Diagnostic Test
echo ============================================
echo.

echo [1/4] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python or add it to PATH
    pause
    exit /b 1
)
echo OK
echo.

echo [2/4] Checking dependencies...
python -c "import PyQt6.QtWidgets; print('PyQt6: OK')"
if errorlevel 1 (
    echo ERROR: PyQt6 not installed!
    echo Run: pip install -r requirements.txt
    pause
    exit /b 1
)
echo OK
echo.

echo [3/4] Checking database connection...
python -c "from config.database import db_manager; db_manager.test_connection()"
if errorlevel 1 (
    echo ERROR: Database connection failed!
    echo Check your .env file
    pause
    exit /b 1
)
echo OK
echo.

echo [4/4] Testing yt-dlp...
python -c "import yt_dlp; print('yt-dlp:', yt_dlp.version.__version__)"
if errorlevel 1 (
    echo ERROR: yt-dlp not installed!
    echo Run: pip install -r requirements.txt
    pause
    exit /b 1
)
echo OK
echo.

echo ============================================
echo All checks passed!
echo ============================================
echo.
echo Ready to launch?
pause

python main.pyw

