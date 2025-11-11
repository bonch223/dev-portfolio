#!/usr/bin/env python3
"""Test the scraper with dummy data to verify the flow works."""

import sys
import logging
from scrapers.scraper_orchestrator import ScraperOrchestrator

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

def test_scraper():
    """Test the scraper with a simple search."""
    try:
        print("🧪 Testing YouTube scraper...")
        
        # Create orchestrator
        orchestrator = ScraperOrchestrator()
        
        # Test with just one search term
        search_terms = ['zapier tutorial']
        
        print(f"📋 Testing with {len(search_terms)} search terms")
        
        # Create a simple progress callback
        def progress_callback(completed, total, term, videos_found):
            print(f"✅ [{completed}/{total}] '{term}': {videos_found} videos")
        
        # Test scraping
        videos = orchestrator.web_scraper.scrape_parallel(
            search_terms, 
            'zapier',
            progress_callback
        )
        
        print(f"🎉 Test complete! Found {len(videos)} videos")
        
        if videos:
            print("\n📹 Sample videos:")
            for i, video in enumerate(videos[:3], 1):
                print(f"  {i}. {video['title']}")
                print(f"     Channel: {video['channel_name']}")
                print(f"     Views: {video['view_count']}")
                print(f"     Duration: {video['duration_seconds']}s")
                print()
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == '__main__':
    success = test_scraper()
    sys.exit(0 if success else 1)



