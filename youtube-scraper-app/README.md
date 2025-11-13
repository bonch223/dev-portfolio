# YouTube Automation Tools Scraper - Fast Edition 🚀

A high-performance Python desktop application with PyQt6 GUI for scraping YouTube videos related to Zapier and N8N automation tools. Features parallel processing, intelligent quality scoring, and automatic difficulty classification.

## ✨ Features

- **Fast Parallel Scraping**: Multi-threaded architecture for maximum speed
- **Dual Tool Support**: Focused on Zapier and N8N
- **100+ Search Terms**: Comprehensive coverage per tool
- **Intelligent Quality Scoring**: Multi-factor algorithm (engagement, content, relevance, freshness)
- **Automatic Difficulty Classification**: ML-based classification (beginner, intermediate, advanced, expert)
- **Multiple API Key Support**: Rotate between keys for extended scraping
- **Batch Database Operations**: High-performance PostgreSQL integration
- **Real-time Progress Tracking**: Live UI updates
- **Database Viewer**: Browse and export scraped videos
- **Resumable Operations**: Pick up where you left off

## 📋 Requirements

- Python 3.11 or higher
- PostgreSQL database (with existing `video_cache` table)
- YouTube Data API v3 key(s)
- Windows/Linux/macOS

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd youtube-scraper-app
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file and edit it:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Database (use your existing workflow automation database)
DATABASE_URL=postgresql://user:password@localhost:5432/workflow_automation

# YouTube API Keys (get from Google Cloud Console)
YOUTUBE_API_KEY_1=your_youtube_api_key_here
YOUTUBE_API_KEY_2=optional_second_key
YOUTUBE_API_KEY_3=optional_third_key

# Scraping Settings
MAX_VIDEOS_PER_TERM=100
MAX_CONCURRENT_REQUESTS=10
MIN_VIDEO_VIEWS=500
MIN_VIDEO_DURATION=120
MAX_VIDEO_DURATION=7200
DATE_FILTER_YEARS=5

# Quality Filters
MIN_QUALITY_SCORE=50

# Performance (adjust based on your system)
BATCH_INSERT_SIZE=50
MAX_WORKERS=5
```

### 3. Get YouTube API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Copy the key to your `.env` file
6. *Optional*: Create multiple keys for rotation

### 4. Run the Application

```bash
python main.py
```

## 📊 Database Schema

The application uses your existing `video_cache` table from the workflow automation platform:

```sql
CREATE TABLE IF NOT EXISTS video_cache (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_name VARCHAR(255),
    channel_id VARCHAR(50),
    published_at TIMESTAMP,
    duration_seconds INTEGER,
    difficulty VARCHAR(20) DEFAULT 'beginner',
    search_query TEXT,
    tool VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0
);
```

## 🎯 How to Use

### Scraping a Single Tool

1. **Open the application**
2. **Select a tool tab** (Zapier or N8N)
3. **Choose search categories** to scrape (all selected by default)
4. **Click "Scrape Current Tool"**
5. **Monitor progress** in real-time
6. **View results** in the database viewer

### Scraping Both Tools

1. Click **"Scrape Both Tools"** button
2. Confirm the operation
3. Wait for completion (may take 1-3 hours depending on settings)

### Viewing Results

1. Click **"View Database"** button
2. Filter by tool, difficulty, or search term
3. Export to CSV if needed

## ⚡ Performance Tips

### For Maximum Speed

```env
# Use multiple API keys
YOUTUBE_API_KEY_1=key1
YOUTUBE_API_KEY_2=key2
YOUTUBE_API_KEY_3=key3

# Increase parallelization
MAX_CONCURRENT_REQUESTS=15
MAX_WORKERS=8
BATCH_INSERT_SIZE=100
```

### For API Quota Conservation

```env
# Reduce parallelization
MAX_CONCURRENT_REQUESTS=5
MAX_WORKERS=3

