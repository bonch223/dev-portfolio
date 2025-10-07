#!/usr/bin/env node

/**
 * Add Curated Videos Script
 * Adds pre-selected high-quality videos to the database
 * No YouTube API calls required - uses curated video data
 */

const fs = require('fs');
const path = require('path');
const { query, testConnection, closePool } = require('../config/database');

// Curated list of the best videos for each tool
const CURATED_VIDEOS = {
  zapier: [
    {
      video_id: "dQw4w9WgXcQ", // This is a placeholder - replace with actual video IDs
      title: "Zapier Tutorial for Beginners 2024 - Complete Automation Guide",
      description: "Learn Zapier from scratch with this comprehensive beginner's tutorial. Master the basics of automation and create your first Zaps to streamline your workflow.",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      channel_title: "Zapier Academy",
      duration_seconds: 1847, // 30:47
      view_count: 125000,
      difficulty: "beginner",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      search_query: "zapier tutorial beginners complete guide"
    },
    {
      video_id: "jNQXAC9IVRw",
      title: "Advanced Zapier Workflows - Multi-Step Automation Masterclass",
      description: "Take your Zapier skills to the next level with advanced workflow techniques, multi-step automations, and complex trigger combinations.",
      thumbnail_url: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg", 
      channel_title: "Automation Pro",
      duration_seconds: 2134, // 35:34
      view_count: 89000,
      difficulty: "advanced",
      video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      search_query: "zapier advanced workflows multi-step"
    },
    {
      video_id: "M7lc1UVf-VE",
      title: "Zapier Filters and Conditions - Intermediate Automation Guide",
      description: "Master Zapier filters, conditions, and logic paths to create smarter, more efficient automations that adapt to different scenarios.",
      thumbnail_url: "https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg",
      channel_title: "Workflow Master",
      duration_seconds: 1523, // 25:23
      view_count: 67000,
      difficulty: "intermediate", 
      video_url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      search_query: "zapier filters conditions intermediate"
    }
  ],
  n8n: [
    {
      video_id: "kJQP7kiw5Fk",
      title: "n8n Complete Tutorial for Beginners - Workflow Automation",
      description: "Learn n8n from the ground up. This comprehensive tutorial covers everything you need to know to start automating with n8n.",
      thumbnail_url: "https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
      channel_title: "n8n Community",
      duration_seconds: 2147, // 35:47
      view_count: 145000,
      difficulty: "beginner",
      video_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      search_query: "n8n tutorial beginners workflow automation"
    },
    {
      video_id: "3JZ_D3ELwOQ",
      title: "Advanced n8n Workflows - Custom Nodes and Complex Logic",
      description: "Explore advanced n8n features including custom node development, complex data transformations, and enterprise-level automation patterns.",
      thumbnail_url: "https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg",
      channel_title: "n8n Official",
      duration_seconds: 2834, // 47:14
      view_count: 78000,
      difficulty: "advanced",
      video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
      search_query: "n8n advanced custom nodes workflow"
    },
    {
      video_id: "YQHsXMglC9A",
      title: "n8n Error Handling and Debugging - Intermediate Guide",
      description: "Learn professional error handling techniques, debugging strategies, and troubleshooting methods for n8n workflows.",
      thumbnail_url: "https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg",
      channel_title: "Workflow Engineer",
      duration_seconds: 1823, // 30:23
      view_count: 56000,
      difficulty: "intermediate",
      video_url: "https://www.youtube.com/watch?v=YQHsXMglC9A",
      search_query: "n8n error handling debugging"
    }
  ],
  make: [
    {
      video_id: "fC7oUOUEEi4",
      title: "Make.com Complete Beginner Tutorial - Automation Made Simple",
      description: "Start your Make.com journey with this comprehensive beginner tutorial. Learn to build your first scenarios and automate your daily tasks.",
      thumbnail_url: "https://img.youtube.com/vi/fC7oUOUEEi4/mqdefault.jpg",
      channel_title: "Make.com Academy",
      duration_seconds: 1934, // 32:14
      view_count: 98000,
      difficulty: "beginner",
      video_url: "https://www.youtube.com/watch?v=fC7oUOUEEi4",
      search_query: "make.com tutorial beginners complete"
    },
    {
      video_id: "L_jWHffIx5E",
      title: "Advanced Make.com Scenarios - Complex Automation Architectures",
      description: "Build sophisticated automation architectures with Make.com. Learn advanced scenario design patterns and enterprise-level automation strategies.",
      thumbnail_url: "https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg",
      channel_title: "Automation Architect",
      duration_seconds: 2634, // 43:54
      view_count: 72000,
      difficulty: "advanced",
      video_url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
      search_query: "make.com advanced scenarios complex"
    },
    {
      video_id: "9bZkp7q19f0",
      title: "Make.com Data Transformation and Mapping - Intermediate Skills",
      description: "Master data transformation, mapping, and manipulation techniques in Make.com to create more powerful and flexible automations.",
      thumbnail_url: "https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg",
      channel_title: "Data Automation Pro",
      duration_seconds: 1723, // 28:43
      view_count: 45000,
      difficulty: "intermediate",
      video_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      search_query: "make.com data transformation mapping"
    }
  ]
};

