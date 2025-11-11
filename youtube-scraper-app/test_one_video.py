"""Test with just one search term to see the exact error."""

import logging
from scrapers.scraper_orchestrator import ScraperOrchestrator

logging.basicConfig(
    level=logging.DEBUG,
    format='%(levelname)s - %(message)s'
)

orchestrator = ScraperOrchestrator()

# Test with minimal search
from config import tools_config
tools_config.get_all_search_terms = lambda tool: ['zapier tutorial']  # Just one term

orchestrator.scrape_tool('zapier', max_videos_per_term=2)


