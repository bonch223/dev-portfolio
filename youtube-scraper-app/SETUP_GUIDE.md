# Quick Setup Guide - YouTube Scraper

## Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] PostgreSQL database running
- [ ] Existing `video_cache` table (from workflow automation platform)
- [ ] YouTube Data API v3 key

## Step-by-Step Setup

### 1. Install Python Dependencies (2 minutes)

```bash
cd youtube-scraper-app
pip install -r requirements.txt
```

### 2. Get YouTube API Key (5 minutes)

1. Visit: https://console.cloud.google.com/
2. Create/Select a project
3. Enable "YouTube Data API v3"
4. Create Credentials → API Key
5. Copy the key

**Pro Tip**: Create 2-3 API keys for rotation (10,000 quota each)

### 3. Configure Environment (2 minutes)

Copy and edit the environment file:

```bash
cp env.example .env
notepad .env   # Windows
nano .env      # Linux/Mac
```

Minimum required configuration:

```env
# Your existing database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/workflow_automation

# Your YouTube API key(s)
YOUTUBE_API_KEY_1=AIzaSy...your_key_here
```

### 4. Test Database Connection (1 minute)

```bash
python -c "from config.database import db_manager; print('✅ Connected' if db_manager.test_connection() else '❌ Failed')"
```

If failed:
- Check PostgreSQL is running
- Verify database credentials
- Ensure `video_cache` table exists

### 5. Run the Application (Done!)

```bash
python main.py
```

## First Scrape Guide

### Option A: Quick Test (5 minutes, ~50-100 videos)

1. Open application
2. Select "Zapier" tab
3. **Uncheck all categories** except "Beginner Basics"
4. Click "Scrape Current Tool"
5. Wait ~5 minutes

### Option B: Full Scrape (1-2 hours, 5,000+ videos per tool)

1. Open application
2. Click "Scrape Both Tools"
3. Confirm and wait 1-2 hours
4. Check results in "View Database"

### Option C: Custom Scrape

1. Select specific tool tab
2. Choose categories you want
3. Click "Scrape Current Tool"

## Performance Tuning

### For Fast Scraping

Edit `.env`:

```env
MAX_CONCURRENT_REQUESTS=15
MAX_WORKERS=8
BATCH_INSERT_SIZE=100
```

### For Slower/Safer Scraping

```env
MAX_CONCURRENT_REQUESTS=5
MAX_WORKERS=3
BATCH_INSERT_SIZE=50
```

## Troubleshooting

### "No API keys configured"
→ Check `.env` file has `YOUTUBE_API_KEY_1=your_key`

### "Database connection failed"
→ Verify PostgreSQL is running and credentials are correct

### "API quota exceeded"
→ Add more API keys or wait 24 hours for quota reset

### Application crashes
→ Check `scraper.log` file for error details

## Expected Results

After a successful full scrape:

- **Zapier**: 2,000-3,000 high-quality videos
- **N8N**: 2,000-3,000 high-quality videos
- **Total time**: 1-2 hours
- **API quota used**: ~140,000 units (need 2-3 API keys)

## Next Steps

1. ✅ Run test scrape
2. ✅ Verify data in database viewer
3. ✅ Run full scrape for both tools
4. ✅ Export data if needed
5. ✅ Set up scheduled re-scraping (optional)

## Need Help?

Check `scraper.log` for detailed error messages and troubleshooting info.





