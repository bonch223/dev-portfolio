#!/usr/bin/env node

/**
 * Enhanced Intelligent Scraper
 * Implements comprehensive 140-point quality scoring system with all features
 */

const ytdlp = require('yt-dlp-wrap').default;
const { query, testConnection, closePool } = require('../config/database');

class EnhancedQualityScorer {
  constructor() {
    this.scoringWeights = {
      viewCount: 25,      // Reduced from 40
      contentQuality: 25, // New
      educational: 15,    // New
      engagement: 20,     // New
      authority: 15,      // New
      production: 10,     // New
      duration: 10,       // Reduced from 20
      uniqueness: 10,     // New
      accessibility: 5,   // New
      titleDescription: 15 // Reduced from 40
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
    if (viewCount >= 1000000) return 100; // 1M+ views
    if (viewCount >= 500000) return 90;   // 500K+ views
    if (viewCount >= 100000) return 80;   // 100K+ views
    if (viewCount >= 50000) return 70;    // 50K+ views
    if (viewCount >= 10000) return 60;    // 10K+ views
    if (viewCount >= 5000) return 50;     // 5K+ views
    if (viewCount >= 1000) return 40;     // 1K+ views
    return 20; // Less than 1K views
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
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();

    // Like Ratio (estimated based on view count and content quality)
    if (viewCount > 100000) score += 10;
    else if (viewCount > 10000) score += 8;
    else if (viewCount > 1000) score += 6;
    else score += 4;

    // Comment Quality (estimated based on engagement keywords)
    if (this.hasKeywords(`${title} ${description}`, ['discuss', 'question', 'feedback', 'comment'])) {
      score += 5;
    } else {
      score += 3;
    }

    // Subscribe Rate (estimated based on content quality)
    if (this.hasKeywords(`${title} ${description}`, ['subscribe', 'channel', 'more videos', 'notification'])) {
      score += 5;
    } else {
      score += 3;
    }

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
      
      if (daysDiff < 365) score += 5; // Last year
      if (daysDiff < 180) score += 5; // Last 6 months
    }

    return Math.min(100, score);
  }

  // Production Quality (10 pts) - Estimated based on content indicators
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
    if (title.length > 20 && title.length < 100) score += 5; // Good length
    if (this.hasKeywords(title, ['tutorial', 'guide', 'how to', 'learn'])) score += 3;
    if (this.hasKeywords(title, ['complete', 'full', 'comprehensive'])) score += 2;

    // Description Quality (5 pts)
    if (description.length > 100) score += 3; // Detailed description
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

  // Detect tutorial type
  detectTutorialType(video) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    if (this.hasKeywords(combined, ['step by step', 'tutorial', 'guide', 'how to'])) {
      return 'step-by-step';
    } else if (this.hasKeywords(combined, ['overview', 'introduction', 'what is', 'explained'])) {
      return 'overview';
    } else if (this.hasKeywords(combined, ['fix', 'problem', 'error', 'troubleshoot', 'debug'])) {
      return 'troubleshooting';
    } else if (this.hasKeywords(combined, ['vs', 'versus', 'compare', 'comparison', 'difference'])) {
      return 'comparison';
    } else {
      return 'general';
    }
  }

  // Detect use case
  detectUseCase(video) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    if (this.hasKeywords(combined, ['business', 'enterprise', 'company', 'professional'])) {
      return 'business';
    } else if (this.hasKeywords(combined, ['personal', 'home', 'individual', 'personal use'])) {
      return 'personal';
    } else if (this.hasKeywords(combined, ['developer', 'programming', 'code', 'api', 'technical'])) {
      return 'developer';
    } else {
      return 'general';
    }
  }

  // Detect industry
  detectIndustry(video) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    const industries = {
      'ecommerce': ['ecommerce', 'e-commerce', 'shopify', 'woocommerce', 'online store'],
      'marketing': ['marketing', 'seo', 'social media', 'advertising', 'campaign'],
      'finance': ['finance', 'accounting', 'bookkeeping', 'payment', 'invoice'],
      'healthcare': ['healthcare', 'medical', 'patient', 'health', 'clinic'],
      'education': ['education', 'learning', 'student', 'course', 'training'],
      'hr': ['hr', 'human resources', 'recruitment', 'employee', 'payroll']
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (this.hasKeywords(combined, keywords)) {
        return industry;
      }
    }

    return 'general';
  }

  // Detect complexity level
  detectComplexityLevel(video) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    if (this.hasKeywords(combined, ['expert', 'advanced', 'complex', 'sophisticated', 'pro'])) {
      return 'expert';
    } else if (this.hasKeywords(combined, ['intermediate', 'medium', 'moderate'])) {
      return 'intermediate';
    } else if (this.hasKeywords(combined, ['basic', 'simple', 'easy', 'beginner'])) {
      return 'basic';
    } else {
      return 'intermediate';
    }
  }
}

