-- Fix video_cache table for YouTube Scraper
-- Run this SQL in your Railway PostgreSQL database
-- This ensures compatibility with existing backend (simpleVideoCache.js)

-- Add missing columns if they don't exist (matching existing backend schema)
ALTER TABLE video_cache 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS channel_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS search_query TEXT,
ADD COLUMN IF NOT EXISTS tool VARCHAR(50),
ADD COLUMN IF NOT EXISTS cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_cache_tool ON video_cache(tool);
CREATE INDEX IF NOT EXISTS idx_video_cache_difficulty ON video_cache(difficulty);
CREATE INDEX IF NOT EXISTS idx_video_cache_search_query ON video_cache(search_query);
CREATE INDEX IF NOT EXISTS idx_video_cache_cached_at ON video_cache(cached_at);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'video_cache'
ORDER BY ordinal_position;

