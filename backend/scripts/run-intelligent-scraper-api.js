#!/usr/bin/env node

/**
 * Run Intelligent Scraper via API
 * This script calls the deployed backend to run the intelligent scraper
 */

const { execSync } = require('child_process');

class IntelligentScraperAPI {
  constructor() {
    this.backendUrl = 'https://backend-production-cd9f.up.railway.app';
    this.maxVideosPerTerm = 30; // Increased for lots of videos
    this.minViews = 1000;
    this.minDuration = 120;
    this.maxDuration = 3600;
  }

  async checkYtDlp() {
    try {
      console.log('🔍 Checking if yt-dlp is installed...');
      execSync('yt-dlp --version', { stdio: 'pipe' });
      console.log('✅ yt-dlp is installed');
      return true;
    } catch (error) {
      console.log('❌ yt-dlp is not installed');
      console.log('💡 Install it with: pip install yt-dlp');
      return false;
    }
  }

  detectDifficulty(title, description, channel) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    const channelLower = channel.toLowerCase();
    
    // Advanced indicators
    const advancedKeywords = [
      'advanced', 'expert', 'professional', 'enterprise', 'complex', 'sophisticated',
      'api', 'webhook', 'custom node', 'javascript', 'json', 'rest api', 'oauth',
      'authentication', 'authorization', 'integration', 'deployment', 'production',
      'scaling', 'optimization', 'performance', 'debugging', 'troubleshooting'
    ];
    
    // Intermediate indicators
    const intermediateKeywords = [
      'intermediate', 'step by step', 'complete guide', 'full tutorial', 'comprehensive',
      'workflow', 'automation', 'trigger', 'action', 'filter', 'condition', 'logic',
      'multi-step', 'complex workflow', 'advanced zap', 'scenario', 'template'
    ];
    
    // Beginner indicators
    const beginnerKeywords = [
      'beginner', 'basics', 'introduction', 'getting started', 'first', 'simple',
      'easy', 'quick', 'tutorial', 'how to', 'learn', 'start', 'new to',
      'for beginners', 'step by step', 'basic', 'fundamentals'
    ];
    
    // Count keyword matches
    let advancedScore = 0;
    let intermediateScore = 0;
    let beginnerScore = 0;
    
    const allText = `${titleLower} ${descLower} ${channelLower}`;
    
    advancedKeywords.forEach(keyword => {
      if (allText.includes(keyword)) advancedScore++;
    });
    
    intermediateKeywords.forEach(keyword => {
      if (allText.includes(keyword)) intermediateScore++;
    });
    
    beginnerKeywords.forEach(keyword => {
      if (allText.includes(keyword)) beginnerScore++;
    });
    
    // Determine difficulty based on scores
    if (advancedScore >= 2 || (advancedScore > 0 && intermediateScore === 0)) {
      return 'advanced';
    } else if (intermediateScore >= 2 || (intermediateScore > 0 && beginnerScore < 2)) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  calculateQualityScore(videoData) {
    let score = 0;
    
    // View count scoring (0-40 points)
    if (videoData.view_count >= 100000) score += 40;
    else if (videoData.view_count >= 50000) score += 35;
    else if (videoData.view_count >= 25000) score += 30;
    else if (videoData.view_count >= 10000) score += 25;
    else if (videoData.view_count >= 5000) score += 20;
    else if (videoData.view_count >= 1000) score += 15;
    else score += 5;
    
    // Duration scoring (0-20 points)
    if (videoData.duration >= 600 && videoData.duration <= 1800) score += 20; // 10-30 min ideal
    else if (videoData.duration >= 300 && videoData.duration <= 3600) score += 15; // 5min-1hour good
    else if (videoData.duration >= 120 && videoData.duration <= 7200) score += 10; // 2min-2hour acceptable
    else score += 5;
    
    // Title quality (0-20 points)
    const title = videoData.title.toLowerCase();
    if (title.includes('tutorial') || title.includes('guide')) score += 10;
    if (title.includes('complete') || title.includes('full')) score += 5;
    if (title.includes('step by step')) score += 5;
    
    // Description quality (0-20 points)
    const desc = videoData.description.toLowerCase();
    if (desc.length > 500) score += 10; // Detailed description
    if (desc.includes('timestamp') || desc.includes('chapter')) score += 5;
    if (desc.includes('download') || desc.includes('resource')) score += 5;
    
    return Math.min(score, 100); // Cap at 100
  }

