"""Main entry point for YouTube Scraper Application."""

import sys
import logging
from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow
from utils.logger import setup_logger
from config.database import db_manager

# Setup logging
logger = setup_logger('scraper')


def main():
    """Main application entry point."""
    logger.info("=" * 60)
    logger.info("🚀 YouTube Automation Tools Scraper - Fast Edition")
    logger.info("=" * 60)
    logger.info("Starting application...")
    
    # Initialize database connection pool
    logger.info("Initializing database connection pool...")
    if db_manager.initialize_pool(minconn=2, maxconn=10):
        logger.info("✅ Database pool initialized successfully")
    else:
        logger.error("❌ Failed to initialize database pool")
    
    # Create Qt application
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # Modern look
    
    # Create and show main window
    window = MainWindow()
    window.show()
    
    logger.info("✅ Application started successfully")
    
    # Run application
    exit_code = app.exec()
    
    # Cleanup
    logger.info("Shutting down application...")
    db_manager.close_pool()
    logger.info("👋 Goodbye!")
    
    sys.exit(exit_code)


if __name__ == '__main__':
    main()





