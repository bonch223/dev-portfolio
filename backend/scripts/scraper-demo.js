#!/usr/bin/env node

/**
 * YouTube Video Scraper Demo (Node.js version)
 * Demonstrates scraping YouTube videos using yt-dlp
 * This version outputs to console instead of database for testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class YouTubeScraperDemo {
  constructor() {
    this.searchTerm = "Automation Challenges";
    this.maxResults = 5; // Reduced for demo
    this.videos = [];
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

  async searchYouTubeVideos() {
    try {
      console.log(`🔍 Searching YouTube for: "${this.searchTerm}" (max ${this.maxResults} results)`);
      
      // Use yt-dlp to search for videos
      const searchUrl = `ytsearch${this.maxResults}:${this.searchTerm}`;
      const command = `yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(uploader)s|%(duration)s|%(view_count)s|%(thumbnail)s" "${searchUrl}"`;
      
      const output = execSync(command, { encoding: 'utf8', timeout: 60000 });
      const lines = output.trim().split('\n').filter(line => line.trim());
      
      console.log(`✅ Found ${lines.length} videos from search`);
      return lines;
      
    } catch (error) {
      console.error('❌ YouTube search failed:', error.message);
      return [];
    }
  }

  async getVideoDetails(videoId) {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Get detailed video info
      const command = `yt-dlp --print "%(description)s|%(upload_date)s" "${videoUrl}"`;
      const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
      const parts = output.trim().split('|');
      
      return {
        description: parts[0] || '',
        upload_date: parts[1] || ''
      };
      
    } catch (error) {
      console.error(`❌ Failed to get details for video ${videoId}:`, error.message);
      return { description: '', upload_date: '' };
    }
  }

  displayVideo(videoData) {
    console.log('\n' + '='.repeat(80));
    console.log(`📹 ${videoData.title}`);
    console.log('='.repeat(80));
    console.log(`🎯 Video ID: ${videoData.video_id}`);
    console.log(`👤 Channel: ${videoData.channel}`);
    console.log(`👀 Views: ${videoData.view_count.toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.floor(videoData.duration / 60)}:${(videoData.duration % 60).toString().padStart(2, '0')}`);
    console.log(`📅 Uploaded: ${videoData.upload_date}`);
    console.log(`🔗 URL: ${videoData.video_url}`);
    console.log(`🖼️  Thumbnail: ${videoData.thumbnail_url}`);
    console.log(`📝 Description: ${videoData.description.substring(0, 200)}${videoData.description.length > 200 ? '...' : ''}`);
  }

  async runScraping() {
    try {
      console.log('🚀 Starting YouTube video scraping demo');
      console.log('📝 This demo shows what data we can extract from YouTube videos');
      
      // Check yt-dlp
      if (!(await this.checkYtDlp())) {
        return false;
      }
      
      // Search for videos
      const searchResults = await this.searchYouTubeVideos();
      if (searchResults.length === 0) {
        console.log('⚠️ No videos found to scrape');
        return false;
      }
      
      // Process each video
      let processedVideos = 0;
      
      for (let i = 0; i < searchResults.length; i++) {
        const line = searchResults[i];
        const parts = line.split('|');
        
        if (parts.length < 6) {
          console.log(`⚠️ Skipping malformed video data: ${line}`);
          continue;
        }
        
        const [videoId, title, channel, duration, viewCount, thumbnail] = parts;
        
        console.log(`\n📹 Processing video ${i + 1}/${searchResults.length}: ${title}`);
        
        // Get additional video details
        const details = await this.getVideoDetails(videoId);
        
        const videoData = {
          video_id: videoId,
          title: title,
          description: details.description,
          view_count: parseInt(viewCount) || 0,
          duration: parseInt(duration) || 0,
          channel: channel,
          thumbnail_url: thumbnail,
          video_url: `https://www.youtube.com/watch?v=${videoId}`,
          upload_date: details.upload_date
        };
        
        // Display the video data
        this.displayVideo(videoData);
        
        processedVideos++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Summary
      console.log('\n' + '🎉'.repeat(20));
      console.log('🎉 SCRAPING DEMO COMPLETED!');
      console.log('🎉'.repeat(20));
      console.log(`📊 Successfully processed ${processedVideos} videos`);
      console.log('\n💡 This demonstrates that we can extract:');
      console.log('   ✅ Video ID, Title, Channel');
      console.log('   ✅ View count, Duration, Upload date');
      console.log('   ✅ Thumbnail URLs, Full descriptions');
      console.log('   ✅ Direct video URLs');
      console.log('\n🚀 Ready to integrate with your database!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Scraping demo failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const scraper = new YouTubeScraperDemo();
  
  try {
    const success = await scraper.runScraping();
    
    if (success) {
      console.log('\n✅ Demo completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Demo failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = YouTubeScraperDemo;