  calculateUsefulnessScore(videoData) {
    let score = 0;
    
    // Channel authority (0-30 points)
    const channel = videoData.channel.toLowerCase();
    const authoritativeChannels = [
      'zapier', 'n8n', 'make.com', 'integromat', 'automation anywhere',
      'uipath', 'microsoft power automate', 'ifttt', 'automation academy',
      'workflow automation', 'no-code', 'low-code'
    ];
    
    if (authoritativeChannels.some(auth => channel.includes(auth))) {
      score += 30;
    } else if (channel.includes('tutorial') || channel.includes('automation')) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Content indicators (0-40 points)
    const title = videoData.title.toLowerCase();
    const desc = videoData.description.toLowerCase();
    
    if (title.includes('tutorial') || title.includes('guide')) score += 15;
    if (title.includes('automation') || title.includes('workflow')) score += 10;
    if (desc.includes('step') || desc.includes('how to')) score += 10;
    if (desc.includes('example') || desc.includes('demo')) score += 5;
    
    // Engagement indicators (0-30 points)
    if (videoData.view_count >= 10000) score += 30;
    else if (videoData.view_count >= 5000) score += 25;
    else if (videoData.view_count >= 1000) score += 20;
    else score += 10;
    
    return Math.min(score, 100); // Cap at 100
  }

  analyzeContent(videoData) {
    const title = videoData.title.toLowerCase();
    const desc = videoData.description.toLowerCase();
    const allText = `${title} ${desc}`;
    
    return {
      hasTutorialContent: allText.includes('tutorial') || allText.includes('guide') || allText.includes('how to'),
      hasCodeExamples: allText.includes('code') || allText.includes('javascript') || allText.includes('json') || allText.includes('api'),
      isSeries: allText.includes('part') || allText.includes('episode') || allText.includes('series'),
      keywords: this.extractKeywords(allText),
      tags: this.extractTags(title, desc)
    };
  }

  extractKeywords(text) {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    
    const keywords = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10); // Top 10 keywords
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  extractTags(title, description) {
    const tags = [];
    const allText = `${title} ${description}`.toLowerCase();
    
    // Tool-specific tags
    if (allText.includes('zapier')) tags.push('zapier');
    if (allText.includes('n8n')) tags.push('n8n');
    if (allText.includes('make.com') || allText.includes('integromat')) tags.push('make.com');
    
    // Content type tags
    if (allText.includes('tutorial')) tags.push('tutorial');
    if (allText.includes('automation')) tags.push('automation');
    if (allText.includes('workflow')) tags.push('workflow');
    if (allText.includes('api')) tags.push('api');
    if (allText.includes('webhook')) tags.push('webhook');
    if (allText.includes('integration')) tags.push('integration');
    
    // Difficulty tags
    if (allText.includes('beginner')) tags.push('beginner');
    if (allText.includes('intermediate')) tags.push('intermediate');
    if (allText.includes('advanced')) tags.push('advanced');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  async searchYouTubeVideos(searchTerm, maxResults) {
    try {
      console.log(`🔍 Searching: "${searchTerm}" (max ${maxResults} results)`);
      
      const searchUrl = `ytsearch${maxResults}:${searchTerm}`;
      const command = `yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(uploader)s|%(duration)s|%(view_count)s|%(thumbnail)s" "${searchUrl}"`;
      
      const output = execSync(command, { encoding: 'utf8', timeout: 60000 });
      const lines = output.trim().split('\n').filter(line => line.trim());
      
      console.log(`✅ Found ${lines.length} videos`);
      return lines;
      
    } catch (error) {
      console.error(`❌ Search failed for "${searchTerm}":`, error.message);
      return [];
    }
  }

  async getVideoDetails(videoId) {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const command = `yt-dlp --print "%(description)s|%(upload_date)s|%(tags)s" "${videoUrl}"`;
      const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
      const parts = output.trim().split('|');
      
      return {
        description: parts[0] || '',
        upload_date: parts[1] || '',
        yt_tags: parts[2] || ''
      };
      
    } catch (error) {
      console.error(`❌ Failed to get details for ${videoId}:`, error.message);
      return { description: '', upload_date: '', yt_tags: '' };
    }
  }

  async insertVideoViaAPI(videoData) {
    try {
      const response = await fetch(`${this.backendUrl}/api/videos/add-scraped-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${videoData.tool.toUpperCase()} [${videoData.difficulty.toUpperCase()}] Quality:${videoData.quality_score} Usefulness:${videoData.usefulness_score} - ${videoData.title}`);
        return true;
      } else {
        console.log(`⚠️ ${result.message || 'Failed to insert video'}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ API error for ${videoData.video_id}:`, error.message);
      return false;
    }
  }

