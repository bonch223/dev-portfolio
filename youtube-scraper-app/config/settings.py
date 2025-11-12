"""Application settings and configuration."""

import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'workflow_automation')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# YouTube API Keys (support multiple keys for rotation)
YOUTUBE_API_KEYS = [
    os.getenv('YOUTUBE_API_KEY_1'),
    os.getenv('YOUTUBE_API_KEY_2'),
    os.getenv('YOUTUBE_API_KEY_3'),
]
YOUTUBE_API_KEYS = [key for key in YOUTUBE_API_KEYS if key]  # Remove None values
YOUTUBE_API_QUOTA_LIMIT = int(os.getenv('YOUTUBE_API_QUOTA_LIMIT', 10000))

# Scraping Configuration
MAX_VIDEOS_PER_TERM = int(os.getenv('MAX_VIDEOS_PER_TERM', 100))
MAX_CONCURRENT_REQUESTS = int(os.getenv('MAX_CONCURRENT_REQUESTS', 10))
MIN_VIDEO_VIEWS = int(os.getenv('MIN_VIDEO_VIEWS', 500))
MIN_VIDEO_DURATION = int(os.getenv('MIN_VIDEO_DURATION', 120))
MAX_VIDEO_DURATION = int(os.getenv('MAX_VIDEO_DURATION', 7200))
DATE_FILTER_YEARS = int(os.getenv('DATE_FILTER_YEARS', 5))

# Quality Scoring
MIN_QUALITY_SCORE = int(os.getenv('MIN_QUALITY_SCORE', 50))
ENABLE_AUTO_CLASSIFICATION = os.getenv('ENABLE_AUTO_CLASSIFICATION', 'true').lower() == 'true'
ENABLE_SERIES_DETECTION = os.getenv('ENABLE_SERIES_DETECTION', 'true').lower() == 'true'

# Performance
BATCH_INSERT_SIZE = int(os.getenv('BATCH_INSERT_SIZE', 50))
ENABLE_PARALLEL_SCRAPING = os.getenv('ENABLE_PARALLEL_SCRAPING', 'true').lower() == 'true'
MAX_WORKERS = int(os.getenv('MAX_WORKERS', 5))

# Application Settings
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'scraper.log')





