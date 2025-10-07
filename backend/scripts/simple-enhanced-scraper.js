#!/usr/bin/env node

/**
 * Simple Enhanced Scraper
 * Uses existing intelligent scraper with enhanced quality scoring
 */

const { query } = require('../config/database');

class SimpleEnhancedQualityScorer {
  constructor() {
    this.scoringWeights = {
      viewCount: 25,
      contentQuality: 25,
      educational: 15,
      engagement: 20,
      authority: 15,
      production: 10,
      duration: 10,
      uniqueness: 10,
      accessibility: 5,
      titleDescription: 15
    };
    
    // Official channels for authority scoring
    this.officialChannels = [
      'Zapier', 'n8n', 'Make.com', 'Integromat', 'Automate.io',
      'Microsoft Power Automate', 'Google Apps Script', 'IFTTT',
      'Pabbly Connect', 'Pipedream', 'Tray.io'
    ];
    
    // Expert channels
    this.expertChannels = [
      'Kevin Stratvert', 'Leila Gharani', 'ExcelJet', 'Automation Anywhere',
      'UiPath', 'Blue Prism', 'ProcessMaker', 'Kissflow'
    ];
    
    // Tutorial quality indicators
    this.tutorialKeywords = {
      timestamps: ['timestamp', 'chapter', 'section', '00:', '01:', '02:', '03:', '04:', '05:', '06:', '07:', '08:', '09:', '10:', '11:', '12:', '13:', '14:', '15:', '16:', '17:', '18:', '19:', '20:', '21:', '22:', '23:', '24:', '25:', '26:', '27:', '28:', '29:', '30:', '31:', '32:', '33:', '34:', '35:', '36:', '37:', '38:', '39:', '40:', '41:', '42:', '43:', '44:', '45:', '46:', '47:', '48:', '49:', '50:', '51:', '52:', '53:', '54:', '55:', '56:', '57:', '58:', '59:'],
      codeExamples: ['code', 'script', 'json', 'api', 'webhook', 'function', 'variable', 'automation', 'workflow'],
      handsOnDemo: ['demo', 'example', 'tutorial', 'step by step', 'how to', 'walkthrough', 'practical', 'real world', 'live demo'],
      beginnerFriendly: ['beginner', 'basic', 'introduction', 'getting started', 'first time', 'new to', 'learn', 'understand', 'explain'],
      progressive: ['part 1', 'part 2', 'part 3', 'series', 'episode', 'chapter', 'lesson', 'course', 'curriculum'],
      realWorld: ['business', 'company', 'workflow', 'process', 'automation', 'integration', 'productivity', 'efficiency']
    };
  }

  // Calculate comprehensive quality score (140 points, normalized to 100)
  calculateQualityScore(video) {
    const scores = {
      viewCount: this.calculateViewCountScore(video.view_count || 0),
      contentQuality: this.calculateContentQualityScore(video),
      educational: this.calculateEducationalScore(video),
      engagement: this.calculateEngagementScore(video),
      authority: this.calculateAuthorityScore(video),
      production: this.calculateProductionScore(video),
      duration: this.calculateDurationScore(video.duration || 0),
      uniqueness: this.calculateUniquenessScore(video),
      accessibility: this.calculateAccessibilityScore(video),
      titleDescription: this.calculateTitleDescriptionScore(video)
    };

    // Calculate weighted total
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [category, weight] of Object.entries(this.scoringWeights)) {
      totalScore += scores[category] * weight;
      totalWeight += weight;
    }

    // Normalize to 100
    const normalizedScore = Math.round((totalScore / totalWeight) * 100);
    
