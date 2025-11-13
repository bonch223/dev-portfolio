# Enhanced YouTube Scraper

A comprehensive, difficulty-aware YouTube video scraper designed specifically for educational automation tools like Zapier, N8N, Make.com, and Power Automate.

## 🚀 Key Features

### ✨ **Difficulty-Specific Scraping**
- **Beginner**: 3-10 minute tutorials, basic concepts, getting started guides
- **Intermediate**: 5-20 minute automation workflows, integrations, setup guides  
- **Advanced**: 10-30 minute enterprise solutions, API usage, custom integrations

### 🎯 **Smart Quality Scoring**
- **Engagement Analysis**: Views, likes, comments ratio
- **Content Quality**: Title relevance, description depth
- **Creator Authority**: Channel reputation and subscriber count
- **Relevance Matching**: Search term alignment
- **Freshness Factor**: Publication date consideration

### 🔍 **Advanced Filtering**
- **Duration Filters**: Optimized for each difficulty level
- **View Count Thresholds**: Minimum quality standards
- **Keyword Analysis**: Inclusion/exclusion logic
- **Spam Detection**: Automatic low-quality content filtering
- **Duplicate Prevention**: Content hash-based deduplication

### 📊 **Comprehensive Metadata**
- Video details (title, description, duration, views)
- Channel information (name, ID, subscriber count)
- Engagement metrics (likes, comments, views)
- Content analysis (tutorial indicators, code examples, series detection)
- Quality scores (overall quality, usefulness for learning)
- Keywords and tags extraction

## 🛠️ Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Database**:
   - Set up your PostgreSQL connection in `.env`
   - Ensure the `scraped_videos` table exists

3. **Launch the Enhanced GUI**:
   ```bash
   # Windows
   ENHANCED_LAUNCH.bat
   
   # Or directly
   python enhanced_gui.py
   ```

## 🎮 Usage

### **GUI Interface**

The enhanced GUI provides three main tabs:

#### 🎯 **Scraping Tab**
- **Tool Selection**: Choose from Zapier, N8N, Make.com, Power Automate
- **Difficulty Selection**: Beginner, Intermediate, Advanced
- **Max Videos**: Set target number of videos (1-50)
- **Quick Actions**: One-click scraping for common scenarios
- **Progress Tracking**: Real-time progress updates

#### 📊 **Database Tab**
- **Filter by Tool/Difficulty**: View videos by specific criteria
- **Statistics Display**: Total videos, average quality scores
- **Video Details**: Comprehensive video information table
- **Real-time Updates**: Automatic refresh after scraping

#### 📋 **Status Tab**
- **Activity Log**: Detailed logging of all operations
- **Error Tracking**: Comprehensive error reporting
- **Performance Metrics**: Scraping statistics and timing

### **Command Line Usage**

```python
from scrapers.enhanced_orchestrator import EnhancedScraperOrchestrator

# Initialize orchestrator
orchestrator = EnhancedScraperOrchestrator()

# Scrape 5 beginner Zapier videos
success = orchestrator.scrape_difficulty_specific(
    tool_name="zapier",
    difficulty="beginner", 
    max_videos=5
)

# Scrape all difficulty levels
results = orchestrator.scrape_all_difficulties(
    tool_name="zapier",
    videos_per_difficulty={
        'beginner': 5,
        'intermediate': 10,
        'advanced': 8
    }
)
```

## 🎯 **Difficulty-Specific Features**

### **Beginner Videos**
- **Duration**: 3-10 minutes (perfect for quick learning)
- **Content**: Basic concepts, getting started guides, introductions
- **Keywords**: tutorial, beginner, basics, getting started, introduction, 101
- **Min Views**: 1,000 (ensures quality content)
- **Excludes**: Advanced, expert, complex, enterprise topics

### **Intermediate Videos**  
- **Duration**: 5-20 minutes (comprehensive workflows)
- **Content**: Automation setups, integrations, configurations
- **Keywords**: automation, workflow, integration, setup, configuration, tips
- **Min Views**: 2,000 (established content)
- **Excludes**: Beginner basics and advanced enterprise topics