# Limit videos per term
MAX_VIDEOS_PER_TERM=50
```

### Expected Performance

With optimal settings:
- **Single tool**: 2,000-3,000 videos in 30-60 minutes
- **Both tools**: 4,000-6,000 videos in 1-2 hours
- **API quota**: ~100 videos per 1,000 quota units

## 📈 Search Coverage

### Zapier (100+ Search Terms)

- **Beginner**: 35 terms (basics, features, getting started)
- **Intermediate**: 45 terms (integrations, workflows, business use cases)
- **Advanced**: 35 terms (webhooks, APIs, custom code)
- **Expert**: 25 terms (AI integration, specialized use cases)

### N8N (100+ Search Terms)

- **Beginner**: 46 terms (basics, setup, core concepts)
- **Intermediate**: 50 terms (nodes, integrations, workflows)
- **Advanced**: 40 terms (AI integration, complex automations)
- **Expert**: 15 terms (custom development, node creation)

## 🎨 Quality Scoring Algorithm

Videos are scored 0-100 based on:

- **Engagement (30%)**: Views, likes, comments, engagement ratio
- **Content Quality (25%)**: Duration, description quality, title optimization
- **Creator Authority (20%)**: Channel metrics
- **Relevance (15%)**: Match with search terms
- **Freshness (10%)**: Recency of publication

Minimum threshold: 50/100 (configurable)

## 🧠 Difficulty Classification

Automatic classification uses:

- **Title keyword analysis** (60% weight)
- **Description keyword analysis** (25% weight)
- **Duration heuristics** (15% weight)

Classification confidence score is stored for manual review.

## 🔧 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
# Verify credentials in .env
# Test connection manually:
psql -h localhost -U postgres -d workflow_automation
```

### API Quota Exceeded

- Add more API keys to `.env`
- Reduce `MAX_VIDEOS_PER_TERM`
- Spread scraping across multiple days

### Application Won't Start

```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check logs
cat scraper.log
```

### Slow Performance

- Increase `MAX_WORKERS` (up to CPU cores)
- Increase `MAX_CONCURRENT_REQUESTS` (up to 20)
- Use SSD for database
- Increase database connection pool size

## 📝 Logs

Application logs are saved to `scraper.log` with detailed information:

- API quota usage
- Videos found/inserted/duplicated
- Errors and warnings
- Performance metrics

## 🔐 Security Notes

- Never commit `.env` file to version control
- Rotate API keys periodically
- Use strong database passwords
- Limit database user permissions

## 📦 Project Structure

```
youtube-scraper-app/
├── config/
│   ├── __init__.py
│   ├── database.py          # Database connection pool
│   ├── settings.py          # Application settings
│   └── tools_config.py      # Tool-specific search terms
├── scrapers/
│   ├── __init__.py
│   ├── youtube_api_scraper.py      # Fast parallel API scraper
│   ├── difficulty_classifier.py    # ML-based classification
│   └── scraper_orchestrator.py     # Main orchestration logic
├── ui/
│   ├── __init__.py
│   ├── main_window.py       # Main application window
│   └── database_viewer.py   # Database browser
├── utils/
│   ├── __init__.py
│   └── logger.py            # Logging configuration
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
├── env.example             # Environment template
└── README.md               # This file
```

## 🎯 Goal Achievement

This application is designed to help you achieve **5,000+ carefully curated videos per tool**:

### Strategy

1. **Day 1**: Run full scrape for both tools (~4,000-6,000 videos)
2. **Week 2**: Re-run with updated search terms (new uploads)
3. **Monthly**: Incremental updates for fresh content

### Quality Assurance

- All videos scored and filtered (min quality: 50/100)
- Automatic difficulty classification with confidence scores
- Duplicate detection and removal
- Series detection for multi-part tutorials
- Manual review capability in database viewer

## 🤝 Contributing

This is a portfolio project tool. Feel free to:

- Report issues
- Suggest improvements
- Add more search terms
- Enhance quality scoring algorithm

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

- Built for the Workflow Automation Challenge Platform
- Uses YouTube Data API v3
- Powered by PyQt6

---

**Created by**: Your Portfolio Project  
**Version**: 1.0.0  
**Last Updated**: October 2025

## 🚀 Quick Command Reference

```bash
# Setup
pip install -r requirements.txt
cp env.example .env
# Edit .env with your credentials

# Run
python main.py

# Test database connection
python -c "from config.database import db_manager; print('✅' if db_manager.test_connection() else '❌')"

# Check API keys
python -c "from config.settings import YOUTUBE_API_KEYS; print(f'{len(YOUTUBE_API_KEYS)} API keys configured')"
```

## 📞 Support

For issues with:
- **Database**: Check your PostgreSQL connection and schema
- **API**: Verify YouTube Data API v3 is enabled
- **Performance**: Adjust settings in `.env`
- **Errors**: Check `scraper.log` for details

Happy Scraping! 🎉






