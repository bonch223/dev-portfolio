const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Update database schema endpoint
router.post('/update-schema', async (req, res) => {
  try {
    console.log('🔧 Updating database schema for scraped videos...');
    
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
    
    res.json({
      success: true,
      message: 'Database schema updated successfully!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to update database schema:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get schema status
router.get('/schema-status', async (req, res) => {
  try {
    // Check if scraped_videos table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'scraped_videos'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      // Get table info
      const tableInfo = await query(`
        SELECT 
          COUNT(*) as video_count,
          COUNT(DISTINCT tool) as tools,
          COUNT(DISTINCT difficulty) as difficulty_levels,
          AVG(quality_score) as avg_quality,
          AVG(usefulness_score) as avg_usefulness
        FROM scraped_videos;
      `);
      
      res.json({
        success: true,
        table_exists: true,
        stats: tableInfo.rows[0],
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        table_exists: false,
        message: 'scraped_videos table does not exist. Run schema update first.',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check schema status:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
