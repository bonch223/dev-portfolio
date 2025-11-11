"""
Test script for beginner video scraping.
"""

import sys
import os
import logging
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers.enhanced_orchestrator import EnhancedScraperOrchestrator
from utils.logger import setup_logger as setup_logging

def main():
    """Test beginner video scraping."""
    setup_logging()
    logger = logging.getLogger(__name__)
    
    print("=" * 80)
    print("🎯 TESTING BEGINNER VIDEO SCRAPING")
    print("=" * 80)
    print()
    
    # Initialize enhanced orchestrator
    orchestrator = EnhancedScraperOrchestrator()
    
    # Test parameters
    tool_name = "zapier"
    difficulty = "beginner"
    max_videos = 5
    
    print(f"📋 Test Parameters:")
    print(f"   Tool: {tool_name}")
    print(f"   Difficulty: {difficulty}")
    print(f"   Max Videos: {max_videos}")
    print()
    
    # Check current database stats
    print("📊 Current Database Stats:")
    stats = orchestrator.get_database_stats(tool_name)
    if 'error' not in stats:
        for row in stats['videos_by_difficulty']:
            print(f"   {row[0]}: {row[1]} videos (avg quality: {row[2]:.1f})")
        print(f"   Total: {stats['total_videos']} videos")
    else:
        print(f"   Error: {stats['error']}")
    print()
    
    # Start scraping
    print(f"🚀 Starting {difficulty} video scraping...")
    start_time = datetime.now()
    
    try:
        success = orchestrator.scrape_difficulty_specific(
            tool_name=tool_name,
            difficulty=difficulty,
            max_videos=max_videos
        )
        
        duration = (datetime.now() - start_time).total_seconds()
        
        if success:
            print(f"✅ SUCCESS! Scraping completed in {duration:.2f} seconds")
            
            # Show updated stats
            print("\n📊 Updated Database Stats:")
            stats = orchestrator.get_database_stats(tool_name)
            if 'error' not in stats:
                for row in stats['videos_by_difficulty']:
                    print(f"   {row[0]}: {row[1]} videos (avg quality: {row[2]:.1f})")
                print(f"   Total: {stats['total_videos']} videos")
            
        else:
            print(f"❌ FAILED! Scraping failed after {duration:.2f} seconds")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        logger.error(f"Test scraping error: {e}")
    
    print("\n" + "=" * 80)
    print("🎉 Test completed!")
    print("=" * 80)

if __name__ == "__main__":
    main()
