#!/usr/bin/env python3
"""Fix database schema for YouTube scraper compatibility."""

from config.database import db_manager

def fix_database():
    """Add missing columns and indexes to video_cache table."""
    
    print("🔧 Fixing database schema...")
    print("-" * 60)
    
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    
    try:
        # Add missing columns
        print("\n📋 Adding missing columns...")
        cursor.execute("""
            ALTER TABLE video_cache 
            ADD COLUMN IF NOT EXISTS video_url TEXT,
            ADD COLUMN IF NOT EXISTS channel_title VARCHAR(255),
            ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner',
            ADD COLUMN IF NOT EXISTS search_query TEXT,
            ADD COLUMN IF NOT EXISTS tool VARCHAR(50),
            ADD COLUMN IF NOT EXISTS cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """)
        conn.commit()
        print("✅ Columns added successfully")
        
        # Create indexes
        print("\n📊 Creating indexes...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_video_cache_tool ON video_cache(tool)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_video_cache_difficulty ON video_cache(difficulty)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_video_cache_search_query ON video_cache(search_query)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_video_cache_cached_at ON video_cache(cached_at)
        """)
        conn.commit()
        print("✅ Indexes created successfully")
        
        # Verify structure
        print("\n📋 Current table structure:")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'video_cache'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        for col in columns:
            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
            print(f"  ✓ {col[0]:<20} {col[1]:<20} {nullable}")
        
        # Get stats
        cursor.execute("SELECT COUNT(*) FROM video_cache")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total videos in database: {count}")
        
        print("\n" + "=" * 60)
        print("✅ Database schema fixed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        db_manager.return_connection(conn)
    
    return True

if __name__ == '__main__':
    if db_manager.initialize_pool():
        fix_database()
        db_manager.close_pool()
    else:
        print("❌ Failed to connect to database")






