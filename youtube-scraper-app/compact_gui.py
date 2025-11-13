"""
Compact Enhanced YouTube Scraper GUI - Smaller and more efficient.
"""

import sys
import logging
from datetime import datetime
from PyQt6.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
                            QWidget, QPushButton, QLabel, QComboBox, QSpinBox,
                            QProgressBar, QTextEdit, QGroupBox, QGridLayout,
                            QMessageBox, QTabWidget, QTableWidget, QTableWidgetItem,
                            QHeaderView)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QFont

from scrapers.enhanced_orchestrator import EnhancedScraperOrchestrator
from config.database import db_manager
from utils.logger import setup_logger as setup_logging

logger = logging.getLogger(__name__)


class CompactScrapingWorker(QThread):
    """Worker thread for compact scraping operations."""
    
    progress_updated = pyqtSignal(str, int, int)
    scraping_completed = pyqtSignal(bool, str)
    log_message = pyqtSignal(str)
    
    def __init__(self, tool_name, difficulty, max_videos):
        super().__init__()
        self.tool_name = tool_name
        self.difficulty = difficulty
        self.max_videos = max_videos
        self.orchestrator = EnhancedScraperOrchestrator()
    
    def run(self):
        """Run the scraping operation."""
        try:
            self.log_message.emit(f"🚀 Starting {self.difficulty} scraping for {self.tool_name}")
            
            def progress_callback(message, current, total):
                self.progress_updated.emit(message, current, total)
            
            success = self.orchestrator.scrape_difficulty_specific(
                self.tool_name, self.difficulty, self.max_videos, progress_callback
            )
            
            if success:
                self.scraping_completed.emit(True, f"✅ Successfully scraped {self.max_videos} {self.difficulty} videos for {self.tool_name}")
            else:
                self.scraping_completed.emit(False, f"❌ Failed to scrape {self.difficulty} videos for {self.tool_name}")
                
        except Exception as e:
            self.log_message.emit(f"❌ Scraping error: {e}")
            self.scraping_completed.emit(False, f"❌ Scraping failed: {e}")


