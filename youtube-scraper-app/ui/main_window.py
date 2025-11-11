"""Main application window."""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QProgressBar, QTextEdit,
    QGroupBox, QCheckBox, QSpinBox, QComboBox,
    QTabWidget, QTableWidget, QTableWidgetItem,
    QMessageBox, QStatusBar
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QColor
import logging
from datetime import datetime

from scrapers.scraper_orchestrator import ScraperOrchestrator
from config.database import db_manager
from config.tools_config import AUTOMATION_TOOLS

logger = logging.getLogger(__name__)


class ScraperThread(QThread):
    """Background thread for scraping to keep UI responsive."""
    
    progress_update = pyqtSignal(int, int, str, int)
    log_message = pyqtSignal(str, str)  # message, level
    finished_signal = pyqtSignal(bool, dict)
    
    def __init__(self, tool_name, categories=None, scrape_both=False):
        super().__init__()
        self.tool_name = tool_name
        self.categories = categories
        self.scrape_both = scrape_both
        self.orchestrator = ScraperOrchestrator()
    
    def run(self):
        """Run scraping in background thread."""
        try:
            self.log_message.emit(f"Starting scraping for {self.tool_name}...", "INFO")
            
            def progress_callback(completed, total, term, found):
                self.progress_update.emit(completed, total, term, found)
                self.log_message.emit(
                    f"[{completed}/{total}] '{term}': {found} videos",
                    "INFO"
                )
            
            if self.scrape_both:
                success = self.orchestrator.scrape_both_tools(progress_callback)
            else:
                success = self.orchestrator.scrape_tool(
                    self.tool_name,
                    self.categories,
                    progress_callback
                )
            
            stats = self.orchestrator.get_stats()
            self.finished_signal.emit(success, stats)
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            self.log_message.emit(f"Error: {str(e)}", "ERROR")
            self.finished_signal.emit(False, {})


