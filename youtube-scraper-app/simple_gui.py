#!/usr/bin/env python3
"""Simple working GUI for YouTube Scraper."""

import sys
import logging
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, 
    QLabel, QPushButton, QTextEdit, QMessageBox, QTabWidget,
    QProgressBar, QComboBox, QSpinBox, QHBoxLayout
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QFont
from config.database import db_manager
from scrapers.scraper_orchestrator import ScraperOrchestrator

# Setup simple logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class ScrapingWorker(QThread):
    """Worker thread for scraping operations."""
    
    progress_update = pyqtSignal(int, int, str, int)  # completed, total, term, videos_found
    finished = pyqtSignal(bool, str)  # success, message
    
    def __init__(self, tool_name, max_videos_per_term=50):
        super().__init__()
        self.tool_name = tool_name
        self.max_videos_per_term = max_videos_per_term
        self.orchestrator = ScraperOrchestrator()
    
    def run(self):
        """Run scraping in background thread."""
        try:
            self.orchestrator.scrape_tool(
                self.tool_name, 
                max_videos_per_term=self.max_videos_per_term,
                progress_callback=self.progress_update.emit
            )
            self.finished.emit(True, f"✅ Scraping completed for {self.tool_name}!")
        except Exception as e:
            self.finished.emit(False, f"❌ Scraping failed: {e}")


