#!/usr/bin/env node

/**
 * Add Best Videos Script
 * Finds and adds the highest quality YouTube videos for each automation tool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/workflow_automation'
});

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('❌ YouTube API key not found. Set YOUTUBE_API_KEY environment variable.');
  process.exit(1);
}

// Curated list of best videos for each tool
const BEST_VIDEOS = {
  zapier: [
    {
      title: "Zapier Tutorial for Beginners (2024) - Complete Guide",
      searchQuery: "Zapier tutorial beginners complete guide 2024",
      difficulty: "beginner",
      description: "Complete beginner's guide to Zapier automation"
    },
    {
      title: "Advanced Zapier Workflows - Multi-Step Automation",
      searchQuery: "Zapier advanced workflows multi-step automation",
      difficulty: "advanced", 
      description: "Advanced Zapier techniques for complex workflows"
    },
    {
      title: "Zapier Filters and Conditions - Intermediate Guide",
      searchQuery: "Zapier filters conditions intermediate tutorial",
      difficulty: "intermediate",
      description: "Learn Zapier filters and conditional logic"
    }
  ],
  n8n: [
    {
      title: "n8n Tutorial for Beginners - Workflow Automation",
      searchQuery: "n8n tutorial beginners workflow automation 2024",
      difficulty: "beginner",
      description: "Complete n8n tutorial for beginners"
    },
    {
      title: "Advanced n8n Workflows - Custom Nodes and Logic",
      searchQuery: "n8n advanced custom nodes workflow automation",
      difficulty: "advanced",
      description: "Advanced n8n features and custom development"
    },
    {
      title: "n8n Error Handling and Debugging",
      searchQuery: "n8n error handling debugging troubleshooting",
      difficulty: "intermediate",
      description: "Learn to handle errors and debug n8n workflows"
    }
  ],
  make: [
    {
      title: "Make.com Tutorial for Beginners - Complete Guide",
      searchQuery: "Make.com tutorial beginners complete guide 2024",
      difficulty: "beginner", 
      description: "Complete Make.com tutorial for beginners"
    },
    {
      title: "Advanced Make.com Scenarios - Complex Automation",
      searchQuery: "Make.com advanced scenarios complex automation",
      difficulty: "advanced",
      description: "Advanced Make.com scenario building techniques"
    },
    {
      title: "Make.com Data Transformation and Mapping",
      searchQuery: "Make.com data transformation mapping tutorial",
      difficulty: "intermediate",
      description: "Learn data transformation in Make.com"
    }
  ]
};

class BestVideoAdder {
  constructor() {
    this.addedVideos = [];
  }

  async searchYouTubeVideo(searchQuery, maxResults = 5) {
    try {
      console.log(`🔍 Searching YouTube for: "${searchQuery}"`);
      
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults,
          key: YOUTUBE_API_KEY,
          order: 'relevance',
          videoCategoryId: '28', // Science & Technology
          publishedAfter: '2020-01-01T00:00:00Z'
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log(`⚠️ No videos found for: "${searchQuery}"`);
        return null;
      }

      // Get video details for better metadata
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,statistics,snippet',
          id: videoIds,
          key: YOUTUBE_API_KEY
        }
      });

      // Combine search results with detailed information
      const videos = response.data.items.map(searchItem => {
        const details = detailsResponse.data.items.find(
          detail => detail.id === searchItem.id.videoId
        );
        
        return {
          video_id: searchItem.id.videoId,
          title: searchItem.snippet.title,
          description: searchItem.snippet.description,
          thumbnail_url: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default?.url,
          channel_title: searchItem.snippet.channelTitle,
          published_at: searchItem.snippet.publishedAt,
          duration_seconds: this.parseDuration(details?.contentDetails?.duration),
          view_count: parseInt(details?.statistics?.viewCount || 0),
          video_url: `https://www.youtube.com/watch?v=${searchItem.id.videoId}`
        };
      });

      // Sort by view count (popularity) and return the best one
      videos.sort((a, b) => b.view_count - a.view_count);
      return videos[0];

    } catch (error) {
      console.error(`❌ YouTube API error for "${searchQuery}":`, error.message);
      return null;
    }
  }

  parseDuration(duration) {
    if (!duration) return 0;
    
    // Parse ISO 8601 duration (PT4M13S = 4 minutes 13 seconds)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  async addVideoToDatabase(video, tool, difficulty, searchQuery) {
    try {
      const query = `
        INSERT INTO video_cache (
          video_id, video_url, title, description, thumbnail_url, 
          channel_title, duration_seconds, view_count, difficulty, 
          tool, search_query, cached_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (video_id) 
        DO UPDATE SET
          access_count = video_cache.access_count + 1,
          last_accessed = NOW(),
          updated_at = NOW()
        RETURNING id, video_id, title
      `;

      const values = [
        video.video_id,
        video.video_url,
        video.title,
        video.description,
        video.thumbnail_url,
        video.channel_title,
        video.duration_seconds,
        video.view_count,
        difficulty,
        tool,
        searchQuery
      ];

      const result = await pool.query(query, values);
      return result.rows[0];

    } catch (error) {
      console.error(`❌ Database error adding video ${video.video_id}:`, error.message);
      throw error;
    }
  }

  async addBestVideosForTool(tool) {
    console.log(`\n🎯 Adding best videos for ${tool.toUpperCase()}`);
    console.log('='.repeat(50));

    const videos = BEST_VIDEOS[tool];
    let addedCount = 0;

    for (const videoConfig of videos) {
      try {
        console.log(`\n📹 Processing: ${videoConfig.title}`);
        
        const video = await this.searchYouTubeVideo(videoConfig.searchQuery);
        
        if (!video) {
          console.log(`⚠️ No suitable video found for: ${videoConfig.title}`);
          continue;
        }

        console.log(`✅ Found: "${video.title}"`);
        console.log(`   👀 Views: ${video.view_count.toLocaleString()}`);
        console.log(`   📺 Channel: ${video.channel_title}`);
        console.log(`   ⏱️ Duration: ${Math.floor(video.duration_seconds / 60)}m ${video.duration_seconds % 60}s`);

        const result = await this.addVideoToDatabase(
          video, 
          tool, 
          videoConfig.difficulty, 
          videoConfig.searchQuery
        );

        console.log(`💾 Added to database: ${result.title}`);
        this.addedVideos.push({
          tool,
          difficulty: videoConfig.difficulty,
          title: video.title,
          video_id: video.video_id,
          views: video.view_count
        });

        addedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing ${videoConfig.title}:`, error.message);
      }
    }

    console.log(`\n✅ Added ${addedCount} videos for ${tool.toUpperCase()}`);
    return addedCount;
  }

  async addAllBestVideos() {
    console.log('🚀 Starting Best Videos Addition Process');
    console.log('='.repeat(50));

    let totalAdded = 0;

    for (const tool of Object.keys(BEST_VIDEOS)) {
      try {
        const count = await this.addBestVideosForTool(tool);
        totalAdded += count;
      } catch (error) {
        console.error(`❌ Error processing tool ${tool}:`, error.message);
      }
    }

    console.log('\n🎉 Best Videos Addition Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Total videos added: ${totalAdded}`);
    
    if (this.addedVideos.length > 0) {
      console.log('\n📋 Added Videos Summary:');
      this.addedVideos.forEach((video, index) => {
        console.log(`${index + 1}. [${video.tool.toUpperCase()}] ${video.difficulty.toUpperCase()}`);
        console.log(`   ${video.title}`);
        console.log(`   👀 ${video.views.toLocaleString()} views`);
        console.log(`   🔗 https://www.youtube.com/watch?v=${video.video_id}\n`);
      });
    }

    return totalAdded;
  }

  async close() {
    await pool.end();
  }
}

// Main execution
async function main() {
  const adder = new BestVideoAdder();
  
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Add best videos
    await adder.addAllBestVideos();

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await adder.close();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BestVideoAdder;
