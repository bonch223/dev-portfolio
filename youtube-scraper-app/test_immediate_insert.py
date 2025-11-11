"""Test immediate insertion with debug logging."""

import logging
from scrapers.scraper_orchestrator import ScraperOrchestrator

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

orchestrator = ScraperOrchestrator()

# Test with just 2 search terms
from config.tools_config import get_all_search_terms
search_terms = ['zapier tutorial', 'zapier beginner']

print("=" * 80)
print("TESTING IMMEDIATE INSERTION WITH DEBUG LOGGING")
print("=" * 80)
print()
print(f"Testing with {len(search_terms)} search terms")
print()

orchestrator.scrape_tool(
    'zapier',
    max_videos_per_term=5  # Just 5 videos per term for quick test
)

print()
print("=" * 80)
print("TEST COMPLETE - Check database for videos")
print("=" * 80)


