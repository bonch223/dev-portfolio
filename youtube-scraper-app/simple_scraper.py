"""
Simple command-line YouTube scraper - minimal and efficient.
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
    """Simple command-line scraper."""
    setup_logging()
    logger = logging.getLogger(__name__)
    
    print("=" * 60)
    print("🎯 Simple Enhanced YouTube Scraper")
    print("=" * 60)
    print()
    
    # Initialize orchestrator
    orchestrator = EnhancedScraperOrchestrator()
    
    # Get user input
    print("Available tools: zapier, n8n, make, power-automate")
    tool_name = input("Enter tool name: ").strip().lower()
    
    if tool_name not in ['zapier', 'n8n', 'make', 'power-automate']:
        print("❌ Invalid tool name!")
        return
    
    print("\nAvailable difficulties: beginner, intermediate, advanced")
    difficulty = input("Enter difficulty: ").strip().lower()
    
    if difficulty not in ['beginner', 'intermediate', 'advanced']:
        print("❌ Invalid difficulty!")
        return
    
    try:
        max_videos = int(input("Enter max videos (1-20): "))
        if max_videos < 1 or max_videos > 20:
            max_videos = 5
    except ValueError:
        max_videos = 5
    
    print(f"\n🚀 Starting {difficulty} video scraping for {tool_name}...")
    print(f"📊 Target: {max_videos} videos")
    print()
    
    # Check current database stats
    stats = orchestrator.get_database_stats(tool_name)
    if 'error' not in stats:
        print("📊 Current database stats:")
        for row in stats['videos_by_difficulty']:
            print(f"   {row[0]}: {row[1]} videos (avg quality: {row[2]:.1f})")
        print(f"   Total: {stats['total_videos']} videos")
        print()
    
    # Start scraping
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
            print("\n📊 Updated database stats:")
            stats = orchestrator.get_database_stats(tool_name)
            if 'error' not in stats:
                for row in stats['videos_by_difficulty']:
                    print(f"   {row[0]}: {row[1]} videos (avg quality: {row[2]:.1f})")
                print(f"   Total: {stats['total_videos']} videos")
            
        else:
            print(f"❌ FAILED! Scraping failed after {duration:.2f} seconds")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        logger.error(f"Scraping error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Scraping completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()




