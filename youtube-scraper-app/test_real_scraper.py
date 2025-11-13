"""Test the real yt-dlp scraper."""

import sys
import logging
from scrapers.ytdlp_real_scraper import YtDlpRealScraper

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def test_scraper():
    """Test scraping real YouTube videos."""
    print("=" * 60)
    print("Testing REAL YouTube Video Scraper (yt-dlp)")
    print("=" * 60)
    
    scraper = YtDlpRealScraper()
    
    # Test with a single search term
    test_term = "zapier tutorial"
    print(f"\n🔍 Searching for: '{test_term}'")
    print("-" * 60)
    
    videos = scraper.search_videos(test_term, max_results=5)
    
    print("\n" + "=" * 60)
    print(f"📊 Results: Found {len(videos)} REAL videos")
    print("=" * 60)
    
    if videos:
        print("\n✅ SUCCESS! Here are the REAL videos found:\n")
        for i, video in enumerate(videos, 1):
            print(f"{i}. {video['title']}")
            print(f"   Channel: {video['channel_name']}")
            print(f"   Video ID: {video['video_id']}")
            print(f"   URL: https://www.youtube.com/watch?v={video['video_id']}")
            print(f"   Duration: {video['duration_seconds']}s")
            print(f"   Views: {video['view_count']:,}")
            print()
    else:
        print("\n❌ No videos found. This might be due to:")
        print("   - Network issues")
        print("   - YouTube blocking the request")
        print("   - yt-dlp needs updating")
        print("\nTry updating yt-dlp: pip install --upgrade yt-dlp")
    
    return len(videos) > 0

if __name__ == "__main__":
    success = test_scraper()
    sys.exit(0 if success else 1)