class CompactScraperGUI(QMainWindow):
    """Compact Enhanced GUI for the YouTube scraper."""
    
    def __init__(self):
        super().__init__()
        self.scraping_worker = None
        self.orchestrator = EnhancedScraperOrchestrator()
        
        self.init_ui()
        self.check_database()
        self.add_log("🎓 Compact Enhanced YouTube Scraper started!")
        self.add_log("📺 Ready to scrape high-quality educational videos!")
    
    def init_ui(self):
        """Initialize the compact UI."""
        self.setWindowTitle("🎓 Compact YouTube Scraper")
        self.setGeometry(100, 100, 800, 600)  # Smaller window
        
        # Create central widget with tabs
        central_widget = QTabWidget()
        self.setCentralWidget(central_widget)
        
        # Scraping tab
        scraping_tab = self.create_scraping_tab()
        central_widget.addTab(scraping_tab, "🎯 Scraping")
        
        # Database tab
        database_tab = self.create_database_tab()
        central_widget.addTab(database_tab, "📊 Database")
        
        # Log tab
        log_tab = self.create_log_tab()
        central_widget.addTab(log_tab, "📋 Log")
    
    def create_scraping_tab(self):
        """Create the compact scraping control tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(10)
        
        # Database status
        db_group = QGroupBox("Database Status")
        db_layout = QVBoxLayout()
        
        self.db_status_label = QLabel("🔍 Checking database connection...")
        self.test_db_button = QPushButton("Test Connection")
        self.test_db_button.clicked.connect(self.check_database)
        
        db_layout.addWidget(self.db_status_label)
        db_layout.addWidget(self.test_db_button)
        db_group.setLayout(db_layout)
        
        # Scraping controls
        scraping_group = QGroupBox("Scraping Controls")
        scraping_layout = QGridLayout()
        
        # Tool selection
        scraping_layout.addWidget(QLabel("Tool:"), 0, 0)
        self.tool_combo = QComboBox()
        self.tool_combo.addItems(['zapier', 'n8n', 'make', 'power-automate'])
        scraping_layout.addWidget(self.tool_combo, 0, 1)
        
        # Difficulty selection
        scraping_layout.addWidget(QLabel("Difficulty:"), 1, 0)
        self.difficulty_combo = QComboBox()
        self.difficulty_combo.addItems(['beginner', 'intermediate', 'advanced'])
        scraping_layout.addWidget(self.difficulty_combo, 1, 1)
        
        # Max videos
        scraping_layout.addWidget(QLabel("Max Videos:"), 2, 0)
        self.max_videos_spin = QSpinBox()
        self.max_videos_spin.setRange(1, 50)
        self.max_videos_spin.setValue(5)
        scraping_layout.addWidget(self.max_videos_spin, 2, 1)
        
        # Buttons
        self.start_scraping_button = QPushButton("🚀 Start Scraping")
        self.start_scraping_button.clicked.connect(self.start_scraping)
        
        self.stop_scraping_button = QPushButton("⏹️ Stop")
        self.stop_scraping_button.clicked.connect(self.stop_scraping)
        self.stop_scraping_button.setEnabled(False)
        
        scraping_layout.addWidget(self.start_scraping_button, 3, 0)
        scraping_layout.addWidget(self.stop_scraping_button, 3, 1)
        
        scraping_group.setLayout(scraping_layout)
        
        # Progress
        progress_group = QGroupBox("Progress")
        progress_layout = QVBoxLayout()
        
        self.progress_bar = QProgressBar()
        self.progress_label = QLabel("Ready to scrape...")
        
        progress_layout.addWidget(self.progress_label)
        progress_layout.addWidget(self.progress_bar)
        
        progress_group.setLayout(progress_layout)
        
        # Quick actions
        quick_group = QGroupBox("Quick Actions")
        quick_layout = QHBoxLayout()
        
        self.scrape_beginner_button = QPushButton("🎯 5 Beginner")
        self.scrape_beginner_button.clicked.connect(lambda: self.quick_scrape('beginner', 5))
        
        self.scrape_intermediate_button = QPushButton("⚡ 10 Intermediate")
        self.scrape_intermediate_button.clicked.connect(lambda: self.quick_scrape('intermediate', 10))
        
        self.scrape_advanced_button = QPushButton("🔥 8 Advanced")
        self.scrape_advanced_button.clicked.connect(lambda: self.quick_scrape('advanced', 8))
        
        quick_layout.addWidget(self.scrape_beginner_button)
        quick_layout.addWidget(self.scrape_intermediate_button)
        quick_layout.addWidget(self.scrape_advanced_button)
        
        quick_group.setLayout(quick_layout)
        
        # Add to main layout
        layout.addWidget(db_group)
        layout.addWidget(scraping_group)
        layout.addWidget(progress_group)
        layout.addWidget(quick_group)
        
        widget.setLayout(layout)
        return widget
    
    def create_database_tab(self):
        """Create the compact database viewer tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        
        # Controls
        controls_layout = QHBoxLayout()
        
        self.tool_filter = QComboBox()
        self.tool_filter.addItems(['All Tools', 'zapier', 'n8n', 'make', 'power-automate'])
        self.tool_filter.currentTextChanged.connect(self.load_database_data)
        
        self.difficulty_filter = QComboBox()
        self.difficulty_filter.addItems(['All Levels', 'beginner', 'intermediate', 'advanced'])
        self.difficulty_filter.currentTextChanged.connect(self.load_database_data)
        
        self.refresh_button = QPushButton("🔄 Refresh")
        self.refresh_button.clicked.connect(self.load_database_data)
        
        controls_layout.addWidget(QLabel("Tool:"))
        controls_layout.addWidget(self.tool_filter)
        controls_layout.addWidget(QLabel("Difficulty:"))
        controls_layout.addWidget(self.difficulty_filter)
        controls_layout.addWidget(self.refresh_button)
        controls_layout.addStretch()
        
        # Statistics
        self.stats_label = QLabel("📊 Loading statistics...")
        
        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(6)  # Reduced columns
        self.table.setHorizontalHeaderLabels([
            'Title', 'Channel', 'Difficulty', 'Tool', 'Quality', 'Views'
        ])
        
        # Configure table
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)  # Title
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)  # Channel
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)  # Difficulty
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)  # Tool
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)  # Quality
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)  # Views
        
        layout.addLayout(controls_layout)
        layout.addWidget(self.stats_label)
        layout.addWidget(self.table)
        
        widget.setLayout(layout)
        return widget
    
    def create_log_tab(self):
        """Create the compact log tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        
        # Log display
        self.log_display = QTextEdit()
        self.log_display.setReadOnly(True)
        self.log_display.setFont(QFont("Consolas", 9))
        self.log_display.setMaximumHeight(400)  # Limit height
        
        # Clear log button
        clear_button = QPushButton("🗑️ Clear Log")
        clear_button.clicked.connect(self.log_display.clear)
        
        layout.addWidget(QLabel("📋 Activity Log:"))
        layout.addWidget(self.log_display)
        layout.addWidget(clear_button)
        
        widget.setLayout(layout)
        return widget
    
    def check_database(self):
        """Check database connection."""
        try:
            conn = db_manager.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM scraped_videos")
            count = cursor.fetchone()[0]
            cursor.close()
            db_manager.return_connection(conn)
            
            self.db_status_label.setText(f"✅ Database connected! {count} videos available")
            self.add_log(f"✅ Database connection successful ({count} videos)")
            
        except Exception as e:
            self.db_status_label.setText(f"❌ Database error: {e}")
            self.add_log(f"❌ Database error: {e}")
    
    def load_database_data(self):
        """Load and display database data."""
        try:
            conn = db_manager.get_connection()
            cursor = conn.cursor()
            
            # Build query based on filters
            tool_filter = self.tool_filter.currentText()
            difficulty_filter = self.difficulty_filter.currentText()
            
            where_conditions = []
            params = []
            
            if tool_filter != 'All Tools':
                where_conditions.append("tool = %s")
                params.append(tool_filter)
            
            if difficulty_filter != 'All Levels':
                where_conditions.append("difficulty = %s")
                params.append(difficulty_filter)
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Get statistics
            stats_query = f"""
                SELECT COUNT(*) as total, AVG(quality_score) as avg_quality
                FROM scraped_videos 
                {where_clause}
            """
            cursor.execute(stats_query, params)
            stats_result = cursor.fetchone()
            
            total_videos = stats_result[0] if stats_result else 0
            avg_quality = stats_result[1] if stats_result and stats_result[1] else 0
            
            self.stats_label.setText(f"📊 {total_videos} videos | Average Quality: {avg_quality:.1f}")
            
            # Get videos
            videos_query = f"""
                SELECT title, channel, difficulty, tool, quality_score, view_count
                FROM scraped_videos 
                {where_clause}
                ORDER BY quality_score DESC, view_count DESC
                LIMIT 50
            """
            cursor.execute(videos_query, params)
            videos = cursor.fetchall()
            
            # Populate table
            self.table.setRowCount(len(videos))
            
            for row, video in enumerate(videos):
                title, channel, difficulty, tool, quality_score, view_count = video
                
                # Format data
                formatted_views = f"{view_count:,}" if view_count else "N/A"
                
                # Add items to table
                self.table.setItem(row, 0, QTableWidgetItem(title))
                self.table.setItem(row, 1, QTableWidgetItem(channel))
                self.table.setItem(row, 2, QTableWidgetItem(difficulty))
                self.table.setItem(row, 3, QTableWidgetItem(tool))
                self.table.setItem(row, 4, QTableWidgetItem(f"{quality_score:.1f}"))
                self.table.setItem(row, 5, QTableWidgetItem(formatted_views))
            
            cursor.close()
            db_manager.return_connection(conn)
            
        except Exception as e:
            self.stats_label.setText(f"❌ Error loading data: {e}")
            logger.error(f"Database viewer error: {e}")
    
    def start_scraping(self):
        """Start scraping operation."""
        tool_name = self.tool_combo.currentText()
        difficulty = self.difficulty_combo.currentText()
        max_videos = self.max_videos_spin.value()
        
        if self.scraping_worker and self.scraping_worker.isRunning():
            QMessageBox.warning(self, "Warning", "Scraping is already in progress!")
            return
        
        # Disable controls
        self.start_scraping_button.setEnabled(False)
        self.stop_scraping_button.setEnabled(True)
        self.progress_bar.setValue(0)
        
        # Start worker thread
        self.scraping_worker = CompactScrapingWorker(tool_name, difficulty, max_videos)
        self.scraping_worker.progress_updated.connect(self.update_progress)
        self.scraping_worker.scraping_completed.connect(self.scraping_finished)
        self.scraping_worker.log_message.connect(self.add_log)
        self.scraping_worker.start()
    
    def quick_scrape(self, difficulty, max_videos):
        """Quick scrape for specific difficulty."""
        tool_name = self.tool_combo.currentText()
        
        self.difficulty_combo.setCurrentText(difficulty)
        self.max_videos_spin.setValue(max_videos)
        
        self.add_log(f"🎯 Quick scrape: {max_videos} {difficulty} videos for {tool_name}")
        self.start_scraping()
    
    def stop_scraping(self):
        """Stop the current scraping operation."""
        if self.scraping_worker and self.scraping_worker.isRunning():
            self.scraping_worker.terminate()
            self.scraping_worker.wait()
            self.add_log("⏹️ Scraping stopped by user")
            self.scraping_finished(False, "Stopped by user")
    
    def update_progress(self, message, current, total):
        """Update progress display."""
        self.progress_label.setText(message)
        if total > 0:
            progress = int((current / total) * 100)
            self.progress_bar.setValue(progress)
    
    def scraping_finished(self, success, message):
        """Handle scraping completion."""
        self.start_scraping_button.setEnabled(True)
        self.stop_scraping_button.setEnabled(False)
        self.progress_bar.setValue(100)
        
        self.add_log(message)
        
        if success:
            self.progress_label.setText("✅ Scraping completed successfully!")
            # Refresh database viewer
            self.load_database_data()
        else:
            self.progress_label.setText("❌ Scraping failed!")
    
    def add_log(self, message):
        """Add message to log display."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        self.log_display.append(log_message)
        self.log_display.ensureCursorVisible()
        
        # Also log to file
        logger.info(message)


def main():
    """Main application entry point."""
    setup_logging()
    
    app = QApplication(sys.argv)
    app.setApplicationName("Compact Enhanced YouTube Scraper")
    
    window = CompactScraperGUI()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()





