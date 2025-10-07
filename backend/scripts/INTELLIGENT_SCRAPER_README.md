# Intelligent YouTube Video Scraper

An advanced YouTube video scraper that automatically detects difficulty levels, filters for quality content, and intelligently categorizes videos for automation tools (Zapier, n8n, Make.com).

## 🎯 Features

### 🧠 **Intelligent Analysis**
- **Automatic Difficulty Detection**: Analyzes titles, descriptions, and content to classify videos as beginner, intermediate, or advanced
- **Quality Scoring**: Rates videos based on view count, duration, content quality, and engagement
- **Usefulness Assessment**: Evaluates videos for tutorial value and practical application
- **Content Analysis**: Detects tutorial content, code examples, and series videos

### 🔍 **Smart Filtering**
- **View Count Filtering**: Only includes videos with meaningful view counts (default: 1,000+ views)
- **Duration Filtering**: Focuses on videos that are substantial but not too long (2 min - 1 hour)
- **Quality Threshold**: Only stores videos with quality scores above 50/100
- **Duplicate Prevention**: Automatically handles duplicate videos with upsert logic

### 🛠️ **Tool-Specific Scraping**
- **Zapier**: 8 different search terms covering all difficulty levels
- **n8n**: 8 different search terms for comprehensive coverage
- **Make.com**: 8 different search terms including Integromat content
- **Customizable**: Easy to add more tools or modify search terms

## 🚀 Quick Start

### 1. Update Database Schema
```bash
npm run update-schema
```

### 2. Run Intelligent Scraping
```bash
npm run scrape-intelligent
```

### 3. Check Results
```bash
# View scraped videos in database
npm run scrape-demo
```

## 📊 Database Schema

The scraper creates an enhanced `scraped_videos` table with:

```sql
CREATE TABLE scraped_videos (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    view_count BIGINT DEFAULT 0,
    duration INTEGER DEFAULT 0,
    channel VARCHAR(255),
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    published_at TIMESTAMP,
    
    -- Quality and categorization
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
    tool VARCHAR(50) NOT NULL DEFAULT 'automation',
    quality_score INTEGER DEFAULT 0,
    usefulness_score INTEGER DEFAULT 0,
    
    -- Content analysis
    keywords TEXT[],
    tags TEXT[],
    has_tutorial_content BOOLEAN DEFAULT false,
    has_code_examples BOOLEAN DEFAULT false,
    is_series BOOLEAN DEFAULT false,
    
    -- Metadata
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_version VARCHAR(10) DEFAULT '1.0'
);
```

## 🧠 Intelligence Algorithms

### Difficulty Detection
```javascript
// Analyzes title, description, and channel for keywords
const difficulty = detectDifficulty(title, description, channel);

// Keywords for each level:
// Advanced: 'api', 'webhook', 'javascript', 'oauth', 'enterprise'
// Intermediate: 'workflow', 'automation', 'multi-step', 'complex'
// Beginner: 'tutorial', 'basics', 'getting started', 'simple'
```

### Quality Scoring (0-100)
- **View Count (0-40 pts)**: 100k+ views = 40 pts, 50k+ = 35 pts, etc.
- **Duration (0-20 pts)**: 10-30 min ideal = 20 pts, 5min-1hour = 15 pts
- **Title Quality (0-20 pts)**: 'tutorial', 'complete', 'step by step'
- **Description Quality (0-20 pts)**: Detailed descriptions, timestamps, resources

### Usefulness Scoring (0-100)
- **Channel Authority (0-30 pts)**: Official channels, automation experts
- **Content Indicators (0-40 pts)**: Tutorial content, examples, demos
- **Engagement (0-30 pts)**: View count as engagement proxy

## 🔧 Configuration

### Customize Search Terms
Edit `backend/scripts/intelligent-scraper.js`:

```javascript
this.tools = [
  {
    name: 'zapier',
    searchTerms: [
      'zapier tutorial beginner',
      'zapier automation basics',
      // Add your custom terms
    ]
  }
];
```

### Adjust Quality Filters
```javascript
this.minViews = 1000;        // Minimum views
this.minDuration = 120;      // Minimum 2 minutes
this.maxDuration = 3600;     // Maximum 1 hour
```

## 📈 Expected Results

