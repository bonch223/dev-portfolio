# YouTube Video Scraper

A Python script that scrapes YouTube videos using yt-dlp and stores them in a PostgreSQL database.

## Features

- 🔍 **YouTube Search**: Uses yt-dlp to search for videos without API limits
- 📊 **Rich Metadata**: Extracts video_id, title, description, view_count, duration, channel, thumbnails
- 🗄️ **PostgreSQL Integration**: Stores data in your existing database
- 🔄 **Duplicate Handling**: Automatically handles duplicate videos (upsert)
- 📝 **Detailed Logging**: Comprehensive logging for monitoring
- ⚡ **Fast & Reliable**: Uses yt-dlp's proven extraction methods

## Setup

### 1. Install Dependencies

**Windows:**
```bash
cd scripts
setup-scraper.bat
```

**Linux/Mac:**
```bash
cd scripts
chmod +x setup-scraper.sh
./setup-scraper.sh
```

**Manual:**
```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Make sure your `.env` file contains your database credentials:

```env
DATABASE_URL=postgresql://user:password@host:port/database
# OR individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workflow_automation
DB_USER=postgres
DB_PASSWORD=password
```

## Usage

### Basic Usage
```bash
cd scripts
python scraper.py
```

### Customize Search Term
Edit the script and change:
```python
self.search_term = "Your Custom Search Term"
self.max_results = 20  # Number of videos to scrape
```

## Database Schema

The script creates a `scraped_videos` table with the following structure:

```sql
CREATE TABLE scraped_videos (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    view_count BIGINT,
    duration INTEGER,
    channel VARCHAR(255),
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration with WorkflowChallenger

### Option 1: Direct Integration
Modify your backend to also search the `scraped_videos` table:

```javascript
// In your video search route
const scrapedVideos = await query(`
    SELECT video_id as id, title, description, thumbnail_url as thumbnail,
           channel as channelTitle, view_count as viewCount, duration,
           'beginner' as difficulty, 'automation' as tool
    FROM scraped_videos 
    WHERE title ILIKE $1 OR description ILIKE $1
    ORDER BY view_count DESC
    LIMIT $2
`, [`%${searchQuery}%`, limit]);
```

### Option 2: Merge with Existing Cache
Copy scraped videos to your existing `video_cache` table:

```sql
INSERT INTO video_cache (
    video_id, video_url, title, description, thumbnail_url,
    channel_title, duration_seconds, view_count, difficulty, tool, search_query
)
SELECT 
    video_id, video_url, title, description, thumbnail_url,
    channel, duration, view_count, 'beginner', 'automation', 'scraped'
FROM scraped_videos
ON CONFLICT (video_id) DO NOTHING;
```

## Example Output

```
2024-01-15 10:30:15 - INFO - 🚀 Starting YouTube video scraping process
2024-01-15 10:30:15 - INFO - ✅ Successfully connected to PostgreSQL database
2024-01-15 10:30:15 - INFO - ✅ scraped_videos table created/verified successfully
2024-01-15 10:30:15 - INFO - 🔍 Searching YouTube for: 'Automation Challenges' (max 20 results)
2024-01-15 10:30:16 - INFO - ✅ Found 20 videos from search
2024-01-15 10:30:16 - INFO - 📹 Processing video 1/20: Top 10 Automation Challenges for Beginners
2024-01-15 10:30:17 - INFO - ✅ Inserted video: Top 10 Automation Challenges for Beginners
...
2024-01-15 10:30:45 - INFO - 🎉 Scraping completed!
2024-01-15 10:30:45 - INFO - 📊 Results: 18 successful, 2 failed
```

## Advantages Over YouTube API

1. **No Quota Limits**: yt-dlp doesn't use YouTube's API
2. **More Reliable**: Less prone to rate limiting
3. **Richer Data**: Access to more metadata
4. **Cost Effective**: Free to use
5. **Offline Capable**: Works without API keys

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `.env` file has correct credentials
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **yt-dlp Extraction Failed**
   - YouTube may have changed their structure
   - Update yt-dlp: `pip install --upgrade yt-dlp`
   - Check internet connection

3. **No Videos Found**
   - Try a different search term
   - Check if YouTube is accessible
   - Verify yt-dlp is working: `yt-dlp --version`

### Logs
The script provides detailed logging. Check the console output for specific error messages.

## Customization

### Change Search Terms
```python
self.search_term = "Zapier Tutorial"
self.max_results = 50
```

### Add More Metadata
Extend the `extract_video_details` method to capture additional fields like:
- Tags
- Categories  
- Like/Dislike counts
- Comments count

### Schedule Regular Scraping
Use cron (Linux/Mac) or Task Scheduler (Windows) to run the script regularly:

```bash
# Run every day at 2 AM
0 2 * * * cd /path/to/scripts && python scraper.py
```

## Security Notes

- Keep your database credentials secure
- Don't commit `.env` files to version control
- Consider using environment variables in production
- Monitor database usage to avoid overwhelming your server

## License

This script is part of the WorkflowChallenger project and follows the same license terms.
