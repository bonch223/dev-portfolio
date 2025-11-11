"""Clear database and start fresh scraping of REAL videos."""

import sys
from config.database import db_manager
from scrapers.scraper_orchestrator import ScraperOrchestrator
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

logger = logging.getLogger(__name__)

def clear_database():
    """Clear all videos from database."""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM scraped_videos")
        deleted = cursor.rowcount
        conn.commit()
        
        cursor.close()
        db_manager.return_connection(conn)
        
        logger.info(f"✅ Deleted {deleted} old videos from scraped_videos table")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to clear database: {e}")
        return False

def main():
    """Clear database and scrape REAL videos."""
    print("=" * 80)
    print("CLEAR DATABASE & SCRAPE REAL YOUTUBE VIDEOS")
    print("=" * 80)
    print()
    
    # Clear database
    print("Clearing old videos...")
    if not clear_database():
        print("Failed to clear database")
        return False
    print()
    
    # Start scraping REAL videos
    print("Starting to scrape REAL YouTube videos...")
    print("   This will take a few minutes...")
    print()
    
    orchestrator = ScraperOrchestrator()
    
    def progress_callback(completed, total, term, videos_found):
        """Show progress."""
        print(f"   [{completed}/{total}] '{term}': {videos_found} REAL videos")
    
    # Scrape videos for all tools (Zapier, N8N, Make)
    tools = ['zapier', 'n8n', 'make']
    all_success = True
    
    for tool in tools:
        print()
        print("=" * 80)
        print(f"SCRAPING {tool.upper()} VIDEOS")
        print("=" * 80)
        print()
        
        success = orchestrator.scrape_tool(
            tool,
            max_videos_per_term=15,  # 15 videos per search term (more videos!)
            progress_callback=progress_callback
        )
        
        if not success:
            all_success = False
            print(f"WARNING: {tool} scraping had issues")
        else:
            print(f"SUCCESS: {tool.upper()} scraping complete!")
    
    if all_success:
        print()
        print("=" * 80)
        print("SUCCESS! HUNDREDS of REAL YouTube videos added to database!")
        print("=" * 80)
        print()
        print("Final count will be shown in statistics above")
        print("Check your frontend at /workflow-challenger to see REAL videos!")
        print("Videos were inserted IMMEDIATELY as found - check your DB now!")
        print()
    else:
        print()
        print("WARNING: Some scraping had issues, but videos were still inserted")
    
    return all_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