    return {
      overall: Math.min(100, Math.max(0, normalizedScore)),
      breakdown: scores,
      details: this.getQualityDetails(video, scores)
    };
  }

  // View Count & Popularity (25 pts)
  calculateViewCountScore(viewCount) {
    if (viewCount >= 1000000) return 100;
    if (viewCount >= 500000) return 90;
    if (viewCount >= 100000) return 80;
    if (viewCount >= 50000) return 70;
    if (viewCount >= 10000) return 60;
    if (viewCount >= 5000) return 50;
    if (viewCount >= 1000) return 40;
    return 20;
  }

  // Content Quality Indicators (25 pts)
  calculateContentQualityScore(video) {
    let score = 0;
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Tutorial Structure (10 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.timestamps)) {
      score += 10;
    } else if (this.hasKeywords(combined, ['tutorial', 'guide', 'how to'])) {
      score += 5;
    }

    // Code Examples (8 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.codeExamples)) {
      score += 8;
    }

    // Hands-on Demo (7 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.handsOnDemo)) {
      score += 7;
    }

    return Math.min(100, score);
  }

  // Educational Value (15 pts)
  calculateEducationalScore(video) {
    let score = 0;
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Beginner-Friendly (8 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.beginnerFriendly)) {
      score += 8;
    }

    // Progressive Learning (7 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.progressive)) {
      score += 7;
    }

    // Real-world Application (10 pts)
    if (this.hasKeywords(combined, this.tutorialKeywords.realWorld)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // Engagement Metrics (20 pts) - Estimated based on view count and content
  calculateEngagementScore(video) {
    let score = 0;
    const viewCount = video.view_count || 0;

    // Like Ratio (estimated based on view count and content quality)
    if (viewCount > 100000) score += 10;
    else if (viewCount > 10000) score += 8;
    else if (viewCount > 1000) score += 6;
    else score += 4;

    // Comment Quality (estimated)
    score += 5;

    // Subscribe Rate (estimated)
    score += 5;

    return Math.min(100, score);
  }

  // Authority & Credibility (15 pts)
  calculateAuthorityScore(video) {
    let score = 0;
    const channel = (video.channel || '').toLowerCase();

    // Official Channels (15 pts)
    if (this.officialChannels.some(oc => channel.includes(oc.toLowerCase()))) {
      score += 15;
    }
    // Expert Channels (10 pts)
    else if (this.expertChannels.some(ec => channel.includes(ec.toLowerCase()))) {
      score += 10;
    }
    // Regular channels (5 pts)
    else {
      score += 5;
    }

    // Content Freshness (bonus points for recent content)
    if (video.published_at) {
      const publishedDate = new Date(video.published_at);
      const now = new Date();
      const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 365) score += 5;
      if (daysDiff < 180) score += 5;
    }

    return Math.min(100, score);
  }

  // Production Quality (10 pts) - Estimated
  calculateProductionScore(video) {
    let score = 0;
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Professional Presentation (5 pts)
    if (this.hasKeywords(combined, ['professional', 'high quality', 'hd', '4k', 'crystal clear'])) {
      score += 5;
    } else {
      score += 3;
    }

    // Audio Quality (estimated) (3 pts)
    if (this.hasKeywords(combined, ['clear audio', 'good sound', 'professional audio'])) {
      score += 3;
    } else {
      score += 2;
    }

    // Video Quality (estimated) (2 pts)
    if (this.hasKeywords(combined, ['hd', 'high definition', 'clear video'])) {
      score += 2;
    } else {
      score += 1;
    }

    return Math.min(100, score);
  }

  // Duration Optimization (10 pts)
  calculateDurationScore(duration) {
    if (duration >= 600 && duration <= 1800) return 100; // 10-30 minutes (ideal)
    if (duration >= 300 && duration <= 3600) return 80;  // 5min-1hour (good)
    if (duration >= 180 && duration <= 600) return 60;   // 3-10 minutes (okay)
    if (duration >= 60 && duration <= 180) return 40;    // 1-3 minutes (short)
    if (duration > 1800) return 30;                      // Over 30 minutes (long)
    return 20; // Very short
  }

  // Uniqueness & Innovation (10 pts)
  calculateUniquenessScore(video) {
    let score = 0;
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Original Content (8 pts)
    if (this.hasKeywords(combined, ['original', 'unique', 'new method', 'innovative', 'creative'])) {
      score += 8;
    } else {
      score += 5;
    }

    // Advanced Techniques (7 pts)
    if (this.hasKeywords(combined, ['advanced', 'expert', 'pro', 'complex', 'sophisticated'])) {
      score += 7;
    } else {
      score += 4;
    }

    // Problem-Solving (5 pts)
    if (this.hasKeywords(combined, ['problem', 'solution', 'fix', 'troubleshoot', 'resolve'])) {
      score += 5;
    } else {
      score += 3;
    }

    return Math.min(100, score);
  }

  // Accessibility & Inclusivity (5 pts)
  calculateAccessibilityScore(video) {
    let score = 0;
    const description = (video.description || '').toLowerCase();
    const title = (video.title || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Closed Captions (3 pts)
    if (this.hasKeywords(combined, ['subtitle', 'caption', 'closed caption', 'cc'])) {
      score += 3;
    } else {
      score += 1;
    }

    // No Assumed Knowledge (2 pts)
    if (this.hasKeywords(combined, ['beginner', 'no experience', 'start from scratch', 'explain everything'])) {
      score += 2;
    } else {
      score += 1;
    }

    return Math.min(100, score);
  }

  // Title & Description Quality (15 pts)
  calculateTitleDescriptionScore(video) {
    let score = 0;
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();

    // Title Quality (10 pts)
    if (title.length > 20 && title.length < 100) score += 5;
    if (this.hasKeywords(title, ['tutorial', 'guide', 'how to', 'learn'])) score += 3;
    if (this.hasKeywords(title, ['complete', 'full', 'comprehensive'])) score += 2;

    // Description Quality (5 pts)
    if (description.length > 100) score += 3;
    if (this.hasKeywords(description, ['step', 'process', 'method'])) score += 2;

    return Math.min(100, score);
  }

  // Helper method to check for keywords
  hasKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  // Get detailed quality breakdown
  getQualityDetails(video, scores) {
    return {
      hasTimestamps: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.timestamps),
      hasCodeExamples: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.codeExamples),
      hasHandsOnDemo: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.handsOnDemo),
      isBeginnerFriendly: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.beginnerFriendly),
      isProgressive: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.progressive),
      hasRealWorldExamples: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, this.tutorialKeywords.realWorld),
      isOfficialChannel: this.officialChannels.some(oc => (video.channel || '').toLowerCase().includes(oc.toLowerCase())),
      isExpertChannel: this.expertChannels.some(ec => (video.channel || '').toLowerCase().includes(ec.toLowerCase())),
      isOriginalContent: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, ['original', 'unique', 'new method']),
      hasAdvancedTechniques: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, ['advanced', 'expert', 'complex']),
      solvesSpecificProblems: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, ['problem', 'solution', 'fix']),
      hasClosedCaptions: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, ['subtitle', 'caption', 'closed caption']),
      noAssumedKnowledge: this.hasKeywords(`${video.title || ''} ${video.description || ''}`, ['beginner', 'no experience', 'start from scratch'])
    };
  }
}

