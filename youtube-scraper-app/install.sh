#!/bin/bash

echo "=========================================="
echo "YouTube Scraper - Installation Script"
echo "=========================================="
echo

echo "[1/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: Python not found! Please install Python 3.11+"
    exit 1
fi
python3 --version
echo "✅ Python found"
echo

echo "[2/4] Installing dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo

echo "[3/4] Setting up environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file"
    echo
    echo "⚠️  IMPORTANT: Edit .env file with your:"
    echo "   - Database credentials"
    echo "   - YouTube API key(s)"
    echo
    read -p "Press Enter to open .env file..."
    ${EDITOR:-nano} .env
else
    echo "✅ .env file already exists"
fi
echo

echo "[4/4] Testing database connection..."
python3 -c "from config.database import db_manager; print('✅ Database connected' if db_manager.test_connection() else '❌ Database connection failed')"
echo

echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo
echo "To run the application:"
echo "  python3 main.py"
echo

# Make the script executable
chmod +x main.py






