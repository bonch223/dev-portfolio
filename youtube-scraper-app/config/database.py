"""Database connection and query utilities."""

import psycopg2
from psycopg2.extras import RealDictCursor, execute_batch
from psycopg2 import pool
import logging
from config.settings import DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages database connections and operations."""
    
    def __init__(self):
        self.connection_pool = None
        
    def initialize_pool(self, minconn=1, maxconn=10):
        """Initialize connection pool for better performance."""
        try:
            if DATABASE_URL:
                self.connection_pool = pool.SimpleConnectionPool(
                    minconn, maxconn,
                    DATABASE_URL
                )
            else:
                self.connection_pool = pool.SimpleConnectionPool(
                    minconn, maxconn,
                    host=DB_HOST,
                    port=DB_PORT,
                    database=DB_NAME,
                    user=DB_USER,
                    password=DB_PASSWORD
                )
            logger.info("✅ Database connection pool initialized")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize database pool: {e}")
            return False
    
    def get_connection(self):
        """Get a connection from the pool."""
        if not self.connection_pool:
            self.initialize_pool()
        return self.connection_pool.getconn()
    
    def return_connection(self, conn):
        """Return a connection to the pool."""
        if self.connection_pool:
            self.connection_pool.putconn(conn)
    
    def close_pool(self):
        """Close all connections in the pool."""
        if self.connection_pool:
            self.connection_pool.closeall()
            logger.info("🔌 Database connection pool closed")
    
    def test_connection(self):
        """Test database connection."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            self.return_connection(conn)
            logger.info("✅ Database connection test successful")
            return True
        except Exception as e:
            logger.error(f"❌ Database connection test failed: {e}")
            return False
    
    def insert_videos_batch(self, videos):
        """Insert multiple videos using batch operation for performance."""
        if not videos:
            return 0
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Insert into scraped_videos table (used by backend)
        query = """
        INSERT INTO scraped_videos (
            video_id, video_url, title, description, thumbnail_url,
            channel, duration, view_count,
            difficulty, tool, quality_score, published_at
        ) VALUES (
            %(video_id)s, %(video_url)s, %(title)s, %(description)s, %(thumbnail_url)s,
            %(channel_title)s, %(duration_seconds)s, %(view_count)s,
            %(difficulty)s, %(tool)s, %(quality_score)s, %(published_at)s
        )
        ON CONFLICT (video_id) 
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            thumbnail_url = EXCLUDED.thumbnail_url,
            channel = EXCLUDED.channel,
            scraped_at = CURRENT_TIMESTAMP
        """
        
        try:
            # Debug first video to see what fields we have
            if videos:
                logger.debug(f"First video fields: {list(videos[0].keys())}")
                logger.debug(f"First video sample: video_id={videos[0].get('video_id')}, quality_score={videos[0].get('quality_score')}, channel_title={videos[0].get('channel_title')}")
            
            execute_batch(cursor, query, videos, page_size=50)
            conn.commit()
            inserted_count = cursor.rowcount
            cursor.close()
            self.return_connection(conn)
            return inserted_count
        except Exception as e:
            logger.error(f"❌ Batch insert failed: {e}")
            logger.error(f"❌ First video data: {videos[0] if videos else 'No videos'}")
            import traceback
            logger.error(traceback.format_exc())
            conn.rollback()
            cursor.close()
            self.return_connection(conn)
            return 0
    
    def get_video_count(self, tool=None, difficulty=None):
        """Get count of videos in database."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT COUNT(*) FROM scraped_videos WHERE 1=1"
        params = []
        
        if tool:
            query += " AND tool = %s"
            params.append(tool)
        
        if difficulty:
            query += " AND difficulty = %s"
            params.append(difficulty)
        
        try:
            cursor.execute(query, params)
            count = cursor.fetchone()[0]
            cursor.close()
            self.return_connection(conn)
            return count
        except Exception as e:
            logger.error(f"❌ Failed to get video count: {e}")
            cursor.close()
            self.return_connection(conn)
            return 0
    
    def check_video_exists(self, video_id):
        """Check if a video already exists in database."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT 1 FROM video_cache WHERE video_id = %s LIMIT 1"
        
        try:
            cursor.execute(query, (video_id,))
            exists = cursor.fetchone() is not None
            cursor.close()
            self.return_connection(conn)
            return exists
        except Exception as e:
            logger.error(f"❌ Failed to check video existence: {e}")
            cursor.close()
            self.return_connection(conn)
            return False
    
    def get_videos(self, tool=None, difficulty=None, limit=100, offset=0):
        """Retrieve videos from database."""
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT video_id, title, description, thumbnail_url, channel_title,
               cached_at as published_at, duration_seconds, difficulty, tool
        FROM video_cache
        WHERE 1=1
        """
        params = []
        
        if tool:
            query += " AND tool = %s"
            params.append(tool)
        
        if difficulty:
            query += " AND difficulty = %s"
            params.append(difficulty)
        
        query += " ORDER BY cached_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        try:
            cursor.execute(query, params)
            videos = cursor.fetchall()
            cursor.close()
            self.return_connection(conn)
            return videos
        except Exception as e:
            logger.error(f"❌ Failed to retrieve videos: {e}")
            cursor.close()
            self.return_connection(conn)
            return []
    
    def get_statistics(self):
        """Get database statistics."""
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        queries = {
            'total': "SELECT COUNT(*) as count FROM video_cache",
            'by_tool': "SELECT tool, COUNT(*) as count FROM video_cache GROUP BY tool",
            'by_difficulty': "SELECT difficulty, COUNT(*) as count FROM video_cache GROUP BY difficulty"
        }
        
        stats = {}
        
        try:
            for key, query in queries.items():
                cursor.execute(query)
                stats[key] = cursor.fetchall()
            
            cursor.close()
            self.return_connection(conn)
            return stats
        except Exception as e:
            logger.error(f"❌ Failed to get statistics: {e}")
            cursor.close()
            self.return_connection(conn)
            return {}


# Global database manager instance
db_manager = DatabaseManager()

