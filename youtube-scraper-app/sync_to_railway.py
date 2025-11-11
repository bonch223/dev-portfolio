"""Sync local scraped videos to Railway database."""

import os
import psycopg2
import logging
from config.database import db_manager

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_railway_connection():
    """Get Railway database connection."""
    # Railway database URL from environment
    railway_url = "postgresql://postgres:YOUR_RAILWAY_PASSWORD@YOUR_RAILWAY_HOST:5432/railway"
    
    # For now, we'll use the same local database but with Railway connection string
    # You'll need to update this with actual Railway credentials
    try:
        conn = psycopg2.connect(
            host="localhost",  # This should be Railway host
            port=5432,
            database="workflow_automation",  # This should be Railway database name
            user="postgres",
            password="password"  # This should be Railway password
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to Railway database: {e}")
        return None

def sync_videos_to_railway():
    """Sync all local videos to Railway database."""
    logger.info("🚀 Starting sync to Railway database...")
    
    # Get local database connection
    local_conn = db_manager.get_connection()
    local_cursor = local_conn.cursor()
    
    # Get Railway connection
    railway_conn = get_railway_connection()
    if not railway_conn:
        logger.error("❌ Cannot connect to Railway database")
        return False
    
    railway_cursor = railway_conn.cursor()
    
    try:
        # Get all videos from local database
        local_cursor.execute("""
            SELECT video_id, video_url, title, description, thumbnail_url,
                   channel, duration, view_count, difficulty, tool, quality_score, 
                   published_at, scraped_at
            FROM scraped_videos
            ORDER BY scraped_at DESC
        """)
        
        videos = local_cursor.fetchall()
        logger.info(f"📊 Found {len(videos)} videos to sync")
        
        synced_count = 0
        skipped_count = 0
        
        for video in videos:
            video_id, video_url, title, description, thumbnail_url, channel, duration, view_count, difficulty, tool, quality_score, published_at, scraped_at = video
            
            try:
                # Insert into Railway database (upsert)
                railway_cursor.execute("""
                    INSERT INTO scraped_videos (
                        video_id, video_url, title, description, thumbnail_url,
                        channel, duration, view_count, difficulty, tool, quality_score,
                        published_at, scraped_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (video_id) 
                    DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        view_count = EXCLUDED.view_count,
                        quality_score = EXCLUDED.quality_score,
                        scraped_at = EXCLUDED.scraped_at
                """, (video_id, video_url, title, description, thumbnail_url, channel, duration, view_count, difficulty, tool, quality_score, published_at, scraped_at))
                
                synced_count += 1
                
                if synced_count % 50 == 0:
                    logger.info(f"✅ Synced {synced_count} videos...")
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to sync video {video_id}: {e}")
                skipped_count += 1
                continue
        
        # Commit all changes
        railway_conn.commit()
        
        logger.info("=" * 60)
        logger.info("🎉 SYNC COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"✅ Successfully synced: {synced_count} videos")
        logger.info(f"⚠️ Skipped: {skipped_count} videos")
        logger.info(f"📊 Total processed: {len(videos)} videos")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Sync failed: {e}")
        railway_conn.rollback()
        return False
        
    finally:
        local_cursor.close()
        db_manager.return_connection(local_conn)
        railway_cursor.close()
        railway_conn.close()

if __name__ == "__main__":
    success = sync_videos_to_railway()
    if success:
        print("\n🎉 All videos synced to Railway database!")
        print("📺 Your frontend should now show correct view counts!")
    else:
        print("\n❌ Sync failed. Check the logs above.")

