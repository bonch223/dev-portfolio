-- Workflow Automation Platform Database Schema
-- PostgreSQL Database for video caching and user management

-- Create database (run this manually if needed)
-- CREATE DATABASE workflow_automation;

-- Video cache table for storing YouTube video data
CREATE TABLE IF NOT EXISTS video_cache (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_name VARCHAR(255),
    channel_id VARCHAR(50),
    published_at TIMESTAMP,
    duration_seconds INTEGER,
    difficulty VARCHAR(20) DEFAULT 'beginner',
    search_query TEXT,
    tool VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0
);

-- Series detection table for grouping related videos
CREATE TABLE IF NOT EXISTS video_series (
    id SERIAL PRIMARY KEY,
    series_title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    series_type VARCHAR(50), -- 'part', 'day', 'episode', etc.
    total_videos INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link videos to series
CREATE TABLE IF NOT EXISTS video_series_members (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) REFERENCES video_cache(video_id) ON DELETE CASCADE,
    series_id INTEGER REFERENCES video_series(id) ON DELETE CASCADE,
    series_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, series_id)
);

-- Users table for authentication and progress tracking
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    preferred_tool VARCHAR(50),
    skill_level VARCHAR(20) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(50) REFERENCES video_cache(video_id) ON DELETE CASCADE,
    watched_duration INTEGER DEFAULT 0, -- seconds watched
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    estimated_time INTEGER, -- minutes
    tools_required TEXT[], -- array of required tools
    prerequisites TEXT[],
    tags TEXT[],
    created_by INTEGER REFERENCES users(id),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User challenge submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    submission_url TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- User portfolio items
CREATE TABLE IF NOT EXISTS user_portfolio (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_url TEXT,
    github_url TEXT,
    tools_used TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search analytics for improving recommendations
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    search_query TEXT NOT NULL,
    tool VARCHAR(50),
    difficulty VARCHAR(20),
    results_count INTEGER,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_cache_tool ON video_cache(tool);
CREATE INDEX IF NOT EXISTS idx_video_cache_difficulty ON video_cache(difficulty);
CREATE INDEX IF NOT EXISTS idx_video_cache_search_query ON video_cache(search_query);
CREATE INDEX IF NOT EXISTS idx_video_cache_created_at ON video_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_video_cache_last_accessed ON video_cache(last_accessed);

CREATE INDEX IF NOT EXISTS idx_video_series_title ON video_series(series_title);
CREATE INDEX IF NOT EXISTS idx_video_series_channel ON video_series(channel_name);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_video_id ON user_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(is_completed);

CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_approved ON challenges(is_approved);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_tool ON search_analytics(tool);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_video_cache_updated_at BEFORE UPDATE ON video_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_series_updated_at BEFORE UPDATE ON video_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_submissions_updated_at BEFORE UPDATE ON challenge_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_portfolio_updated_at BEFORE UPDATE ON user_portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();