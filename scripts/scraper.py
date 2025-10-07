#!/usr/bin/env python3
"""
YouTube Video Scraper
Scrapes YouTube videos using yt-dlp and stores them in PostgreSQL database
"""

import os
import sys
import yt_dlp
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
from dotenv import load_dotenv
from urllib.parse import urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class YouTubeScraper:
    def __init__(self):
        """Initialize the scraper with database connection"""
        load_dotenv()
        self.db_connection = None
        self.search_term = "Automation Challenges"
        self.max_results = 20
        
    def connect_database(self):
        """Connect to PostgreSQL database using credentials from .env"""
        try:
            # Parse DATABASE_URL if available, otherwise use individual variables
            database_url = os.getenv('DATABASE_URL')
            
            if database_url:
                logger.info("Using DATABASE_URL for connection")
                self.db_connection = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            else:
                # Fallback to individual environment variables
                logger.info("Using individual database credentials")
                self.db_connection = psycopg2.connect(
                    host=os.getenv('DB_HOST', 'localhost'),
                    port=os.getenv('DB_PORT', '5432'),
                    database=os.getenv('DB_NAME', 'workflow_automation'),
                    user=os.getenv('DB_USER', 'postgres'),
                    password=os.getenv('DB_PASSWORD', 'password'),
                    cursor_factory=RealDictCursor
                )
            
            logger.info("✅ Successfully connected to PostgreSQL database")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            return False
    
    def create_table_if_not_exists(self):
        """Create scraped_videos table if it doesn't exist"""
        try:
            cursor = self.db_connection.cursor()
            
            create_table_query = """
            CREATE TABLE IF NOT EXISTS scraped_videos (
                id SERIAL PRIMARY KEY,
                video_id VARCHAR(50) UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                view_count BIGINT,
                duration INTEGER,
                channel VARCHAR(255),
                thumbnail_url TEXT,
                video_url TEXT NOT NULL,
                published_at TIMESTAMP,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(video_id)
            );
            """
            
            cursor.execute(create_table_query)
            self.db_connection.commit()
            cursor.close()
            
            logger.info("✅ scraped_videos table created/verified successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to create table: {e}")
            return False
    
    def search_youtube_videos(self):
        """Search YouTube for videos using yt-dlp"""
        try:
            # Configure yt-dlp options for search
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,  # Don't download, just extract metadata
                'max_downloads': self.max_results,
                'ignoreerrors': True,  # Continue on errors
            }
            
            # Search URL for the term
            search_url = f"ytsearch{self.max_results}:{self.search_term}"
            
            logger.info(f"🔍 Searching YouTube for: '{self.search_term}' (max {self.max_results} results)")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract search results
                search_results = ydl.extract_info(search_url, download=False)
                
                if not search_results or 'entries' not in search_results:
                    logger.warning("No search results found")
                    return []
                
                videos = []
                for entry in search_results['entries']:
                    if entry:  # Skip None entries
                        videos.append(entry)
                
                logger.info(f"✅ Found {len(videos)} videos from search")
                return videos
                
        except Exception as e:
            logger.error(f"❌ YouTube search failed: {e}")
            return []
    
    def extract_video_details(self, video_entry):
        """Extract detailed video information using yt-dlp"""
        try:
            video_id = video_entry.get('id', '')
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Get detailed video info
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'ignoreerrors': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                detailed_info = ydl.extract_info(video_url, download=False)
                
                if not detailed_info:
                    return None
                
                # Extract thumbnail URL (get highest quality)
                thumbnails = detailed_info.get('thumbnails', [])
                thumbnail_url = ''
                if thumbnails:
                    # Sort by resolution and get the highest quality
                    thumbnails.sort(key=lambda x: x.get('height', 0) * x.get('width', 0), reverse=True)
                    thumbnail_url = thumbnails[0].get('url', '')
                
                # Extract data
                video_data = {
                    'video_id': video_id,
                    'title': detailed_info.get('title', ''),
                    'description': detailed_info.get('description', ''),
                    'view_count': detailed_info.get('view_count', 0),
                    'duration': detailed_info.get('duration', 0),
                    'channel': detailed_info.get('uploader', ''),
                    'thumbnail_url': thumbnail_url,
                    'video_url': video_url,
                    'published_at': detailed_info.get('upload_date', ''),
                }
                
                return video_data
                
        except Exception as e:
            logger.error(f"❌ Failed to extract details for video {video_entry.get('id', 'unknown')}: {e}")
            return None
    
    def insert_video_to_database(self, video_data):
        """Insert video data into PostgreSQL database"""
        try:
            cursor = self.db_connection.cursor()
            
            # Prepare the insert query with ON CONFLICT handling
            insert_query = """
            INSERT INTO scraped_videos (
                video_id, title, description, view_count, duration, 
                channel, thumbnail_url, video_url, published_at
            ) VALUES (
                %(video_id)s, %(title)s, %(description)s, %(view_count)s, %(duration)s,
                %(channel)s, %(thumbnail_url)s, %(video_url)s, 
                CASE WHEN %(published_at)s = '' THEN NULL ELSE to_timestamp(%(published_at)s, 'YYYYMMDD') END
            )
            ON CONFLICT (video_id) 
            DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                view_count = EXCLUDED.view_count,
                duration = EXCLUDED.duration,
                channel = EXCLUDED.channel,
                thumbnail_url = EXCLUDED.thumbnail_url,
                scraped_at = CURRENT_TIMESTAMP
            RETURNING id, video_id, title;
            """
            
            cursor.execute(insert_query, video_data)
            result = cursor.fetchone()
            self.db_connection.commit()
            cursor.close()
            
            if result:
                logger.info(f"✅ {'Inserted' if 'INSERT' in str(cursor.statusmessage) else 'Updated'} video: {result['title']}")
                return True
            else:
                logger.warning(f"⚠️ No result returned for video: {video_data['title']}")
                return False
                
        except psycopg2.IntegrityError as e:
            logger.warning(f"⚠️ Integrity error for video {video_data['video_id']}: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Database error for video {video_data['video_id']}: {e}")
            return False
    
    def run_scraping(self):
        """Main function to execute the scraping process"""
        try:
            logger.info("🚀 Starting YouTube video scraping process")
            
            # Connect to database
            if not self.connect_database():
                return False
            
            # Create table if needed
            if not self.create_table_if_not_exists():
                return False
            
            # Search for videos
            search_results = self.search_youtube_videos()
            if not search_results:
                logger.warning("No videos found to scrape")
                return False
            
            # Process each video
            successful_inserts = 0
            failed_inserts = 0
            
            for i, video_entry in enumerate(search_results, 1):
                logger.info(f"📹 Processing video {i}/{len(search_results)}: {video_entry.get('title', 'Unknown')}")
                
                # Extract detailed video information
                video_data = self.extract_video_details(video_entry)
                
                if video_data:
                    # Insert into database
                    if self.insert_video_to_database(video_data):
                        successful_inserts += 1
                    else:
                        failed_inserts += 1
                else:
                    failed_inserts += 1
                    logger.warning(f"⚠️ Skipped video due to extraction failure")
            
            # Summary
            logger.info(f"🎉 Scraping completed!")
            logger.info(f"📊 Results: {successful_inserts} successful, {failed_inserts} failed")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Scraping process failed: {e}")
            return False
        
        finally:
            # Close database connection
            if self.db_connection:
                self.db_connection.close()
                logger.info("🔌 Database connection closed")

def main():
    """Main entry point"""
    try:
        scraper = YouTubeScraper()
        success = scraper.run_scraping()
        
        if success:
            logger.info("✅ Scraping process completed successfully")
            sys.exit(0)
        else:
            logger.error("❌ Scraping process failed")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Scraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
