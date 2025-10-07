#!/usr/bin/env node

/**
 * Update Database Schema for Scraped Videos
 * Adds new fields for quality assessment and difficulty detection
 */

const { query, testConnection, closePool } = require('../config/database');

async function updateDatabaseSchema() {
  try {
    console.log('🔧 Updating database schema for scraped videos...');
    
    // Test connection
    await testConnection();
    console.log('✅ Database connection successful');
    
    // Create enhanced scraped_videos table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS scraped_videos (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(50) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        view_count BIGINT DEFAULT 0,
        duration INTEGER DEFAULT 0,
        channel VARCHAR(255),
        thumbnail_url TEXT,
        video_url TEXT NOT NULL,
        published_at TIMESTAMP,
        
        -- Quality and categorization fields
        difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
        tool VARCHAR(50) NOT NULL DEFAULT 'automation',
        quality_score INTEGER DEFAULT 0,
        usefulness_score INTEGER DEFAULT 0,
        
        -- Content analysis
        keywords TEXT[],
        tags TEXT[],
        has_tutorial_content BOOLEAN DEFAULT false,
        has_code_examples BOOLEAN DEFAULT false,
        is_series BOOLEAN DEFAULT false,
        
        -- Metadata
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        analysis_version VARCHAR(10) DEFAULT '1.0',
        
        -- Constraints
        CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        CONSTRAINT valid_tool CHECK (tool IN ('zapier', 'n8n', 'make', 'automation')),
        CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 100),
        CONSTRAINT valid_usefulness_score CHECK (usefulness_score >= 0 AND usefulness_score <= 100)
      );
    `;
    
    await query(createTableQuery);
    console.log('✅ Created enhanced scraped_videos table');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_tool_difficulty ON scraped_videos(tool, difficulty);',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_quality ON scraped_videos(quality_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_views ON scraped_videos(view_count DESC);',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_channel ON scraped_videos(channel);',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_keywords ON scraped_videos USING GIN(keywords);',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_tags ON scraped_videos USING GIN(tags);'
    ];
    
    for (const indexQuery of indexes) {
      await query(indexQuery);
    }
    console.log('✅ Created performance indexes');
    
    // Create a view for easy integration with existing video_cache
    const createViewQuery = `
      CREATE OR REPLACE VIEW all_videos AS
      SELECT 
        video_id as id,
        video_url,
        title,
        description,
        thumbnail_url as thumbnail,
        channel as channelTitle,
        duration as duration_seconds,
        view_count as viewCount,
        difficulty,
        tool,
        quality_score,
        usefulness_score,
        keywords,
        tags,
        has_tutorial_content,
        has_code_examples,
        is_series,
        published_at,
        scraped_at as cached_at,
        'scraped' as source
      FROM scraped_videos
      WHERE quality_score >= 50  -- Only show quality videos
      
      UNION ALL
      
      SELECT 
        video_id as id,
        video_url,
        title,
        description,
        thumbnail_url as thumbnail,
        channel_title as channelTitle,
        duration_seconds,
        view_count as viewCount,
        difficulty,
        tool,
        CASE 
          WHEN view_count > 100000 THEN 80
          WHEN view_count > 10000 THEN 60
          ELSE 40
        END as quality_score,
        CASE 
          WHEN view_count > 100000 THEN 80
          WHEN view_count > 10000 THEN 60
          ELSE 40
        END as usefulness_score,
        ARRAY[]::TEXT[] as keywords,
        ARRAY[]::TEXT[] as tags,
        true as has_tutorial_content,
        false as has_code_examples,
        false as is_series,
        NULL::TIMESTAMP as published_at,
        cached_at,
        'curated' as source
      FROM video_cache;
    `;
    
    await query(createViewQuery);
    console.log('✅ Created unified all_videos view');
    
    console.log('🎉 Database schema updated successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update database schema:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const success = await updateDatabaseSchema();
    
    if (success) {
      console.log('✅ Schema update completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Schema update failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = updateDatabaseSchema;