class MainWindow(QMainWindow):
    """Main application window."""
    
    def __init__(self):
        super().__init__()
        self.scraper_thread = None
        self.init_ui()
        self.check_database_connection()
    
    def init_ui(self):
        """Initialize the user interface."""
        self.setWindowTitle("YouTube Automation Tools Scraper - Fast Edition")
        self.setGeometry(100, 100, 1200, 800)
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QVBoxLayout(central_widget)
        
        # Header
        header_label = QLabel("🚀 YouTube Automation Tools Scraper")
        header_font = QFont()
        header_font.setPointSize(16)
        header_font.setBold(True)
        header_label.setFont(header_font)
        header_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header_label)
        
        # Tool selection tabs
        self.tool_tabs = QTabWidget()
        self.create_tool_tab('zapier')
        self.create_tool_tab('n8n')
        main_layout.addWidget(self.tool_tabs)
        
        # Control buttons
        control_layout = QHBoxLayout()
        
        self.scrape_current_btn = QPushButton("🎯 Scrape Current Tool")
        self.scrape_current_btn.clicked.connect(self.scrape_current_tool)
        self.scrape_current_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        control_layout.addWidget(self.scrape_current_btn)
        
        self.scrape_both_btn = QPushButton("⚡ Scrape Both Tools")
        self.scrape_both_btn.clicked.connect(self.scrape_both_tools)
        self.scrape_both_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #0b7dda;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        control_layout.addWidget(self.scrape_both_btn)
        
        self.stop_btn = QPushButton("⏹️ Stop")
        self.stop_btn.clicked.connect(self.stop_scraping)
        self.stop_btn.setEnabled(False)
        self.stop_btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #da190b;
            }
        """)
        control_layout.addWidget(self.stop_btn)
        
        self.view_db_btn = QPushButton("📊 View Database")
        self.view_db_btn.clicked.connect(self.view_database)
        self.view_db_btn.setStyleSheet("""
            QPushButton {
                background-color: #9C27B0;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #7B1FA2;
            }
        """)
        control_layout.addWidget(self.view_db_btn)
        
        main_layout.addLayout(control_layout)
        
        # Progress section
        progress_group = QGroupBox("Progress")
        progress_layout = QVBoxLayout()
        
        self.current_tool_label = QLabel("Tool: Not started")
        progress_layout.addWidget(self.current_tool_label)
        
        self.current_term_label = QLabel("Search Term: -")
        progress_layout.addWidget(self.current_term_label)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(100)
        progress_layout.addWidget(self.progress_bar)
        
        stats_layout = QHBoxLayout()
        self.found_label = QLabel("Found: 0")
        self.new_label = QLabel("New: 0")
        self.duplicates_label = QLabel("Duplicates: 0")
        self.quota_label = QLabel("API Quota: 0")
        
        stats_layout.addWidget(self.found_label)
        stats_layout.addWidget(self.new_label)
        stats_layout.addWidget(self.duplicates_label)
        stats_layout.addWidget(self.quota_label)
        stats_layout.addStretch()
        
        progress_layout.addLayout(stats_layout)
        progress_group.setLayout(progress_layout)
        main_layout.addWidget(progress_group)
        
        # Log section
        log_group = QGroupBox("Activity Log")
        log_layout = QVBoxLayout()
        
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setMaximumHeight(200)
        log_layout.addWidget(self.log_text)
        
        log_group.setLayout(log_layout)
        main_layout.addWidget(log_group)
        
        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.db_status_label = QLabel("Database: Checking...")
        self.status_bar.addPermanentWidget(self.db_status_label)
        
        # Timer for updating stats
        self.stats_timer = QTimer()
        self.stats_timer.timeout.connect(self.update_database_stats)
        self.stats_timer.start(5000)  # Update every 5 seconds
    
    def create_tool_tab(self, tool_name):
        """Create a tab for a specific tool."""
        tool_info = AUTOMATION_TOOLS.get(tool_name, {})
        
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Tool info
        info_label = QLabel(f"{tool_info.get('icon', '')} {tool_info.get('name', tool_name.upper())}")
        info_font = QFont()
        info_font.setPointSize(14)
        info_font.setBold(True)
        info_label.setFont(info_font)
        layout.addWidget(info_label)
        
        # Category selection
        cat_group = QGroupBox("Search Categories")
        cat_layout = QVBoxLayout()
        
        categories = tool_info.get('search_terms', {}).keys()
        checkboxes = []
        
        for category in categories:
            cb = QCheckBox(category.replace('_', ' ').title())
            cb.setChecked(True)
            checkboxes.append((category, cb))
            cat_layout.addWidget(cb)
        
        cat_group.setLayout(cat_layout)
        layout.addWidget(cat_group)
        
        # Store checkboxes reference
        setattr(self, f'{tool_name}_checkboxes', checkboxes)
        
        # Stats
        stats_label = QLabel("Database Statistics:")
        stats_label.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        layout.addWidget(stats_label)
        
        stats_text = QLabel("Loading...")
        setattr(self, f'{tool_name}_stats_label', stats_text)
        layout.addWidget(stats_text)
        
        layout.addStretch()
        
        self.tool_tabs.addTab(tab, tool_info.get('name', tool_name.upper()))
    
    def check_database_connection(self):
        """Check database connection status."""
        try:
            if db_manager.test_connection():
                self.db_status_label.setText("Database: ✅ Connected")
                self.db_status_label.setStyleSheet("color: green")
                self.update_database_stats()
            else:
                self.db_status_label.setText("Database: ❌ Not Connected")
                self.db_status_label.setStyleSheet("color: red")
        except Exception as e:
            self.db_status_label.setText(f"Database: ❌ Error")
            self.db_status_label.setStyleSheet("color: red")
            logger.error(f"Database connection check failed: {e}")
    
    def update_database_stats(self):
        """Update database statistics."""
        try:
            stats = db_manager.get_statistics()
            
            # Update Zapier stats
            zapier_count = sum(row['count'] for row in stats.get('by_tool', []) if row['tool'] == 'zapier')
            if hasattr(self, 'zapier_stats_label'):
                self.zapier_stats_label.setText(f"Videos in Database: {zapier_count:,}")
            
            # Update N8N stats
            n8n_count = sum(row['count'] for row in stats.get('by_tool', []) if row['tool'] == 'n8n')
            if hasattr(self, 'n8n_stats_label'):
                self.n8n_stats_label.setText(f"Videos in Database: {n8n_count:,}")
            
        except Exception as e:
            logger.error(f"Failed to update stats: {e}")
    
    def get_selected_categories(self, tool_name):
        """Get selected categories for a tool."""
        checkboxes = getattr(self, f'{tool_name}_checkboxes', [])
        return [cat for cat, cb in checkboxes if cb.isChecked()]
    
    def scrape_current_tool(self):
        """Start scraping for currently selected tool."""
        current_tab_index = self.tool_tabs.currentIndex()
        tool_name = 'zapier' if current_tab_index == 0 else 'n8n'
        
        categories = self.get_selected_categories(tool_name)
        
        if not categories:
            QMessageBox.warning(
                self,
                "No Categories Selected",
                "Please select at least one search category."
            )
            return
        
        self.start_scraping(tool_name, categories)
    
    def scrape_both_tools(self):
        """Start scraping for both tools."""
        reply = QMessageBox.question(
            self,
            'Scrape Both Tools',
            'This will scrape both Zapier and N8N. This may take a while. Continue?',
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.start_scraping(None, None, scrape_both=True)
    
    def start_scraping(self, tool_name, categories=None, scrape_both=False):
        """Start the scraping process."""
        if self.scraper_thread and self.scraper_thread.isRunning():
            QMessageBox.warning(
                self,
                "Scraping in Progress",
                "A scraping operation is already running."
            )
            return
        
        # Disable buttons
        self.scrape_current_btn.setEnabled(False)
        self.scrape_both_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)
        
        # Reset UI
        self.progress_bar.setValue(0)
        self.log_text.clear()
        self.add_log("🚀 Starting scraping process...", "INFO")
        
        # Create and start thread
        self.scraper_thread = ScraperThread(tool_name, categories, scrape_both)
        self.scraper_thread.progress_update.connect(self.on_progress_update)
        self.scraper_thread.log_message.connect(self.add_log)
        self.scraper_thread.finished_signal.connect(self.on_scraping_finished)
        self.scraper_thread.start()
    
    def stop_scraping(self):
        """Stop the scraping process."""
        if self.scraper_thread and self.scraper_thread.isRunning():
            self.scraper_thread.terminate()
            self.add_log("⏹️ Scraping stopped by user", "WARNING")
            self.on_scraping_finished(False, {})
    
    def on_progress_update(self, completed, total, term, found):
        """Handle progress updates."""
        progress = int((completed / total) * 100) if total > 0 else 0
        self.progress_bar.setValue(progress)
        self.current_term_label.setText(f"Search Term: {term}")
        self.found_label.setText(f"Found: {found}")
    
    def add_log(self, message, level="INFO"):
        """Add message to log."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if level == "INFO":
            color = "green"
            icon = "✅"
        elif level == "WARNING":
            color = "orange"
            icon = "⚠️"
        elif level == "ERROR":
            color = "red"
            icon = "❌"
        else:
            color = "black"
            icon = "ℹ️"
        
        formatted_message = f'<span style="color: {color}">[{timestamp}] {icon} {message}</span>'
        self.log_text.append(formatted_message)
    
    def on_scraping_finished(self, success, stats):
        """Handle scraping completion."""
        # Re-enable buttons
        self.scrape_current_btn.setEnabled(True)
        self.scrape_both_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)
        
        if success:
            self.add_log("🎉 Scraping completed successfully!", "INFO")
            self.add_log(f"📊 Statistics:", "INFO")
            self.add_log(f"  - Videos Found: {stats.get('total_found', 0)}", "INFO")
            self.add_log(f"  - Inserted: {stats.get('total_inserted', 0)}", "INFO")
            self.add_log(f"  - Duplicates: {stats.get('total_duplicates', 0)}", "INFO")
            
            QMessageBox.information(
                self,
                "Scraping Complete",
                f"Successfully scraped and inserted {stats.get('total_inserted', 0)} videos!"
            )
        else:
            self.add_log("❌ Scraping failed or was stopped", "ERROR")
        
        # Update stats
        self.update_database_stats()
        self.progress_bar.setValue(100 if success else 0)
    
    def view_database(self):
        """Open database viewer window."""
        from ui.database_viewer import DatabaseViewer
        self.db_viewer = DatabaseViewer(self)
        self.db_viewer.show()




