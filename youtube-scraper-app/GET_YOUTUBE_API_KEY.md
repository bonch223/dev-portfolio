# How to Get a YouTube Data API Key

To scrape real YouTube videos for your learning platform, you need a YouTube Data API key.

## Steps to Get API Key:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click "Select a project" or "New Project"
- Give it a name like "YouTube Scraper"

### 3. Enable YouTube Data API v3
- Go to "APIs & Services" > "Library"
- Search for "YouTube Data API v3"
- Click on it and press "Enable"

### 4. Create API Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Copy the generated API key

### 5. Add to Your Project
1. Open `youtube-scraper-app/.env` file
2. Replace `your_youtube_api_key_here` with your actual API key:
   ```
   YOUTUBE_API_KEY_1=YOUR_ACTUAL_API_KEY_HERE
   ```

## Important Notes:

### API Quotas:
- **Free tier**: 10,000 quota units per day
- **Search**: 100 quota units per request
- **Video details**: 1 quota unit per video
- **Plan accordingly**: ~100 searches per day maximum

### Best Practices:
- Use specific search terms (e.g., "zapier tutorial beginner")
- Limit results per search (10-20 videos)
- Add delays between requests
- Monitor quota usage

### Educational Use:
- YouTube allows API usage for educational purposes
- Your platform helps learners find quality content
- You're not redistributing videos, just metadata
- This is fair use for educational purposes

## Ready to Scrape Real Videos!

Once you add your API key, the scraper will find real YouTube videos that learners can watch to learn Zapier, N8N, and other automation tools.

Your platform will become a valuable resource for people wanting to learn automation! 🎓