### **Advanced Videos**
- **Duration**: 10-30 minutes (deep-dive content)
- **Content**: Enterprise solutions, API usage, custom integrations
- **Keywords**: advanced, enterprise, api, webhook, custom, complex, expert
- **Min Views**: 5,000 (high-authority content)
- **Excludes**: Beginner tutorials and basic introductions

## 📈 **Quality Scoring Algorithm**

The enhanced scraper uses a sophisticated 100-point quality scoring system:

### **Engagement Score (25 points)**
- Like-to-view ratio analysis
- Comment engagement metrics
- Social proof indicators

### **Content Quality (30 points)**
- Title relevance and clarity
- Description depth and detail
- Tutorial content indicators

### **Creator Authority (20 points)**
- Channel subscriber count
- Video view consistency
- Content creator reputation

### **Relevance Score (15 points)**
- Search term matching
- Tool-specific keyword presence
- Difficulty level alignment

### **Freshness Factor (10 points)**
- Publication date recency
- Content update frequency
- Trending topic relevance

## 🔧 **Configuration**

### **Search Terms**
Customize search terms in `config/tools_config.py`:
- Beginner-specific terms for basic concepts
- Intermediate terms for workflow automation
- Advanced terms for enterprise solutions

### **Quality Thresholds**
Adjust quality filters in `scrapers/enhanced_youtube_scraper.py`:
- Minimum quality scores per difficulty
- View count thresholds
- Duration ranges
- Keyword inclusion/exclusion lists

### **Performance Settings**
Optimize performance in `config/settings.py`:
- Maximum concurrent workers
- Request timeouts and retries
- Rate limiting delays

## 📊 **Database Schema**

The enhanced scraper uses the `scraped_videos` table with comprehensive fields:

```sql
CREATE TABLE scraped_videos (
    video_id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel VARCHAR(255),
    duration INTEGER,
    view_count BIGINT,
    difficulty VARCHAR(20),
    tool VARCHAR(50),
    quality_score DECIMAL(5,2),
    usefulness_score DECIMAL(5,2),
    keywords TEXT[],
    tags TEXT[],
    has_tutorial_content BOOLEAN,
    has_code_examples BOOLEAN,
    is_series BOOLEAN,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    video_url TEXT
);
```

## 🚀 **Quick Start Examples**

### **Scrape 5 Beginner Zapier Videos**
```bash
python test_beginner_scraping.py
```

### **Launch Enhanced GUI**
```bash
ENHANCED_LAUNCH.bat
```

### **Scrape All Difficulty Levels**
```python
# In the GUI, use Quick Actions buttons
# Or programmatically:
orchestrator.scrape_all_difficulties("zapier", {
    'beginner': 5,
    'intermediate': 10, 
    'advanced': 8
})
```

## 🎯 **Best Practices**

1. **Start Small**: Begin with 5 videos per difficulty to test quality
2. **Monitor Quality**: Check the Database tab for quality scores
3. **Use Filters**: Filter by tool and difficulty to find specific content
4. **Regular Updates**: Re-run scraping to get fresh content
5. **Quality Over Quantity**: Focus on high-quality scores (>70) for best learning content

## 🛠️ **Troubleshooting**

### **No Videos Found**
- Check internet connection
- Verify tool name and difficulty spelling
- Try different difficulty levels
- Check database connection

### **Low Quality Scores**
- Adjust quality thresholds in configuration
- Review search terms for better targeting
- Check minimum view count requirements

### **Performance Issues**
- Reduce concurrent workers in settings
- Increase delays between requests
- Check database connection pool size

## 📞 **Support**

For issues or feature requests:
1. Check the activity log in the Status tab
2. Review database connection status
3. Verify all dependencies are installed
4. Check configuration files for errors

---

**Happy Scraping! 🎓📺**

The Enhanced YouTube Scraper is designed to find the highest quality educational content for automation tools, making learning more effective and comprehensive.





