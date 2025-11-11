"""Import exported videos to Railway database."""

import csv
import psycopg2
import logging
import os

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_railway_connection():
    """Get Railway database connection using environment variables."""
    
    # Railway database connection details
    # You'll need to set these environment variables or update them directly
    railway_config = {
        'host': os.getenv('RAILWAY_DB_HOST', 'viaduct.proxy.rlwy.net'),
        'port': os.getenv('RAILWAY_DB_PORT', '5432'),
        'database': os.getenv('RAILWAY_DB_NAME', 'railway'),
        'user': os.getenv('RAILWAY_DB_USER', 'postgres'),
        'password': os.getenv('RAILWAY_DB_PASSWORD', 'YOUR_RAILWAY_PASSWORD_HERE')
    }
    
    logger.info("🔗 Connecting to Railway database...")
    logger.info(f"Host: {railway_config['host']}")
    logger.info(f"Database: {railway_config['database']}")
    
    try:
        conn = psycopg2.connect(**railway_config)
        logger.info("✅ Connected to Railway database!")
        return conn
    except Exception as e:
        logger.error(f"❌ Failed to connect to Railway database: {e}")
        logger.error("💡 Make sure to set Railway database credentials in environment variables")
        return None

def import_videos_from_csv():
    """Import videos from CSV to Railway database."""
    logger.info("🚀 Starting import to Railway database...")
    
    # Check if CSV file exists
    csv_filename = "scraped_videos_export.csv"
    if not os.path.exists(csv_filename):
        logger.error(f"❌ CSV file {csv_filename} not found!")
        return False
    
    # Get Railway connection
    conn = get_railway_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        imported_count = 0
        skipped_count = 0
        
        with open(csv_filename, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                try:
                    # Insert video into Railway database
                    cursor.execute("""
                        INSERT INTO scraped_videos (
                            video_id, video_url, title, description, thumbnail_url,
                            channel, duration, view_count, difficulty, tool, quality_score,
                            published_at, scraped_at
                        ) VALUES (
                            %(video_id)s, %(video_url)s, %(title)s, %(description)s, %(thumbnail_url)s,
                            %(channel)s, %(duration)s, %(view_count)s, %(difficulty)s, %(tool)s, %(quality_score)s,
                            %(published_at)s, %(scraped_at)s
                        )
                        ON CONFLICT (video_id) 
                        DO UPDATE SET
                            title = EXCLUDED.title,
                            description = EXCLUDED.description,
                            view_count = EXCLUDED.view_count,
                            quality_score = EXCLUDED.quality_score,
                            scraped_at = EXCLUDED.scraped_at
                    """, row)
                    
                    imported_count += 1
                    
                    if imported_count % 50 == 0:
                        logger.info(f"✅ Imported {imported_count} videos...")
                        
                except Exception as e:
                    logger.warning(f"⚠️ Failed to import video {row.get('video_id', 'unknown')}: {e}")
                    skipped_count += 1
                    continue
        
        # Commit all changes
        conn.commit()
        
        logger.info("=" * 60)
        logger.info("🎉 IMPORT COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"✅ Successfully imported: {imported_count} videos")
        logger.info(f"⚠️ Skipped: {skipped_count} videos")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Import failed: {e}")
        conn.rollback()
        return False
        
    finally:
        cursor.close()
        conn.close()

def test_railway_connection():
    """Test Railway database connection and show sample data."""
    conn = get_railway_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        # Test query
        cursor.execute("SELECT COUNT(*) FROM scraped_videos")
        count = cursor.fetchone()[0]
        logger.info(f"📊 Current videos in Railway database: {count}")
        
        # Show sample videos
        cursor.execute("""
            SELECT video_id, title, view_count, difficulty, tool
            FROM scraped_videos
            ORDER BY view_count DESC
            LIMIT 3
        """)
        
        videos = cursor.fetchall()
        logger.info("📺 Sample videos in Railway database:")
        for video in videos:
            video_id, title, view_count, difficulty, tool = video
            logger.info(f"  - {title[:50]}... ({view_count:,} views, {difficulty}, {tool})")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test query failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚂 IMPORTING VIDEOS TO RAILWAY DATABASE")
    print("=" * 60)
    
    # First, test the connection
    print("🔍 Testing Railway database connection...")
    if not test_railway_connection():
        print("\n❌ Cannot connect to Railway database.")
        print("💡 Please check your Railway database credentials:")
        print("   - RAILWAY_DB_HOST")
        print("   - RAILWAY_DB_PORT") 
        print("   - RAILWAY_DB_NAME")
        print("   - RAILWAY_DB_USER")
        print("   - RAILWAY_DB_PASSWORD")
        exit(1)
    
    # Import the videos
    print("\n📥 Starting import process...")
    success = import_videos_from_csv()
    
    if success:
        print("\n🎉 SUCCESS! All videos imported to Railway database!")
        print("📺 Your frontend should now show correct view counts!")
        
        # Test again to confirm
        print("\n🔍 Verifying import...")
        test_railway_connection()
    else:
        print("\n❌ Import failed. Check the logs above.")