async function enhanceExistingVideos() {
  try {
    console.log('🚀 Enhancing existing videos with new quality scoring...');
    
    // Get all existing videos from scraped_videos table
    const videosQuery = `
      SELECT 
        video_id, title, description, view_count, duration, channel,
        thumbnail_url, video_url, published_at, tool, difficulty,
        quality_score, usefulness_score
      FROM scraped_videos 
      WHERE quality_score < 70 OR quality_score IS NULL
      ORDER BY view_count DESC
      LIMIT 50
    `;
    
    const result = await query(videosQuery);
    const videos = result.rows;
    
    console.log(`📊 Found ${videos.length} videos to enhance`);
    
    const qualityScorer = new SimpleEnhancedQualityScorer();
    let enhancedCount = 0;
    
    for (const video of videos) {
      try {
        // Calculate enhanced quality score
        const qualityScore = qualityScorer.calculateQualityScore(video);
        
        if (qualityScore.overall >= 60) {
          // Update video with enhanced scoring
          const updateQuery = `
            UPDATE scraped_videos SET
              quality_score = $1,
              usefulness_score = $2,
              engagement_score = $3,
              authority_score = $4,
              production_score = $5,
              accessibility_score = $6,
              uniqueness_score = $7,
              educational_score = $8,
              content_quality_score = $9,
              has_timestamps = $10,
              has_code_examples = $11,
              has_hands_on_demo = $12,
              is_beginner_friendly = $13,
              is_progressive = $14,
              has_real_world_examples = $15,
              is_official_channel = $16,
              is_expert_channel = $17,
              is_original_content = $18,
              has_advanced_techniques = $19,
              solves_specific_problems = $20,
              has_closed_captions = $21,
              no_assumed_knowledge = $22,
              tutorial_type = $23,
              use_case = $24,
              industry = $25,
              complexity_level = $26,
              last_quality_update = CURRENT_TIMESTAMP
            WHERE video_id = $27
          `;
          
          const values = [
            qualityScore.overall,
            qualityScore.overall, // Same as quality for now
            Math.round(qualityScore.breakdown.engagement),
            Math.round(qualityScore.breakdown.authority),
            Math.round(qualityScore.breakdown.production),
            Math.round(qualityScore.breakdown.accessibility),
            Math.round(qualityScore.breakdown.uniqueness),
            Math.round(qualityScore.breakdown.educational),
            Math.round(qualityScore.breakdown.contentQuality),
            qualityScore.details.hasTimestamps,
            qualityScore.details.hasCodeExamples,
            qualityScore.details.hasHandsOnDemo,
            qualityScore.details.isBeginnerFriendly,
            qualityScore.details.isProgressive,
            qualityScore.details.hasRealWorldExamples,
            qualityScore.details.isOfficialChannel,
            qualityScore.details.isExpertChannel,
            qualityScore.details.isOriginalContent,
            qualityScore.details.hasAdvancedTechniques,
            qualityScore.details.solvesSpecificProblems,
            qualityScore.details.hasClosedCaptions,
            qualityScore.details.noAssumedKnowledge,
            'general', // tutorial_type
            'general', // use_case
            'general', // industry
            video.difficulty || 'intermediate', // complexity_level
            video.video_id
          ];
          
          await query(updateQuery, values);
          enhancedCount++;
          
          console.log(`  ✅ Enhanced: ${video.title.substring(0, 60)}... (Score: ${qualityScore.overall})`);
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to enhance: ${video.title.substring(0, 60)}...`);
      }
    }
    
    console.log(`🎉 Enhancement completed!`);
    console.log(`📈 Enhanced ${enhancedCount} videos`);
    
    return {
      total_videos: videos.length,
      enhanced_videos: enhancedCount,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const result = await enhanceExistingVideos();
    console.log('✅ Video enhancement completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Video enhancement failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleEnhancedQualityScorer, enhanceExistingVideos };
