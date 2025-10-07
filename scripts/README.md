# Video Management Scripts

This directory contains scripts for managing YouTube videos in the Workflow Challenger database.

## Scripts Available

### 1. `add-best-videos.js`
**Purpose**: Finds and adds the highest quality YouTube videos for each automation tool using YouTube API.

**Features**:
- Searches YouTube API for the best videos
- Automatically detects video metadata (duration, views, etc.)
- Adds videos to database with proper categorization
- Handles API rate limiting and errors gracefully

**Usage**:
```bash
# From backend directory
npm run add-best-videos
```

**Requirements**:
- `YOUTUBE_API_KEY` environment variable must be set
- Database connection configured
- Internet connection for YouTube API calls

### 2. `add-curated-videos.js`
**Purpose**: Adds pre-selected high-quality videos to the database without requiring YouTube API calls.

**Features**:
- No YouTube API dependency
- Uses curated list of best videos
- Fast execution
- Perfect for when API quota is exhausted

**Usage**:
```bash
# From backend directory
npm run add-curated-videos
```

**Requirements**:
- Database connection configured
- No internet connection required

## Tools Covered

Both scripts add videos for these automation tools:

### 1. **Zapier**
- **Beginner**: Complete automation guide for newcomers
- **Intermediate**: Filters and conditions tutorial
- **Advanced**: Multi-step workflow automation

### 2. **n8n**
- **Beginner**: Workflow automation fundamentals
- **Intermediate**: Error handling and debugging
- **Advanced**: Custom nodes and complex logic

### 3. **Make.com**
- **Beginner**: Complete tutorial for beginners
- **Intermediate**: Data transformation and mapping
- **Advanced**: Complex automation architectures

## Database Schema

Videos are added to the `video_cache` table with the following structure:

```sql
CREATE TABLE video_cache (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_title VARCHAR(255),
    duration_seconds INTEGER,
    view_count BIGINT,
    difficulty VARCHAR(20) NOT NULL,
    tool VARCHAR(50) NOT NULL,
    search_query TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Setup

### Required Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/workflow_automation

# YouTube API (for add-best-videos.js only)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Database Setup

Make sure your database is set up with the correct schema:

```bash
# From backend directory
npm run setup-db
```

## Usage Examples

### Add Videos Using YouTube API
```bash
cd backend
npm run add-best-videos
```

### Add Pre-curated Videos
```bash
cd backend
npm run add-curated-videos
```

### Check Database Connection
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM video_cache;"
```

## Video Selection Criteria

The scripts prioritize videos based on:

1. **Relevance**: Matches tool-specific search terms
2. **Quality**: High view counts and engagement
3. **Recency**: Videos from 2020 onwards
4. **Duration**: Comprehensive tutorials (15+ minutes)
5. **Channel Authority**: From official or reputable channels
6. **Difficulty Level**: Properly categorized by skill level

## Troubleshooting

### Common Issues

1. **YouTube API Quota Exceeded**
   ```bash
   # Use curated videos instead
   npm run add-curated-videos
   ```

2. **Database Connection Error**
   ```bash
   # Check environment variables
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL -c "SELECT NOW();"
   ```

3. **Permission Denied**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.js
   ```

### Logs and Monitoring

Both scripts provide detailed logging:

- ✅ Success indicators
- ❌ Error messages
- 📊 Statistics and summaries
- 🔍 Search queries and results

## Customization

### Adding New Tools

To add videos for a new automation tool:

1. Edit the `BEST_VIDEOS` or `CURATED_VIDEOS` objects in the respective script
2. Add tool-specific search terms and video configurations
3. Run the script to populate the database

### Modifying Video Criteria

Adjust the search parameters in `add-best-videos.js`:
- Change `maxResults` for more/fewer videos per search
- Modify `publishedAfter` date for recency requirements
- Update `videoCategoryId` for different content categories

## Performance Notes

- **API Script**: ~3-5 minutes (depends on API response time)
- **Curated Script**: ~30 seconds (no API calls)
- **Database Operations**: Optimized with proper indexing
- **Rate Limiting**: Built-in delays to respect API limits

## Security Considerations

- API keys are loaded from environment variables
- Database credentials are never logged
- Input sanitization prevents SQL injection
- Error messages don't expose sensitive information