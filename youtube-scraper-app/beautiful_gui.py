"""
Beautiful Enhanced YouTube Scraper GUI with modern styling.
"""

import sys
import logging
from datetime import datetime
from PyQt6.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
                            QWidget, QPushButton, QLabel, QComboBox, QSpinBox,
                            QProgressBar, QTextEdit, QGroupBox, QGridLayout,
                            QMessageBox, QTabWidget, QTableWidget, QTableWidgetItem,
                            QHeaderView, QSplitter, QFrame, QScrollArea)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QIcon, QPalette, QColor

from scrapers.enhanced_orchestrator import EnhancedScraperOrchestrator
from config.database import db_manager
from utils.logger import setup_logger as setup_logging

logger = logging.getLogger(__name__)


class BeautifulScrapingWorker(QThread):
    """Worker thread for beautiful scraping operations."""
    
    progress_updated = pyqtSignal(str, int, int)  # message, current, total
    scraping_completed = pyqtSignal(bool, str)  # success, message
    log_message = pyqtSignal(str)  # log message
    
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
                self.tool_name, 
                self.difficulty, 
                self.max_videos,
                progress_callback
            )
            
            if success:
                self.scraping_completed.emit(True, f"✅ Successfully scraped {self.max_videos} {self.difficulty} videos for {self.tool_name}")
            else:
                self.scraping_completed.emit(False, f"❌ Failed to scrape {self.difficulty} videos for {self.tool_name}")
                
        except Exception as e:
            self.log_message.emit(f"❌ Scraping error: {e}")
            self.scraping_completed.emit(False, f"❌ Scraping failed: {e}")


