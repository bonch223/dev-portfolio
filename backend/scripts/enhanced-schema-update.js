#!/usr/bin/env node

/**
 * Enhanced Database Schema Update
 * Implements comprehensive quality scoring, learning paths, and video relationships
 */

const { query, testConnection, closePool } = require('../config/database');

async function updateEnhancedSchema() {
  try {
    console.log('🚀 Updating database schema with enhanced features...');
    
    // Test connection
    await testConnection();
    console.log('✅ Database connection successful');
    
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
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS has_timestamps BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS has_hands_on_demo BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS tutorial_structure_score INTEGER DEFAULT 0',
      
      // Engagement Metrics (0-20 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS like_ratio DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS comment_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS encourages_subscription BOOLEAN DEFAULT false',
      
      // Educational Value (0-15 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_beginner_friendly BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_progressive BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS has_real_world_examples BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS learning_objectives TEXT[]',
      
      // Production Quality (0-10 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS audio_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS video_quality_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_professional BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS editing_quality_score INTEGER DEFAULT 0',
      
      // Authority & Credibility (0-15 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_official_channel BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_expert_channel BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_freshness_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS channel_authority_score INTEGER DEFAULT 0',
      
      // Uniqueness & Innovation (0-10 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS is_original_content BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS has_advanced_techniques BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS solves_specific_problems BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS innovation_score INTEGER DEFAULT 0',
      
      // Accessibility & Inclusivity (0-5 pts)
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS has_closed_captions BOOLEAN DEFAULT false',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS available_languages TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS no_assumed_knowledge BOOLEAN DEFAULT false',
      
      // Enhanced Content Categorization
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS tutorial_type VARCHAR(50)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS use_case VARCHAR(100)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS industry VARCHAR(100)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(20)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_tags TEXT[]',
      
      // Enhanced User Feedback System
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS user_ratings DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS user_rating_count INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS quality_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS helpfulness_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS accuracy_rating DECIMAL(3,2) DEFAULT 0.0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS clarity_rating DECIMAL(3,2) DEFAULT 0.0',
      
      // Learning Path Integration
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS prerequisites TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS next_steps TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS related_videos TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS alternative_videos TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS estimated_learning_time INTEGER',
      
      // Enhanced Metadata & Analysis
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS content_complexity_score INTEGER DEFAULT 0',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS assumed_knowledge TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS key_topics TEXT[]',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS skill_level_required VARCHAR(20)',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(3,2) DEFAULT 0.0',
      
      // Quality Assurance & Review
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS last_quality_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS manual_review_status VARCHAR(20) DEFAULT \'pending\'',
      'ALTER TABLE scraped_videos ADD COLUMN IF NOT EXISTS review_notes TEXT',
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
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update enhanced schema:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const success = await updateEnhancedSchema();
    
    if (success) {
      console.log('✅ Enhanced schema update completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Enhanced schema update failed');
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

module.exports = updateEnhancedSchema;
