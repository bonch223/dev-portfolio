#!/usr/bin/env node

/**
 * YouTube Video Scraper (Node.js version)
 * Scrapes YouTube videos using yt-dlp and stores them in PostgreSQL database
 * 
 * Requirements:
 * - yt-dlp must be installed: pip install yt-dlp
 * - Node.js with required packages
 */

const { execSync, spawn } = require('child_process');
const { query, testConnection, closePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

class YouTubeScraper {
  constructor() {
    this.searchTerm = "Automation Challenges";
    this.maxResults = 20;
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

  async createTableIfNotExists() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS scraped_videos (
          id SERIAL PRIMARY KEY,
          video_id VARCHAR(50) UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          view_count BIGINT,
          duration INTEGER,
          channel VARCHAR(255),
          thumbnail_url TEXT,
          video_url TEXT NOT NULL,
          published_at TIMESTAMP,
          scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(video_id)
        );
      `;
      
      await query(createTableQuery);
      console.log('✅ scraped_videos table created/verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create table:', error.message);
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

  async insertVideoToDatabase(videoData) {
    try {
      const insertQuery = `
        INSERT INTO scraped_videos (
          video_id, title, description, view_count, duration, 
          channel, thumbnail_url, video_url, published_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          CASE WHEN $9 = '' THEN NULL ELSE to_timestamp($9, 'YYYYMMDD') END
        )
        ON CONFLICT (video_id) 
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          view_count = EXCLUDED.view_count,
          duration = EXCLUDED.duration,
          channel = EXCLUDED.channel,
          thumbnail_url = EXCLUDED.thumbnail_url,
          scraped_at = CURRENT_TIMESTAMP
        RETURNING id, video_id, title;
      `;
      
      const values = [
        videoData.video_id,
        videoData.title,
        videoData.description,
        videoData.view_count,
        videoData.duration,
        videoData.channel,
        videoData.thumbnail_url,
        videoData.video_url,
        videoData.upload_date
      ];
      
      const result = await query(insertQuery, values);
      
      if (result.rows && result.rows.length > 0) {
        console.log(`✅ Inserted/Updated video: ${result.rows[0].title}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error(`❌ Database error for video ${videoData.video_id}:`, error.message);
      return false;
    }
  }

  async runScraping() {
    try {
      console.log('🚀 Starting YouTube video scraping process');
      
      // Test database connection
      await testConnection();
      console.log('✅ Database connection successful');
      
      // Check yt-dlp
      if (!(await this.checkYtDlp())) {
        return false;
      }
      
      // Create table if needed
      if (!(await this.createTableIfNotExists())) {
        return false;
      }
      
      // Search for videos
      const searchResults = await this.searchYouTubeVideos();
      if (searchResults.length === 0) {
        console.log('⚠️ No videos found to scrape');
        return false;
      }
      
      // Process each video
      let successfulInserts = 0;
      let failedInserts = 0;
      
      for (let i = 0; i < searchResults.length; i++) {
        const line = searchResults[i];
        const parts = line.split('|');
        
        if (parts.length < 6) {
          console.log(`⚠️ Skipping malformed video data: ${line}`);
          failedInserts++;
          continue;
        }
        
        const [videoId, title, channel, duration, viewCount, thumbnail] = parts;
        
        console.log(`📹 Processing video ${i + 1}/${searchResults.length}: ${title}`);
        
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
        
        // Insert into database
        if (await this.insertVideoToDatabase(videoData)) {
          successfulInserts++;
        } else {
          failedInserts++;
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Summary
      console.log('🎉 Scraping completed!');
      console.log(`📊 Results: ${successfulInserts} successful, ${failedInserts} failed`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Scraping process failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const scraper = new YouTubeScraper();
  
  try {
    const success = await scraper.runScraping();
    
    if (success) {
      console.log('✅ Scraping process completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Scraping process failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = YouTubeScraper;