  async scrapeTool(tool) {
    console.log(`\n🚀 Starting scraping for ${tool.name.toUpperCase()}`);
    console.log('='.repeat(60));
    
    let totalVideos = 0;
    let successfulInserts = 0;
    let qualityFiltered = 0;
    
    for (const searchTerm of tool.searchTerms.slice(0, 2)) { // Only first 2 terms for demo
      console.log(`\n📝 Search term: "${searchTerm}"`);
      
      const searchResults = await this.searchYouTubeVideos(searchTerm, this.maxVideosPerTerm);
      
      for (let i = 0; i < searchResults.length; i++) {
        const line = searchResults[i];
        const parts = line.split('|');
        
        if (parts.length < 6) {
          console.log(`⚠️ Skipping malformed data: ${line}`);
          continue;
        }
        
        const [videoId, title, channel, duration, viewCount, thumbnail] = parts;
        totalVideos++;
        
        // Basic quality filtering
        const views = parseInt(viewCount) || 0;
        const dur = parseInt(duration) || 0;
        
        if (views < this.minViews) {
          console.log(`🚫 Low views (${views.toLocaleString()}): ${title}`);
          continue;
        }
        
        if (dur < this.minDuration || dur > this.maxDuration) {
          console.log(`🚫 Duration issue (${dur}s): ${title}`);
          continue;
        }
        
        console.log(`📹 Processing: ${title}`);
        
        // Get detailed information
        const details = await this.getVideoDetails(videoId);
        
        // Analyze content
        const difficulty = this.detectDifficulty(title, details.description, channel);
        const qualityScore = this.calculateQualityScore({
          view_count: views,
          duration: dur,
          title,
          description: details.description
        });
        const usefulnessScore = this.calculateUsefulnessScore({
          channel,
          title,
          description: details.description,
          view_count: views
        });
        
        // Skip low-quality videos
        if (qualityScore < 50) {
          console.log(`🚫 Low quality (${qualityScore}): ${title}`);
          qualityFiltered++;
          continue;
        }
        
        const contentAnalysis = this.analyzeContent({
          title,
          description: details.description
        });
        
        const videoData = {
          video_id: videoId,
          title: title,
          description: details.description,
          view_count: views,
          duration: dur,
          channel: channel,
          thumbnail_url: thumbnail,
          video_url: `https://www.youtube.com/watch?v=${videoId}`,
          upload_date: details.upload_date,
          difficulty: difficulty,
          tool: tool.name,
          quality_score: qualityScore,
          usefulness_score: usefulnessScore,
          keywords: contentAnalysis.keywords,
          tags: contentAnalysis.tags,
          has_tutorial_content: contentAnalysis.hasTutorialContent,
          has_code_examples: contentAnalysis.hasCodeExamples,
          is_series: contentAnalysis.isSeries
        };
        
        // Insert via API
        if (await this.insertVideoViaAPI(videoData)) {
          successfulInserts++;
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📊 ${tool.name.toUpperCase()} Summary:`);
    console.log(`   Total videos found: ${totalVideos}`);
    console.log(`   Quality filtered out: ${qualityFiltered}`);
    console.log(`   Successfully inserted: ${successfulInserts}`);
    
    return { totalVideos, qualityFiltered, successfulInserts };
  }

  async runScraping() {
    try {
      console.log('🚀 Starting Intelligent YouTube Video Scraping via API');
      
      // Check yt-dlp
      if (!(await this.checkYtDlp())) {
        return false;
      }
      
      const tools = [
        {
          name: 'zapier',
          searchTerms: [
            'zapier tutorial beginner',
            'zapier automation basics'
          ]
        },
        {
          name: 'n8n',
          searchTerms: [
            'n8n tutorial beginner',
            'n8n workflow automation'
          ]
        },
        {
          name: 'make',
          searchTerms: [
            'make.com tutorial beginner',
            'make.com automation'
          ]
        }
      ];
      
      let totalStats = {
        totalVideos: 0,
        qualityFiltered: 0,
        successfulInserts: 0
      };
      
      // Scrape each tool
      for (const tool of tools) {
        const stats = await this.scrapeTool(tool);
        totalStats.totalVideos += stats.totalVideos;
        totalStats.qualityFiltered += stats.qualityFiltered;
        totalStats.successfulInserts += stats.successfulInserts;
      }
      
      // Final summary
      console.log('\n' + '🎉'.repeat(20));
      console.log('🎉 INTELLIGENT SCRAPING COMPLETED!');
      console.log('🎉'.repeat(20));
      console.log(`📊 Total videos processed: ${totalStats.totalVideos}`);
      console.log(`🚫 Quality filtered: ${totalStats.qualityFiltered}`);
      console.log(`✅ Successfully added to database: ${totalStats.successfulInserts}`);
      console.log(`📈 Success rate: ${((totalStats.successfulInserts / totalStats.totalVideos) * 100).toFixed(1)}%`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Scraping process failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const scraper = new IntelligentScraperAPI();
  
  try {
    const success = await scraper.runScraping();
    
    if (success) {
      console.log('\n✅ Intelligent scraping completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Scraping failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = IntelligentScraperAPI;
