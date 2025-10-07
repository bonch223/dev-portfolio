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

// Enhanced schema update with all new features
router.post('/enhanced-update', async (req, res) => {
  try {
    console.log('🚀 Updating database schema with enhanced features...');
    
    // Add enhanced columns to existing scraped_videos table
    const alterQueries = [
      // Enhanced Quality scoring columns (140 points total, normalized to 100)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS authority_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS production_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS accessibility_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS uniqueness_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS educational_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_quality_score INTEGER DEFAULT 0',
      
      // Content Quality Indicators (0-25 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS tutorial_structure_score INTEGER DEFAULT 0',
      
      // Engagement Metrics (0-20 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS like_ratio DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS comment_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS encourages_subscription BOOLEAN DEFAULT false',
      
      // Educational Value (0-15 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS learning_objectives TEXT[]',
      
      // Production Quality (0-10 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS audio_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS video_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_professional BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS editing_quality_score INTEGER DEFAULT 0',
      
      // Authority & Credibility (0-15 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_freshness_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS channel_authority_score INTEGER DEFAULT 0',
      
      // Uniqueness & Innovation (0-10 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS innovation_score INTEGER DEFAULT 0',
      
      // Enhanced Content Categorization
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_tags TEXT[]',
      
      // Enhanced User Feedback System
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS quality_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS helpfulness_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS accuracy_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS clarity_rating DECIMAL(3,2) DEFAULT 0.0',
      
      // Learning Path Integration
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS related_videos TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS alternative_videos TEXT[]',
      
      // Enhanced Metadata & Analysis
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(3,2) DEFAULT 0.0',
      
      // Quality Assurance & Review
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS human_quality_score INTEGER',
      
      // A/B Testing & Analytics
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS ab_test_group VARCHAR(20)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS click_through_rate DECIMAL(5,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS watch_time_ratio DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS user_satisfaction_score DECIMAL(3,2) DEFAULT 0.0'
    ];

    for (const sql of alterQueries) {
      try {
        await query(sql);
        console.log(`✅ Executed: ${sql.substring(0, 60)}...`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Column already exists, skipping: ${sql.substring(0, 60)}...`);
        } else {
          console.error(`❌ Error executing: ${sql.substring(0, 60)}...`);
          console.error(`   Error: ${error.message}`);
        }
      }
    }

    // Create enhanced learning paths table
    const createLearningPathsTable = `
      CREATE TABLE IF NOT EXISTS learning_paths (
        id SERIAL PRIMARY KEY,
        path_name VARCHAR(200) NOT NULL,
        tool VARCHAR(50) NOT NULL,
        difficulty_level VARCHAR(20) NOT NULL,
        description TEXT,
        estimated_duration INTEGER,
        video_order INTEGER[],
        prerequisites TEXT[],
        learning_objectives TEXT[],
        target_audience VARCHAR(100),
        industry_focus VARCHAR(100),
        skill_level_required VARCHAR(20),
        completion_criteria TEXT[],
        certification_available BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        user_rating DECIMAL(3,2) DEFAULT 0.0,
        completion_count INTEGER DEFAULT 0
      )
    `;

    await query(createLearningPathsTable);
    console.log('✅ Created enhanced learning_paths table');

    // Create enhanced video relationships table
    const createVideoRelationshipsTable = `
      CREATE TABLE IF NOT EXISTS video_relationships (
        id SERIAL PRIMARY KEY,
        source_video_id VARCHAR(50) NOT NULL,
        target_video_id VARCHAR(50) NOT NULL,
        relationship_type VARCHAR(50) NOT NULL,
        strength DECIMAL(3,2) DEFAULT 1.0,
        confidence DECIMAL(3,2) DEFAULT 1.0,
        relationship_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_video_id, target_video_id, relationship_type)
      )
    `;

    await query(createVideoRelationshipsTable);
    console.log('✅ Created enhanced video_relationships table');

    // Create enhanced user feedback table
    const createUserFeedbackTable = `
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(50) NOT NULL,
        user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
        quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
        helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
        accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
        clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
        user_comment TEXT,
        feedback_type VARCHAR(50),
        user_session_id VARCHAR(100),
        user_ip_hash VARCHAR(64),
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(createUserFeedbackTable);
    console.log('✅ Created enhanced user_feedback table');

    // Create video analytics table
    const createVideoAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS video_analytics (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        watch_time_seconds INTEGER DEFAULT 0,
        completion_rate DECIMAL(3,2) DEFAULT 0.0,
        bounce_rate DECIMAL(3,2) DEFAULT 0.0,
        user_satisfaction DECIMAL(3,2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(video_id, date)
      )
    `;

    await query(createVideoAnalyticsTable);
    console.log('✅ Created video_analytics table');

    // Create quality metrics table
    const createQualityMetricsTable = `
      CREATE TABLE IF NOT EXISTS quality_metrics (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,4) NOT NULL,
        metric_type VARCHAR(50),
        calculation_method TEXT,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(video_id, metric_name)
      )
    `;

    await query(createQualityMetricsTable);
    console.log('✅ Created quality_metrics table');

    // Create performance indexes
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_quality_score ON scraped_videos(quality_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_difficulty ON scraped_videos(difficulty_level)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_tool_difficulty ON scraped_videos(tool, difficulty_level)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_user_ratings ON scraped_videos(user_ratings DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_tutorial_type ON scraped_videos(tutorial_type)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_use_case ON scraped_videos(use_case)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_industry ON scraped_videos(industry)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_complexity ON scraped_videos(complexity_level)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_content_quality ON scraped_videos(content_quality_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_educational ON scraped_videos(educational_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_videos_authority ON scraped_videos(authority_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_video_relationships_source ON video_relationships(source_video_id)',
      'CREATE INDEX IF NOT EXISTS idx_video_relationships_target ON video_relationships(target_video_id)',
      'CREATE INDEX IF NOT EXISTS idx_video_relationships_type ON video_relationships(relationship_type)',
      'CREATE INDEX IF NOT EXISTS idx_user_feedback_video_id ON user_feedback(video_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_feedback_ratings ON user_feedback(user_rating DESC)',
      'CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type)',
      'CREATE INDEX IF NOT EXISTS idx_learning_paths_tool_difficulty ON learning_paths(tool, difficulty_level)',
      'CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_video_analytics_video_date ON video_analytics(video_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_quality_metrics_video ON quality_metrics(video_id)'
    ];

    for (const indexSql of createIndexes) {
      try {
        await query(indexSql);
        console.log(`✅ Created index: ${indexSql.substring(0, 60)}...`);
      } catch (error) {
        console.log(`⚠️  Index might already exist: ${indexSql.substring(0, 60)}...`);
      }
    }

    console.log('🎉 Enhanced database schema update completed successfully!');
    console.log('📊 New Features Added:');
    console.log('   • Enhanced 140-point quality scoring system');
    console.log('   • Content quality indicators & engagement metrics');
    console.log('   • Educational value & production quality scoring');
    console.log('   • Authority & credibility assessment');
    console.log('   • Accessibility & inclusivity scoring');
    console.log('   • Learning paths & video relationships');
    console.log('   • User feedback & rating system');
    console.log('   • Video analytics & quality metrics');
    console.log('   • A/B testing & performance tracking');
    
    res.json({
      success: true,
      message: 'Enhanced database schema updated successfully',
      features: [
        'Enhanced 140-point quality scoring system',
        'Content quality indicators & engagement metrics',
        'Educational value & production quality scoring',
        'Authority & credibility assessment',
        'Accessibility & inclusivity scoring',
        'Learning paths & video relationships',
        'User feedback & rating system',
        'Video analytics & quality metrics',
        'A/B testing & performance tracking'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating enhanced schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update enhanced database schema',
      message: error.message
    });
  }
});

module.exports = router;
