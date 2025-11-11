"""Export local scraped videos to CSV for Railway import."""

import csv
import logging
from config.database import db_manager

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def export_videos_to_csv():
    """Export all local videos to CSV file."""
    logger.info("🚀 Starting video export to CSV...")
    
    # Get local database connection
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    
    try:
        # Get all videos from local database
        cursor.execute("""
            SELECT video_id, video_url, title, description, thumbnail_url,
                   channel, duration, view_count, difficulty, tool, quality_score, 
                   published_at, scraped_at
            FROM scraped_videos
            ORDER BY scraped_at DESC
        """)
        
        videos = cursor.fetchall()
        logger.info(f"📊 Found {len(videos)} videos to export")
        
        # Export to CSV
        csv_filename = "scraped_videos_export.csv"
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write header
            writer.writerow([
                'video_id', 'video_url', 'title', 'description', 'thumbnail_url',
                'channel', 'duration', 'view_count', 'difficulty', 'tool', 'quality_score',
                'published_at', 'scraped_at'
            ])
            
            # Write video data
            for video in videos:
                writer.writerow(video)
        
        logger.info("=" * 60)
        logger.info("🎉 EXPORT COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"✅ Exported {len(videos)} videos to {csv_filename}")
        logger.info("📁 You can now import this file to Railway database")
        
        return csv_filename
        
    except Exception as e:
        logger.error(f"❌ Export failed: {e}")
        return None
        
    finally:
        cursor.close()
        db_manager.return_connection(conn)

def show_sample_data():
    """Show sample of exported data."""
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT video_id, title, view_count, difficulty, tool
            FROM scraped_videos
            ORDER BY view_count DESC
            LIMIT 5
        """)
        
        videos = cursor.fetchall()
        
        print("\n📺 Sample videos with highest view counts:")
        print("-" * 80)
        for video in videos:
            video_id, title, view_count, difficulty, tool = video
            print(f"ID: {video_id}")
            print(f"Title: {title[:60]}...")
            print(f"Views: {view_count:,}")
            print(f"Difficulty: {difficulty}")
            print(f"Tool: {tool}")
            print("-" * 80)
            
    except Exception as e:
        logger.error(f"❌ Failed to show sample data: {e}")
    finally:
        cursor.close()
        db_manager.return_connection(conn)

if __name__ == "__main__":
    print("🎬 EXPORTING SCRAPED VIDEOS TO CSV")
    print("=" * 60)
    
    # Show sample data first
    show_sample_data()
    
    # Export to CSV
    csv_file = export_videos_to_csv()
    
    if csv_file:
        print(f"\n✅ Success! Check {csv_file} for the exported data.")
        print("\n📋 Next steps:")
        print("1. Import this CSV to Railway database")
        print("2. Update Railway backend to use the new data")
        print("3. Your frontend will show correct view counts!")
    else:
        print("\n❌ Export failed. Check the logs above.")