class SimpleScraperGUI(QMainWindow):
    """Simple GUI that actually works."""
    
    def __init__(self):
        super().__init__()
        self.scraping_worker = None
        self.init_ui()
        self.check_database()
    
    def init_ui(self):
        """Initialize the user interface."""
        self.setWindowTitle("YouTube Scraper - Simple Version")
        self.setGeometry(100, 100, 800, 600)
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        layout = QVBoxLayout(central_widget)
        
        # Header
        title = QLabel("🚀 YouTube Automation Tools Scraper")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title.setFont(title_font)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        # Status
        self.status_label = QLabel("Status: Checking database...")
        layout.addWidget(self.status_label)
        
        # Database info
        self.db_info = QLabel("Database: Loading...")
        layout.addWidget(self.db_info)
        
        # Buttons
        button_layout = QVBoxLayout()
        
        self.view_db_btn = QPushButton("📊 View Database")
        self.view_db_btn.clicked.connect(self.view_database)
        self.view_db_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 15px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
        """)
        button_layout.addWidget(self.view_db_btn)
        
        # Scraping controls
        scraping_layout = QHBoxLayout()
        
        self.tool_combo = QComboBox()
        self.tool_combo.addItems(["zapier", "n8n"])
        self.tool_combo.setStyleSheet("padding: 10px; font-size: 14px;")
        scraping_layout.addWidget(QLabel("Tool:"))
        scraping_layout.addWidget(self.tool_combo)
        
        self.max_videos_spin = QSpinBox()
        self.max_videos_spin.setRange(10, 200)
        self.max_videos_spin.setValue(50)
        self.max_videos_spin.setStyleSheet("padding: 10px; font-size: 14px;")
        scraping_layout.addWidget(QLabel("Max videos per term:"))
        scraping_layout.addWidget(self.max_videos_spin)
        
        button_layout.addLayout(scraping_layout)
        
        self.scrape_btn = QPushButton("🚀 Start Scraping (NO API NEEDED!)")
        self.scrape_btn.clicked.connect(self.start_scraping)
        self.scrape_btn.setStyleSheet("""
            QPushButton {
                background-color: #FF9800;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 15px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #F57C00;
            }
            QPushButton:disabled {
                background-color: #CCCCCC;
                color: #666666;
            }
        """)
        button_layout.addWidget(self.scrape_btn)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        button_layout.addWidget(self.progress_bar)
        
        self.test_btn = QPushButton("🔧 Test Database Connection")
        self.test_btn.clicked.connect(self.test_database)
        self.test_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 15px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #0b7dda;
            }
        """)
        button_layout.addWidget(self.test_btn)
        
        layout.addLayout(button_layout)
        
        # Log area
        log_label = QLabel("Activity Log:")
        layout.addWidget(log_label)
        
        self.log_text = QTextEdit()
        self.log_text.setMaximumHeight(200)
        self.log_text.setReadOnly(True)
        layout.addWidget(self.log_text)
        
        # Add initial log
        self.add_log("Application started successfully!")
        self.add_log("Ready to use!")
        self.add_log("🎓 Using yt-dlp to find REAL YouTube videos (NO API key needed!)")
        self.add_log("📺 Videos will be REAL YouTube content for learners!")
    
    def check_database(self):
        """Check database connection and show stats."""
        try:
            if db_manager.test_connection():
                self.status_label.setText("Status: ✅ Connected to database")
                self.status_label.setStyleSheet("color: green")
                
                # Get video count
                stats = db_manager.get_statistics()
                total_videos = sum(row['count'] for row in stats.get('total', []))
                
                self.db_info.setText(f"Database: ✅ Connected | Videos: {total_videos}")
                self.db_info.setStyleSheet("color: green")
                
                self.add_log("✅ Database connection successful!")
                self.add_log(f"📊 Total videos in database: {total_videos}")
                
            else:
                self.status_label.setText("Status: ❌ Database connection failed")
                self.status_label.setStyleSheet("color: red")
                self.db_info.setText("Database: ❌ Connection failed")
                self.db_info.setStyleSheet("color: red")
                self.add_log("❌ Database connection failed!")
                
        except Exception as e:
            self.status_label.setText(f"Status: ❌ Error - {str(e)}")
            self.status_label.setStyleSheet("color: red")
            self.add_log(f"❌ Error: {e}")
    
    def test_database(self):
        """Test database connection."""
        try:
            if db_manager.test_connection():
                QMessageBox.information(self, "Success", "✅ Database connection is working!")
                self.add_log("✅ Database test successful!")
            else:
                QMessageBox.warning(self, "Error", "❌ Database connection failed!")
                self.add_log("❌ Database test failed!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"❌ Database error: {e}")
            self.add_log(f"❌ Database test error: {e}")
    
    def view_database(self):
        """Show database viewer."""
        try:
            videos = db_manager.get_videos(limit=100)
            
            if videos:
                # Create simple viewer
                self.viewer = QMainWindow()
                self.viewer.setWindowTitle("Database Viewer - Close to Return")
                self.viewer.setGeometry(150, 150, 1000, 700)
                
                # Make it a modal dialog so it stays open
                self.viewer.setWindowModality(Qt.WindowModality.WindowModal)
                
                central = QWidget()
                self.viewer.setCentralWidget(central)
                layout = QVBoxLayout(central)
                
                # Header with close button
                header_layout = QHBoxLayout()
                
                header = QLabel(f"📊 Found {len(videos)} videos in database")
                header_font = QFont()
                header_font.setPointSize(16)
                header_font.setBold(True)
                header.setFont(header_font)
                header_layout.addWidget(header)
                
                header_layout.addStretch()
                
                close_btn = QPushButton("✕ Close")
                close_btn.clicked.connect(self.viewer.close)
                close_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #f44336;
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                        padding: 8px 15px;
                        border-radius: 3px;
                    }
                    QPushButton:hover {
                        background-color: #d32f2f;
                    }
                """)
                header_layout.addWidget(close_btn)
                
                layout.addLayout(header_layout)
                
                # Stats
                stats = QLabel(f"Showing first 50 videos | Tool filter: All | Total in DB: {len(videos)}")
                stats.setStyleSheet("color: #666; font-size: 12px; margin-bottom: 10px;")
                layout.addWidget(stats)
                
                # Video list
                video_text = QTextEdit()
                video_text.setReadOnly(True)
                video_text.setStyleSheet("""
                    QTextEdit {
                        font-family: 'Consolas', 'Courier New', monospace;
                        font-size: 11px;
                        line-height: 1.4;
                    }
                """)
                
                for i, video in enumerate(videos[:50], 1):  # Show first 50
                    title = video['title'][:80] + "..." if len(video['title']) > 80 else video['title']
                    tool = video.get('tool', 'Unknown')
                    difficulty = video.get('difficulty', 'Unknown')
                    views = video.get('view_count', 0)
                    duration = video.get('duration_seconds', 0)
                    
                    # Format duration
                    if duration:
                        minutes = duration // 60
                        seconds = duration % 60
                        duration_str = f"{minutes}:{seconds:02d}"
                    else:
                        duration_str = "Unknown"
                    
                    # Format views
                    if views > 1000000:
                        views_str = f"{views/1000000:.1f}M"
                    elif views > 1000:
                        views_str = f"{views/1000:.1f}K"
                    else:
                        views_str = str(views)
                    
                    video_text.append(f"{i:2d}. {title}")
                    video_text.append(f"    🔧 Tool: {tool} | 📊 Difficulty: {difficulty} | 👀 Views: {views_str} | ⏱️ Duration: {duration_str}")
                    video_text.append("")
                
                if len(videos) > 50:
                    video_text.append(f"... and {len(videos) - 50} more videos in database")
                    video_text.append("(Use filtering in main app to see more)")
                
                layout.addWidget(video_text)
                
                # Show the viewer
                self.viewer.show()
                self.viewer.raise_()  # Bring to front
                self.viewer.activateWindow()  # Focus
                
                self.add_log(f"📊 Opened database viewer with {len(videos)} videos")
                
            else:
                QMessageBox.information(self, "No Videos", "No videos found in database.")
                self.add_log("📊 No videos found in database")
                
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load videos: {e}")
            self.add_log(f"❌ Error loading videos: {e}")
    
    def start_scraping(self):
        """Start scraping process."""
        if self.scraping_worker and self.scraping_worker.isRunning():
            QMessageBox.warning(self, "Already Running", "Scraping is already in progress!")
            return
        
        tool_name = self.tool_combo.currentText()
        max_videos = self.max_videos_spin.value()
        
        self.add_log(f"🚀 Starting web scraping for {tool_name} (max {max_videos} videos per term)")
        self.add_log("🌐 Using web scraping - no YouTube API key required!")
        
        # Start worker thread
        self.scraping_worker = ScrapingWorker(tool_name, max_videos)
        self.scraping_worker.progress_update.connect(self.update_progress)
        self.scraping_worker.finished.connect(self.scraping_finished)
        
        # Update UI
        self.scrape_btn.setEnabled(False)
        self.scrape_btn.setText("🔄 Scraping in progress...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        
        self.scraping_worker.start()
    
    def update_progress(self, completed, total, term, videos_found):
        """Update progress bar and log."""
        progress = int((completed / total) * 100)
        self.progress_bar.setValue(progress)
        self.add_log(f"✅ [{completed}/{total}] '{term}': {videos_found} videos")
    
    def scraping_finished(self, success, message):
        """Handle scraping completion."""
        self.scrape_btn.setEnabled(True)
        self.scrape_btn.setText("🚀 Start Scraping (NO API NEEDED!)")
        self.progress_bar.setVisible(False)
        
        self.add_log(message)
        
        if success:
            QMessageBox.information(self, "Success", message)
            # Refresh database info
            self.check_database()
        else:
            QMessageBox.critical(self, "Error", message)
    
    def add_log(self, message):
        """Add message to log."""
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.append(f"[{timestamp}] {message}")

def main():
    """Main entry point."""
    try:
        print("Starting simple GUI...")
        
        # Initialize database
        print("Initializing database...")
        if not db_manager.initialize_pool():
            print("❌ Failed to initialize database pool")
            return False
        
        # Create Qt application
        app = QApplication(sys.argv)
        app.setStyle('Fusion')
        
        # Create and show main window
        window = SimpleScraperGUI()
        window.show()
        
        print("✅ GUI started successfully!")
        
        # Run application
        return app.exec()
        
    except Exception as e:
        print(f"❌ Error starting GUI: {e}")
        return False
    finally:
        try:
            db_manager.close_pool()
        except:
            pass

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code if exit_code else 0)