class EnhancedIntelligentScraper {
  constructor() {
    this.ytdlp = new ytdlp();
    this.qualityScorer = new EnhancedQualityScorer();
    this.tools = ['zapier', 'n8n', 'make'];
    this.difficulties = ['beginner', 'intermediate', 'advanced'];
  }

  async scrapeVideosForTool(tool, difficulty = 'beginner', maxVideos = 50) {
    console.log(`🔍 Scraping ${maxVideos} videos for ${tool} (${difficulty})...`);
    
    const searchTerms = this.generateSearchTerms(tool, difficulty);
    const allVideos = [];

    for (const searchTerm of searchTerms) {
      try {
        console.log(`  📝 Searching: "${searchTerm}"`);
        const videos = await this.searchVideos(searchTerm, Math.ceil(maxVideos / searchTerms.length));
        
        for (const video of videos) {
          // Enhanced quality scoring
          const qualityScore = this.qualityScorer.calculateQualityScore(video);
          
          // Only include high-quality videos (score >= 60)
          if (qualityScore.overall >= 60) {
            const enhancedVideo = {
              ...video,
              tool: tool,
              difficulty: difficulty,
              quality_score: qualityScore.overall,
              usefulness_score: qualityScore.overall, // Same as quality for now
              
              // Detailed scoring breakdown
              engagement_score: Math.round(qualityScore.breakdown.engagement),
              authority_score: Math.round(qualityScore.breakdown.authority),
              production_score: Math.round(qualityScore.breakdown.production),
              accessibility_score: Math.round(qualityScore.breakdown.accessibility),
              uniqueness_score: Math.round(qualityScore.breakdown.uniqueness),
              educational_score: Math.round(qualityScore.breakdown.educational),
              content_quality_score: Math.round(qualityScore.breakdown.contentQuality),
              
              // Content analysis
              has_timestamps: qualityScore.details.hasTimestamps,
              has_code_examples: qualityScore.details.hasCodeExamples,
              has_hands_on_demo: qualityScore.details.hasHandsOnDemo,
              is_beginner_friendly: qualityScore.details.isBeginnerFriendly,
              is_progressive: qualityScore.details.isProgressive,
              has_real_world_examples: qualityScore.details.hasRealWorldExamples,
              is_official_channel: qualityScore.details.isOfficialChannel,
              is_expert_channel: qualityScore.details.isExpertChannel,
              is_original_content: qualityScore.details.isOriginalContent,
              has_advanced_techniques: qualityScore.details.hasAdvancedTechniques,
              solves_specific_problems: qualityScore.details.solvesSpecificProblems,
              has_closed_captions: qualityScore.details.hasClosedCaptions,
              no_assumed_knowledge: qualityScore.details.noAssumedKnowledge,
              
              // Content categorization
              tutorial_type: this.qualityScorer.detectTutorialType(video),
              use_case: this.qualityScorer.detectUseCase(video),
              industry: this.qualityScorer.detectIndustry(video),
              complexity_level: this.qualityScorer.detectComplexityLevel(video),
              
              // Estimated metrics (would be real in production)
              like_ratio: this.estimateLikeRatio(video.view_count || 0),
              comment_count: this.estimateCommentCount(video.view_count || 0),
              encourages_subscription: Math.random() > 0.5,
              audio_quality_score: Math.floor(Math.random() * 40) + 60,
              video_quality_score: Math.floor(Math.random() * 40) + 60,
              is_professional: qualityScore.details.isOfficialChannel || qualityScore.details.isExpertChannel,
              content_freshness_score: this.calculateFreshnessScore(video.published_at),
              innovation_score: Math.round(qualityScore.breakdown.uniqueness),
              
              // Learning path data
              estimated_learning_time: this.estimateLearningTime(video.duration || 0),
              learning_objectives: this.extractLearningObjectives(video),
              prerequisites: this.extractPrerequisites(video),
              key_topics: this.extractKeyTopics(video),
              skill_level_required: this.qualityScorer.detectComplexityLevel(video),
              
              // Quality assurance
              manual_review_status: 'pending',
              flagged_for_review: qualityScore.overall < 70,
              last_quality_update: new Date().toISOString(),
              
              // Analytics placeholders
              user_ratings: 0,
              user_rating_count: 0,
              click_through_rate: 0,
              watch_time_ratio: 0,
              user_satisfaction_score: 0
            };
            
            allVideos.push(enhancedVideo);
          }
        }
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error searching for "${searchTerm}":`, error.message);
      }
    }

    console.log(`✅ Found ${allVideos.length} high-quality videos for ${tool} (${difficulty})`);
    return allVideos;
  }

  generateSearchTerms(tool, difficulty) {
    const baseTerms = {
      zapier: ['zapier tutorial', 'zapier automation', 'zapier workflow', 'zapier integration'],
      n8n: ['n8n tutorial', 'n8n workflow', 'n8n automation', 'n8n node'],
      make: ['make.com tutorial', 'make automation', 'make workflow', 'make.com integration', 'integromat']
    };

    const difficultyModifiers = {
      beginner: ['beginner', 'basic', 'getting started', 'introduction', 'first time'],
      intermediate: ['intermediate', 'advanced', 'complex', 'professional'],
      advanced: ['expert', 'advanced', 'complex', 'sophisticated', 'pro']
    };

    const terms = baseTerms[tool] || [];
    const modifiers = difficultyModifiers[difficulty] || [];
    
    const searchTerms = [];
    for (const term of terms) {
      for (const modifier of modifiers) {
        searchTerms.push(`${term} ${modifier}`);
      }
    }

    return searchTerms.slice(0, 8); // Limit to 8 search terms
  }

  async searchVideos(searchTerm, maxResults = 20) {
    try {
      const searchOptions = [
        '--flat-playlist',
        '--no-download',
        '--get-title',
        '--get-description',
        '--get-duration',
        '--get-view-count',
        '--get-uploader',
        '--get-upload-date',
        '--get-thumbnail',
        '--get-url',
        '--max-downloads', maxResults.toString(),
        '--default-search', 'ytsearch'
      ];

      const results = await this.ytdlp.execPromise([
        ...searchOptions,
        searchTerm
      ]);

      return this.parseVideoResults(results);
    } catch (error) {
      console.error('❌ Error in searchVideos:', error.message);
      return [];
    }
  }

  parseVideoResults(results) {
    const lines = results.split('\n').filter(line => line.trim());
    const videos = [];

    for (let i = 0; i < lines.length; i += 8) {
      try {
        if (i + 7 < lines.length) {
          const video = {
            title: lines[i] || 'Unknown Title',
            description: lines[i + 1] || '',
            duration: this.parseDuration(lines[i + 2] || '0'),
            view_count: this.parseViewCount(lines[i + 3] || '0'),
            channel: lines[i + 4] || 'Unknown Channel',
            published_at: this.parseDate(lines[i + 5] || ''),
            thumbnail_url: lines[i + 6] || '',
            video_url: lines[i + 7] || '',
            video_id: this.extractVideoId(lines[i + 7] || '')
          };

          if (video.video_id && video.title !== 'Unknown Title') {
            videos.push(video);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing video result:', error.message);
      }
    }

    return videos;
  }

  parseDuration(duration) {
    if (!duration || duration === 'N/A') return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parseInt(duration) || 0;
  }

  parseViewCount(viewCount) {
    if (!viewCount || viewCount === 'N/A') return 0;
    const clean = viewCount.replace(/[^\d]/g, '');
    return parseInt(clean) || 0;
  }

  parseDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') return null;
    try {
      return new Date(dateStr).toISOString();
    } catch {
      return null;
    }
  }

  extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }

  // Helper methods for enhanced scoring
  estimateLikeRatio(viewCount) {
    if (viewCount > 1000000) return 0.95;
    if (viewCount > 100000) return 0.90;
    if (viewCount > 10000) return 0.85;
    return 0.80;
  }

  estimateCommentCount(viewCount) {
    return Math.floor(viewCount * 0.01); // 1% of views as comments
  }

  calculateFreshnessScore(publishedAt) {
    if (!publishedAt) return 50;
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 30) return 100;
    if (daysDiff < 90) return 90;
    if (daysDiff < 180) return 80;
    if (daysDiff < 365) return 70;
    return 60;
  }

  estimateLearningTime(duration) {
    return Math.ceil(duration * 1.5); // 1.5x duration for learning time
  }

  extractLearningObjectives(video) {
    const objectives = [];
    const text = `${video.title} ${video.description}`.toLowerCase();
    
    if (text.includes('learn')) objectives.push('Learn core concepts');
    if (text.includes('understand')) objectives.push('Understand fundamentals');
    if (text.includes('build')) objectives.push('Build practical skills');
    if (text.includes('create')) objectives.push('Create real projects');
    
    return objectives.length > 0 ? objectives : ['Gain practical knowledge'];
  }

  extractPrerequisites(video) {
    const prerequisites = [];
    const text = `${video.title} ${video.description}`.toLowerCase();
    
    if (text.includes('basic') || text.includes('beginner')) {
      prerequisites.push('No prior experience required');
    } else if (text.includes('intermediate')) {
      prerequisites.push('Basic understanding of automation');
    } else if (text.includes('advanced') || text.includes('expert')) {
      prerequisites.push('Intermediate automation skills');
      prerequisites.push('Experience with multiple tools');
    }
    
    return prerequisites.length > 0 ? prerequisites : ['Basic computer skills'];
  }

  extractKeyTopics(video) {
    const topics = [];
    const text = `${video.title} ${video.description}`.toLowerCase();
    
    if (text.includes('workflow')) topics.push('Workflow Design');
    if (text.includes('integration')) topics.push('System Integration');
    if (text.includes('automation')) topics.push('Process Automation');
    if (text.includes('api')) topics.push('API Integration');
    if (text.includes('webhook')) topics.push('Webhook Setup');
    if (text.includes('data')) topics.push('Data Processing');
    
    return topics.length > 0 ? topics : ['Automation Fundamentals'];
  }

  async saveVideoToDatabase(video) {
    try {
      const insertQuery = `
        INSERT INTO scraped_videos (
          video_id, title, description, view_count, duration, channel, 
          thumbnail_url, video_url, published_at, tool, difficulty,
          quality_score, usefulness_score, engagement_score, authority_score,
          production_score, accessibility_score, uniqueness_score, educational_score,
          content_quality_score, has_timestamps, has_code_examples, has_hands_on_demo,
          is_beginner_friendly, is_progressive, has_real_world_examples,
          is_official_channel, is_expert_channel, is_original_content,
          has_advanced_techniques, solves_specific_problems, has_closed_captions,
          no_assumed_knowledge, tutorial_type, use_case, industry, complexity_level,
          like_ratio, comment_count, encourages_subscription, audio_quality_score,
          video_quality_score, is_professional, content_freshness_score, innovation_score,
          estimated_learning_time, learning_objectives, prerequisites, key_topics,
          skill_level_required, manual_review_status, flagged_for_review,
          last_quality_update, user_ratings, user_rating_count, click_through_rate,
          watch_time_ratio, user_satisfaction_score
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43,
          $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56
        )
        ON CONFLICT (video_id) 
        DO UPDATE SET
          quality_score = EXCLUDED.quality_score,
          usefulness_score = EXCLUDED.usefulness_score,
          engagement_score = EXCLUDED.engagement_score,
          authority_score = EXCLUDED.authority_score,
          production_score = EXCLUDED.production_score,
          accessibility_score = EXCLUDED.accessibility_score,
          uniqueness_score = EXCLUDED.uniqueness_score,
          educational_score = EXCLUDED.educational_score,
          content_quality_score = EXCLUDED.content_quality_score,
          last_quality_update = EXCLUDED.last_quality_update,
          manual_review_status = 'updated'
        RETURNING id
      `;

      const values = [
        video.video_id, video.title, video.description, video.view_count,
        video.duration, video.channel, video.thumbnail_url, video.video_url,
        video.published_at, video.tool, video.difficulty, video.quality_score,
        video.usefulness_score, video.engagement_score, video.authority_score,
        video.production_score, video.accessibility_score, video.uniqueness_score,
        video.educational_score, video.content_quality_score, video.has_timestamps,
        video.has_code_examples, video.has_hands_on_demo, video.is_beginner_friendly,
        video.is_progressive, video.has_real_world_examples, video.is_official_channel,
        video.is_expert_channel, video.is_original_content, video.has_advanced_techniques,
        video.solves_specific_problems, video.has_closed_captions, video.no_assumed_knowledge,
        video.tutorial_type, video.use_case, video.industry, video.complexity_level,
        video.like_ratio, video.comment_count, video.encourages_subscription,
        video.audio_quality_score, video.video_quality_score, video.is_professional,
        video.content_freshness_score, video.innovation_score, video.estimated_learning_time,
        video.learning_objectives, video.prerequisites, video.key_topics,
        video.skill_level_required, video.manual_review_status, video.flagged_for_review,
        video.last_quality_update, video.user_ratings, video.user_rating_count,
        video.click_through_rate, video.watch_time_ratio, video.user_satisfaction_score
      ];

      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error saving video to database:', error.message);
      throw error;
    }
  }

  async runEnhancedScraping() {
    try {
      console.log('🚀 Starting Enhanced Intelligent Scraping...');
      await testConnection();
      console.log('✅ Database connection successful');

      let totalVideos = 0;
      let totalSaved = 0;

      for (const tool of this.tools) {
        for (const difficulty of this.difficulties) {
          console.log(`\n📊 Processing ${tool} - ${difficulty}...`);
          
          const videos = await this.scrapeVideosForTool(tool, difficulty, 30);
          totalVideos += videos.length;
          
          for (const video of videos) {
            try {
              await this.saveVideoToDatabase(video);
              totalSaved++;
              console.log(`  ✅ Saved: ${video.title.substring(0, 60)}... (Score: ${video.quality_score})`);
            } catch (error) {
              console.error(`  ❌ Failed to save: ${video.title.substring(0, 60)}...`);
            }
          }
          
          // Delay between tools
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`\n🎉 Enhanced scraping completed!`);
      console.log(`📈 Total videos found: ${totalVideos}`);
      console.log(`💾 Total videos saved: ${totalSaved}`);
      console.log(`📊 Average quality score: ${totalSaved > 0 ? 'High (60+)' : 'N/A'}`);

    } catch (error) {
      console.error('❌ Enhanced scraping failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const scraper = new EnhancedIntelligentScraper();
  
  try {
    await scraper.runEnhancedScraping();
    console.log('✅ Enhanced intelligent scraping completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Enhanced intelligent scraping failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedIntelligentScraper, EnhancedQualityScorer };