### Typical Scraping Session
- **Total Videos Found**: ~240 videos (80 per tool)
- **Quality Filtered**: ~60-80 videos (low quality removed)
- **Successfully Added**: ~160-180 high-quality videos
- **Success Rate**: ~70-75%

### Quality Distribution
- **Beginner**: ~40% of videos
- **Intermediate**: ~35% of videos  
- **Advanced**: ~25% of videos

### Quality Scores
- **Average Quality Score**: 65-75/100
- **Average Usefulness Score**: 70-80/100

## 🔄 Integration with WorkflowChallenger

### Use Unified View
```javascript
// Query all videos (curated + scraped)
const allVideos = await query(`
  SELECT * FROM all_videos 
  WHERE tool = $1 AND difficulty = $2
  ORDER BY quality_score DESC, usefulness_score DESC
  LIMIT $3
`, [tool, difficulty, limit]);
```

### Filter by Quality
```javascript
// Only high-quality videos
const qualityVideos = await query(`
  SELECT * FROM scraped_videos 
  WHERE quality_score >= 70 AND usefulness_score >= 70
  ORDER BY view_count DESC
`);
```

### Search by Keywords
```javascript
// Search using extracted keywords
const keywordVideos = await query(`
  SELECT * FROM scraped_videos 
  WHERE keywords @> $1
`, [['automation', 'workflow']]);
```

## 🎛️ Advanced Features

### Content Analysis
- **Tutorial Detection**: Identifies educational content
- **Code Example Detection**: Finds videos with programming examples
- **Series Detection**: Identifies multi-part tutorials
- **Keyword Extraction**: Automatically extracts relevant keywords
- **Tag Generation**: Creates semantic tags for easy filtering

### Performance Optimization
- **Database Indexes**: Optimized for common queries
- **Batch Processing**: Efficient database operations
- **Rate Limiting**: Respectful scraping with delays
- **Error Handling**: Robust error recovery

### Monitoring & Logging
- **Detailed Progress**: Real-time scraping progress
- **Quality Metrics**: Quality and usefulness scores
- **Filter Statistics**: Shows what was filtered and why
- **Success Rates**: Tracks insertion success rates

## 🚨 Troubleshooting

### Common Issues

1. **yt-dlp Not Found**
   ```bash
   pip install yt-dlp
   ```

2. **Database Connection Failed**
   - Check DATABASE_URL in environment
   - Ensure Railway database is accessible
   - Run `npm run update-schema` first

3. **No Videos Found**
   - Check internet connection
   - Verify yt-dlp is working: `yt-dlp --version`
   - Try different search terms

4. **Low Quality Results**
   - Adjust `minViews` threshold
   - Modify quality scoring algorithm
   - Add more specific search terms

### Performance Tips

- **Run During Off-Peak**: Scrape during low-traffic hours
- **Batch Processing**: Process tools separately if needed
- **Monitor Resources**: Watch CPU/memory usage
- **Regular Updates**: Re-run scraping weekly for fresh content

## 📊 Analytics & Monitoring

### Database Queries for Insights

```sql
-- Quality distribution
SELECT difficulty, tool, 
       AVG(quality_score) as avg_quality,
       AVG(usefulness_score) as avg_usefulness,
       COUNT(*) as video_count
FROM scraped_videos 
GROUP BY difficulty, tool;

-- Top performing channels
SELECT channel, 
       COUNT(*) as video_count,
       AVG(quality_score) as avg_quality,
       SUM(view_count) as total_views
FROM scraped_videos 
GROUP BY channel 
ORDER BY avg_quality DESC;

-- Content analysis
SELECT 
  COUNT(*) FILTER (WHERE has_tutorial_content) as tutorials,
  COUNT(*) FILTER (WHERE has_code_examples) as with_code,
  COUNT(*) FILTER (WHERE is_series) as series_videos
FROM scraped_videos;
```

## 🔮 Future Enhancements

- **AI-Powered Analysis**: Use machine learning for better content analysis
- **Sentiment Analysis**: Analyze video comments for quality signals
- **Trend Detection**: Identify trending automation topics
- **Auto-Classification**: Automatically categorize new video types
- **Performance Metrics**: Track video engagement over time

## 📝 License

This scraper is part of the WorkflowChallenger project and follows the same license terms.

---

**Ready to scrape thousands of high-quality automation videos? Run `npm run scrape-intelligent` and watch the magic happen!** 🚀
