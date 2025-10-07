-- Simplified Database Schema for Workflow Challenger
-- Essential fields for video caching and search

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS video_cache CASCADE;

-- Simple but complete video cache table
CREATE TABLE video_cache (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_title VARCHAR(255),
    duration_seconds INTEGER,
    view_count BIGINT,
    difficulty VARCHAR(20) NOT NULL,
    tool VARCHAR(50) NOT NULL,
    search_query TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups and search
CREATE INDEX idx_video_cache_tool_difficulty ON video_cache(tool, difficulty);
CREATE INDEX idx_video_cache_title ON video_cache USING gin(to_tsvector('english', title));
CREATE INDEX idx_video_cache_description ON video_cache USING gin(to_tsvector('english', description));
CREATE INDEX idx_video_cache_tool ON video_cache(tool);
CREATE INDEX idx_video_cache_cached_at ON video_cache(cached_at);