class BeautifulDatabaseViewer(QWidget):
    """Beautiful database viewer widget."""
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.load_data()
    
    def init_ui(self):
        """Initialize the beautiful database viewer UI."""
        layout = QVBoxLayout()
        layout.setSpacing(20)
        
        # Header
        header = QLabel("📊 Video Database")
        header.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        header.setStyleSheet("color: #2c3e50; margin-bottom: 10px;")
        layout.addWidget(header)
        
        # Controls with modern styling
        controls_frame = QFrame()
        controls_frame.setFrameStyle(QFrame.Shape.Box)
        controls_frame.setStyleSheet("""
            QFrame {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        controls_layout = QHBoxLayout(controls_frame)
        
        # Tool filter
        controls_layout.addWidget(QLabel("🔧 Tool:"))
        self.tool_filter = QComboBox()
        self.tool_filter.addItems(['All Tools', 'zapier', 'n8n', 'make', 'power-automate'])
        self.tool_filter.setStyleSheet("""
            QComboBox {
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background-color: white;
                font-size: 14px;
            }
            QComboBox:hover {
                border-color: #007bff;
            }
        """)
        self.tool_filter.currentTextChanged.connect(self.load_data)
        
        # Difficulty filter
        controls_layout.addWidget(QLabel("📚 Difficulty:"))
        self.difficulty_filter = QComboBox()
        self.difficulty_filter.addItems(['All Levels', 'beginner', 'intermediate', 'advanced'])
        self.difficulty_filter.setStyleSheet("""
            QComboBox {
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background-color: white;
                font-size: 14px;
            }
            QComboBox:hover {
                border-color: #007bff;
            }
        """)
        self.difficulty_filter.currentTextChanged.connect(self.load_data)
        
        # Refresh button
        self.refresh_button = QPushButton("🔄 Refresh")
        self.refresh_button.setStyleSheet("""
            QPushButton {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
            QPushButton:pressed {
                background-color: #004085;
            }
        """)
        self.refresh_button.clicked.connect(self.load_data)
        
        controls_layout.addWidget(self.tool_filter)
        controls_layout.addWidget(self.difficulty_filter)
        controls_layout.addWidget(self.refresh_button)
        controls_layout.addStretch()
        
        layout.addWidget(controls_frame)
        
        # Statistics with beautiful styling
        self.stats_label = QLabel("📊 Loading statistics...")
        stats_font = QFont("Segoe UI", 12, QFont.Weight.Bold)
        self.stats_label.setFont(stats_font)
        self.stats_label.setStyleSheet("""
            QLabel {
                background-color: #e8f4fd;
                border: 2px solid #bee5eb;
                border-radius: 8px;
                padding: 15px;
                color: #0c5460;
            }
        """)
        layout.addWidget(self.stats_label)
        
        # Table with modern styling
        self.table = QTableWidget()
        self.table.setColumnCount(8)
        self.table.setHorizontalHeaderLabels([
            'Title', 'Channel', 'Difficulty', 'Tool', 'Quality Score', 
            'Views', 'Duration', 'Published'
        ])
        
        # Style the table
        self.table.setStyleSheet("""
            QTableWidget {
                gridline-color: #dee2e6;
                background-color: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
            }
            QHeaderView::section {
                background-color: #495057;
                color: white;
                padding: 12px;
                border: none;
                font-weight: bold;
            }
            QTableWidget::item {
                padding: 10px;
                border-bottom: 1px solid #f8f9fa;
            }
            QTableWidget::item:selected {
                background-color: #cce5ff;
            }
        """)
        
        # Configure table
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)  # Title
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)  # Channel
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)  # Difficulty
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)  # Tool
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)  # Quality
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)  # Views
        header.setSectionResizeMode(6, QHeaderView.ResizeMode.ResizeToContents)  # Duration
        header.setSectionResizeMode(7, QHeaderView.ResizeMode.ResizeToContents)  # Published
        
        layout.addWidget(self.table)
        
        self.setLayout(layout)
    
    def load_data(self):
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
            
            # Beautiful statistics display
            self.stats_label.setText(f"📊 {total_videos} videos | Average Quality: {avg_quality:.1f} | Filtered by: {tool_filter} + {difficulty_filter}")
            
            # Get videos
            videos_query = f"""
                SELECT title, channel, difficulty, tool, quality_score, 
                       view_count, duration, published_at
                FROM scraped_videos 
                {where_clause}
                ORDER BY quality_score DESC, view_count DESC
                LIMIT 100
            """
            cursor.execute(videos_query, params)
            videos = cursor.fetchall()
            
            # Populate table
            self.table.setRowCount(len(videos))
            
            for row, video in enumerate(videos):
                title, channel, difficulty, tool, quality_score, view_count, duration, published_at = video
                
                # Format data
                formatted_views = f"{view_count:,}" if view_count else "N/A"
                formatted_duration = f"{duration // 60}:{duration % 60:02d}" if duration else "N/A"
                formatted_date = published_at.strftime("%Y-%m-%d") if published_at else "N/A"
                
                # Add items to table with colors
                self.table.setItem(row, 0, QTableWidgetItem(title))
                self.table.setItem(row, 1, QTableWidgetItem(channel))
                
                # Color-code difficulty
                difficulty_item = QTableWidgetItem(difficulty)
                if difficulty == 'beginner':
                    difficulty_item.setBackground(QColor("#d4edda"))
                elif difficulty == 'intermediate':
                    difficulty_item.setBackground(QColor("#fff3cd"))
                elif difficulty == 'advanced':
                    difficulty_item.setBackground(QColor("#f8d7da"))
                self.table.setItem(row, 2, difficulty_item)
                
                self.table.setItem(row, 3, QTableWidgetItem(tool))
                
                # Color-code quality score
                quality_item = QTableWidgetItem(f"{quality_score:.1f}")
                if quality_score >= 70:
                    quality_item.setBackground(QColor("#d4edda"))
                elif quality_score >= 50:
                    quality_item.setBackground(QColor("#fff3cd"))
                else:
                    quality_item.setBackground(QColor("#f8d7da"))
                self.table.setItem(row, 4, quality_item)
                
                self.table.setItem(row, 5, QTableWidgetItem(formatted_views))
                self.table.setItem(row, 6, QTableWidgetItem(formatted_duration))
                self.table.setItem(row, 7, QTableWidgetItem(formatted_date))
            
            cursor.close()
            db_manager.return_connection(conn)
            
        except Exception as e:
            self.stats_label.setText(f"❌ Error loading data: {e}")
            logger.error(f"Database viewer error: {e}")


class BeautifulScraperGUI(QMainWindow):
    """Beautiful Enhanced GUI for the YouTube scraper."""
    
    def __init__(self):
        super().__init__()
        self.scraping_worker = None
        self.orchestrator = EnhancedScraperOrchestrator()
        
        self.init_ui()
        self.apply_beautiful_styling()
        self.check_database()
        self.add_log("🎓 Beautiful Enhanced YouTube Scraper started!")
        self.add_log("📺 Ready to scrape high-quality educational videos!")
        self.add_log("🎯 Use Quick Actions for fast scraping!")
    
    def init_ui(self):
        """Initialize the beautiful UI."""
        self.setWindowTitle("🎓 Enhanced YouTube Scraper - Beautiful Edition")
        self.setGeometry(100, 100, 1400, 900)
        
        # Create central widget with tabs
        central_widget = QTabWidget()
        central_widget.setStyleSheet("""
            QTabWidget::pane {
                border: 1px solid #dee2e6;
                border-radius: 8px;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 12px 24px;
                margin-right: 2px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QTabBar::tab:selected {
                background-color: #007bff;
                color: white;
            }
            QTabBar::tab:hover {
                background-color: #e9ecef;
            }
        """)
        self.setCentralWidget(central_widget)
        
        # Scraping tab
        scraping_tab = self.create_beautiful_scraping_tab()
        central_widget.addTab(scraping_tab, "🎯 Scraping")
        
        # Database tab
        database_tab = BeautifulDatabaseViewer()
        central_widget.addTab(database_tab, "📊 Database")
        
        # Status tab
        status_tab = self.create_beautiful_status_tab()
        central_widget.addTab(status_tab, "📋 Activity Log")
    
    def create_beautiful_scraping_tab(self):
        """Create the beautiful scraping control tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(25)
        
        # Header
        header = QLabel("🎯 Enhanced Video Scraping")
        header.setFont(QFont("Segoe UI", 24, QFont.Weight.Bold))
        header.setStyleSheet("color: #2c3e50; margin-bottom: 20px;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(header)
        
        # Database status with beautiful styling
        db_frame = QFrame()
        db_frame.setFrameStyle(QFrame.Shape.Box)
        db_frame.setStyleSheet("""
            QFrame {
                background-color: #e8f4fd;
                border: 2px solid #bee5eb;
                border-radius: 12px;
                padding: 20px;
            }
        """)
        db_layout = QVBoxLayout(db_frame)
        
        db_title = QLabel("📊 Database Status")
        db_title.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        db_title.setStyleSheet("color: #0c5460;")
        db_layout.addWidget(db_title)
        
        self.db_status_label = QLabel("🔍 Checking database connection...")
        self.db_status_label.setStyleSheet("color: #0c5460; font-size: 14px;")
        
        self.test_db_button = QPushButton("🔧 Test Connection")
        self.test_db_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
        """)
        self.test_db_button.clicked.connect(self.check_database)
        
        db_layout.addWidget(self.db_status_label)
        db_layout.addWidget(self.test_db_button)
        layout.addWidget(db_frame)
        
        # Scraping controls with beautiful styling
        scraping_frame = QFrame()
        scraping_frame.setFrameStyle(QFrame.Shape.Box)
        scraping_frame.setStyleSheet("""
            QFrame {
                background-color: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 12px;
                padding: 20px;
            }
        """)
        scraping_layout = QVBoxLayout(scraping_frame)
        
        scraping_title = QLabel("⚙️ Scraping Controls")
        scraping_title.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        scraping_title.setStyleSheet("color: #495057;")
        scraping_layout.addWidget(scraping_title)
        
        # Controls grid
        controls_grid = QGridLayout()
        controls_grid.setSpacing(15)
        
        # Tool selection
        controls_grid.addWidget(QLabel("🔧 Tool:"), 0, 0)
        self.tool_combo = QComboBox()
        self.tool_combo.addItems(['zapier', 'n8n', 'make', 'power-automate'])
        self.tool_combo.setStyleSheet("""
            QComboBox {
                padding: 10px 15px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                background-color: white;
                font-size: 14px;
                min-width: 150px;
            }
            QComboBox:hover {
                border-color: #007bff;
            }
        """)
        controls_grid.addWidget(self.tool_combo, 0, 1)
        
        # Difficulty selection
        controls_grid.addWidget(QLabel("📚 Difficulty:"), 1, 0)
        self.difficulty_combo = QComboBox()
        self.difficulty_combo.addItems(['beginner', 'intermediate', 'advanced'])
        self.difficulty_combo.setStyleSheet("""
            QComboBox {
                padding: 10px 15px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                background-color: white;
                font-size: 14px;
                min-width: 150px;
            }
            QComboBox:hover {
                border-color: #007bff;
            }
        """)
        controls_grid.addWidget(self.difficulty_combo, 1, 1)
        
        # Max videos
        controls_grid.addWidget(QLabel("🎯 Max Videos:"), 2, 0)
        self.max_videos_spin = QSpinBox()
        self.max_videos_spin.setRange(1, 50)
        self.max_videos_spin.setValue(5)
        self.max_videos_spin.setStyleSheet("""
            QSpinBox {
                padding: 10px 15px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                background-color: white;
                font-size: 14px;
                min-width: 150px;
            }
            QSpinBox:hover {
                border-color: #007bff;
            }
        """)
        controls_grid.addWidget(self.max_videos_spin, 2, 1)
        
        scraping_layout.addLayout(controls_grid)
        
        # Action buttons
        button_layout = QHBoxLayout()
        
        self.start_scraping_button = QPushButton("🚀 Start Scraping")
        self.start_scraping_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                min-width: 150px;
            }
            QPushButton:hover {
                background-color: #218838;
            }
            QPushButton:pressed {
                background-color: #1e7e34;
            }
        """)
        self.start_scraping_button.clicked.connect(self.start_beautiful_scraping)
        
        self.stop_scraping_button = QPushButton("⏹️ Stop")
        self.stop_scraping_button.setStyleSheet("""
            QPushButton {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                min-width: 150px;
            }
            QPushButton:hover {
                background-color: #c82333;
            }
        """)
        self.stop_scraping_button.clicked.connect(self.stop_scraping)
        self.stop_scraping_button.setEnabled(False)
        
        button_layout.addWidget(self.start_scraping_button)
        button_layout.addWidget(self.stop_scraping_button)
        button_layout.addStretch()
        
        scraping_layout.addLayout(button_layout)
        layout.addWidget(scraping_frame)
        
        # Progress with beautiful styling
        progress_frame = QFrame()
        progress_frame.setFrameStyle(QFrame.Shape.Box)
        progress_frame.setStyleSheet("""
            QFrame {
                background-color: #fff3cd;
                border: 2px solid #ffeaa7;
                border-radius: 12px;
                padding: 20px;
            }
        """)
        progress_layout = QVBoxLayout(progress_frame)
        
        progress_title = QLabel("📈 Progress")
        progress_title.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        progress_title.setStyleSheet("color: #856404;")
        progress_layout.addWidget(progress_title)
        
        self.progress_label = QLabel("Ready to scrape...")
        self.progress_label.setStyleSheet("color: #856404; font-size: 14px;")
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #ffeaa7;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                background-color: white;
            }
            QProgressBar::chunk {
                background-color: #007bff;
                border-radius: 6px;
            }
        """)
        
        progress_layout.addWidget(self.progress_label)
        progress_layout.addWidget(self.progress_bar)
        layout.addWidget(progress_frame)
        
        # Quick actions with beautiful styling
        quick_frame = QFrame()
        quick_frame.setFrameStyle(QFrame.Shape.Box)
        quick_frame.setStyleSheet("""
            QFrame {
                background-color: #d1ecf1;
                border: 2px solid #bee5eb;
                border-radius: 12px;
                padding: 20px;
            }
        """)
        quick_layout = QVBoxLayout(quick_frame)
        
        quick_title = QLabel("⚡ Quick Actions")
        quick_title.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        quick_title.setStyleSheet("color: #0c5460;")
        quick_layout.addWidget(quick_title)
        
        quick_buttons_layout = QHBoxLayout()
        
        self.scrape_beginner_button = QPushButton("🎯 5 Beginner Videos")
        self.scrape_beginner_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
        """)
        self.scrape_beginner_button.clicked.connect(lambda: self.quick_scrape('beginner', 5))
        
        self.scrape_intermediate_button = QPushButton("⚡ 10 Intermediate Videos")
        self.scrape_intermediate_button.setStyleSheet("""
            QPushButton {
                background-color: #ffc107;
                color: #212529;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #e0a800;
            }
        """)
        self.scrape_intermediate_button.clicked.connect(lambda: self.quick_scrape('intermediate', 10))
        
        self.scrape_advanced_button = QPushButton("🔥 8 Advanced Videos")
        self.scrape_advanced_button.setStyleSheet("""
            QPushButton {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #c82333;
            }
        """)
        self.scrape_advanced_button.clicked.connect(lambda: self.quick_scrape('advanced', 8))
        
        quick_buttons_layout.addWidget(self.scrape_beginner_button)
        quick_buttons_layout.addWidget(self.scrape_intermediate_button)
        quick_buttons_layout.addWidget(self.scrape_advanced_button)
        
        quick_layout.addLayout(quick_buttons_layout)
        layout.addWidget(quick_frame)
        
        layout.addStretch()
        widget.setLayout(layout)
        return widget
    
    def create_beautiful_status_tab(self):
        """Create the beautiful status/log tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(20)
        
        # Header
        header = QLabel("📋 Activity Log")
        header.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        header.setStyleSheet("color: #2c3e50; margin-bottom: 15px;")
        layout.addWidget(header)
        
        # Log display with beautiful styling
        self.log_display = QTextEdit()
        self.log_display.setReadOnly(True)
        self.log_display.setFont(QFont("Consolas", 10))
        self.log_display.setStyleSheet("""
            QTextEdit {
                background-color: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                color: #495057;
                font-family: 'Consolas', monospace;
            }
        """)
        
        # Clear log button
        clear_button = QPushButton("🗑️ Clear Log")
        clear_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        clear_button.clicked.connect(self.log_display.clear)
        
        layout.addWidget(self.log_display)
        layout.addWidget(clear_button)
        
        widget.setLayout(layout)
        return widget
    
    def apply_beautiful_styling(self):
        """Apply beautiful styling to the main window."""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f8f9fa;
            }
            QWidget {
                background-color: #f8f9fa;
            }
        """)
    
    def check_database(self):
        """Check database connection with beautiful feedback."""
        try:
            conn = db_manager.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM scraped_videos")
            count = cursor.fetchone()[0]
            cursor.close()
            db_manager.return_connection(conn)
            
            self.db_status_label.setText(f"✅ Database connected! {count} videos available")
            self.db_status_label.setStyleSheet("color: #155724; font-size: 14px;")
            self.add_log(f"✅ Database connection successful ({count} videos)")
            
        except Exception as e:
            self.db_status_label.setText(f"❌ Database error: {e}")
            self.db_status_label.setStyleSheet("color: #721c24; font-size: 14px;")
            self.add_log(f"❌ Database error: {e}")
    
    def start_beautiful_scraping(self):
        """Start beautiful scraping operation."""
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
        self.scraping_worker = BeautifulScrapingWorker(tool_name, difficulty, max_videos)
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
        self.start_beautiful_scraping()
    
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
            self.centralWidget().widget(1).load_data()
        else:
            self.progress_label.setText("❌ Scraping failed!")
    
    def add_log(self, message):
        """Add message to beautiful log display."""
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
    app.setApplicationName("Beautiful Enhanced YouTube Scraper")
    
    # Set application style
    app.setStyle('Fusion')
    
    window = BeautifulScraperGUI()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()



