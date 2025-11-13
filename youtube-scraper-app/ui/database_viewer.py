"""Database viewer window."""

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTableWidget,
    QTableWidgetItem, QPushButton, QComboBox, QLabel,
    QLineEdit, QMessageBox, QHeaderView
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
import logging
from config.database import db_manager

logger = logging.getLogger(__name__)


class DatabaseViewer(QDialog):
    """Database viewer and management window."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        self.load_data()
    
    def init_ui(self):
        """Initialize UI."""
        self.setWindowTitle("Database Viewer")
        self.setGeometry(150, 150, 1000, 600)
        
        layout = QVBoxLayout(self)
        
        # Header
        header = QLabel("📊 Scraped Videos Database")
        header_font = QFont()
        header_font.setPointSize(14)
        header_font.setBold(True)
        header.setFont(header_font)
        layout.addWidget(header)
        
        # Filters
        filter_layout = QHBoxLayout()
        
        filter_layout.addWidget(QLabel("Tool:"))
        self.tool_combo = QComboBox()
        self.tool_combo.addItems(['All', 'Zapier', 'N8N'])
        self.tool_combo.currentTextChanged.connect(self.load_data)
        filter_layout.addWidget(self.tool_combo)
        
        filter_layout.addWidget(QLabel("Difficulty:"))
        self.difficulty_combo = QComboBox()
        self.difficulty_combo.addItems(['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'])
        self.difficulty_combo.currentTextChanged.connect(self.load_data)
        filter_layout.addWidget(self.difficulty_combo)
        
        filter_layout.addWidget(QLabel("Search:"))
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search by title...")
        self.search_input.textChanged.connect(self.filter_table)
        filter_layout.addWidget(self.search_input)
        
        filter_layout.addStretch()
        layout.addLayout(filter_layout)
        
        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(7)
        self.table.setHorizontalHeaderLabels([
            'ID', 'Tool', 'Title', 'Difficulty', 'Duration', 'Views', 'Published'
        ])
        
        # Set column widths
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(6, QHeaderView.ResizeMode.ResizeToContents)
        
        self.table.setAlternatingRowColors(True)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        layout.addWidget(self.table)
        
        # Stats
        self.stats_label = QLabel()
        self.stats_label.setFont(QFont("Arial", 9))
        layout.addWidget(self.stats_label)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        refresh_btn = QPushButton("🔄 Refresh")
        refresh_btn.clicked.connect(self.load_data)
        button_layout.addWidget(refresh_btn)
        
        export_btn = QPushButton("📤 Export CSV")
        export_btn.clicked.connect(self.export_csv)
        button_layout.addWidget(export_btn)
        
        button_layout.addStretch()
        
        close_btn = QPushButton("Close")
        close_btn.clicked.connect(self.close)
        button_layout.addWidget(close_btn)
        
        layout.addLayout(button_layout)
    
    def load_data(self):
        """Load data from database."""
        try:
            tool = self.tool_combo.currentText().lower()
            if tool == 'all':
                tool = None
            
            difficulty = self.difficulty_combo.currentText().lower()
            if difficulty == 'all':
                difficulty = None
            
            videos = db_manager.get_videos(tool=tool, difficulty=difficulty, limit=1000)
            
            self.table.setRowCount(0)
            
            for video in videos:
                row = self.table.rowCount()
                self.table.insertRow(row)
                
                self.table.setItem(row, 0, QTableWidgetItem(str(video.get('video_id', ''))))
                self.table.setItem(row, 1, QTableWidgetItem(str(video.get('tool', '')).upper()))
                self.table.setItem(row, 2, QTableWidgetItem(str(video.get('title', ''))))
                self.table.setItem(row, 3, QTableWidgetItem(str(video.get('difficulty', '')).capitalize()))
                
                duration = video.get('duration_seconds', 0)
                duration_str = f"{duration // 60}:{duration % 60:02d}"
                self.table.setItem(row, 4, QTableWidgetItem(duration_str))
                
                self.table.setItem(row, 5, QTableWidgetItem('-'))  # Views not stored yet
                
                published = video.get('published_at', '')
                if published:
                    published_str = str(published).split()[0]  # Date only
                    self.table.setItem(row, 6, QTableWidgetItem(published_str))
                else:
                    self.table.setItem(row, 6, QTableWidgetItem('-'))
            
            # Update stats
            total = len(videos)
            self.stats_label.setText(f"Showing {total} videos")
            
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            QMessageBox.critical(self, "Error", f"Failed to load data: {e}")
    
    def filter_table(self):
        """Filter table based on search text."""
        search_text = self.search_input.text().lower()
        
        for row in range(self.table.rowCount()):
            title_item = self.table.item(row, 2)
            if title_item:
                title = title_item.text().lower()
                self.table.setRowHidden(row, search_text not in title)
    
    def export_csv(self):
        """Export data to CSV."""
        try:
            from PyQt6.QtWidgets import QFileDialog
            import csv
            from datetime import datetime
            
            filename, _ = QFileDialog.getSaveFileName(
                self,
                "Export to CSV",
                f"youtube_videos_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                "CSV Files (*.csv)"
            )
            
            if filename:
                with open(filename, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    
                    # Write headers
                    headers = [
                        self.table.horizontalHeaderItem(i).text()
                        for i in range(self.table.columnCount())
                    ]
                    writer.writerow(headers)
                    
                    # Write data
                    for row in range(self.table.rowCount()):
                        if not self.table.isRowHidden(row):
                            row_data = [
                                self.table.item(row, col).text()
                                for col in range(self.table.columnCount())
                            ]
                            writer.writerow(row_data)
                
                QMessageBox.information(
                    self,
                    "Export Complete",
                    f"Data exported to {filename}"
                )
        
        except Exception as e:
            logger.error(f"Export failed: {e}")
            QMessageBox.critical(self, "Error", f"Export failed: {e}")