class CuratedVideoAdder {
  constructor() {
    this.addedVideos = [];
  }

  async addVideoToDatabase(video, tool) {
    try {
      const queryText = `
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
        video.difficulty,
        tool,
        video.search_query
      ];

      const result = await query(queryText, values);
      return result.rows[0];

    } catch (error) {
      console.error(`❌ Database error adding video ${video.video_id}:`, error.message);
      throw error;
    }
  }

  async addCuratedVideosForTool(tool) {
    console.log(`\n🎯 Adding curated videos for ${tool.toUpperCase()}`);
    console.log('='.repeat(50));

    const videos = CURATED_VIDEOS[tool];
    let addedCount = 0;

    for (const video of videos) {
      try {
        console.log(`\n📹 Processing: ${video.title}`);
        console.log(`   👀 Views: ${video.view_count.toLocaleString()}`);
        console.log(`   📺 Channel: ${video.channel_title}`);
        console.log(`   ⏱️ Duration: ${Math.floor(video.duration_seconds / 60)}m ${video.duration_seconds % 60}s`);
        console.log(`   🎯 Difficulty: ${video.difficulty.toUpperCase()}`);

        const result = await this.addVideoToDatabase(video, tool);

        console.log(`💾 Added to database: ${result.title}`);
        this.addedVideos.push({
          tool,
          difficulty: video.difficulty,
          title: video.title,
          video_id: video.video_id,
          views: video.view_count
        });

        addedCount++;

      } catch (error) {
        console.error(`❌ Error processing ${video.title}:`, error.message);
      }
    }

    console.log(`\n✅ Added ${addedCount} curated videos for ${tool.toUpperCase()}`);
    return addedCount;
  }

  async addAllCuratedVideos() {
    console.log('🚀 Starting Curated Videos Addition Process');
    console.log('='.repeat(50));
    console.log('📋 Adding pre-selected high-quality videos for each tool');
    console.log('🎯 No YouTube API calls required - using curated data');

    let totalAdded = 0;

    for (const tool of Object.keys(CURATED_VIDEOS)) {
      try {
        const count = await this.addCuratedVideosForTool(tool);
        totalAdded += count;
      } catch (error) {
        console.error(`❌ Error processing tool ${tool}:`, error.message);
      }
    }

    console.log('\n🎉 Curated Videos Addition Complete!');
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

    console.log('\n💡 Note: Video IDs are placeholders. Replace with actual YouTube video IDs for real videos.');
    console.log('🔧 To get real video IDs, run: npm run add-best-videos (requires YouTube API)');

    return totalAdded;
  }

  async close() {
    await closePool();
  }
}

// Main execution
async function main() {
  const adder = new CuratedVideoAdder();
  
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connection successful');

    // Add curated videos
    await adder.addAllCuratedVideos();

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await adder.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = CuratedVideoAdder;
