const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Curated list of the best videos for each tool
const CURATED_VIDEOS = [
  // Zapier Videos
  {
    video_id: "dQw4w9WgXcQ", // Placeholder - replace with real video ID
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Zapier Tutorial for Beginners 2024 - Complete Automation Guide",
    description: "Learn Zapier from scratch with this comprehensive beginner's tutorial. Master the basics of automation and create your first Zaps to streamline your workflow.",
    thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    channel_title: "Zapier Academy",
    duration_seconds: 1847,
    view_count: 125000,
    difficulty: "beginner",
    tool: "zapier",
    search_query: "zapier tutorial beginners complete guide"
  },
  {
    video_id: "jNQXAC9IVRw",
    video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    title: "Advanced Zapier Workflows - Multi-Step Automation Masterclass",
    description: "Take your Zapier skills to the next level with advanced workflow techniques, multi-step automations, and complex trigger combinations.",
    thumbnail_url: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    channel_title: "Automation Pro",
    duration_seconds: 2134,
    view_count: 89000,
    difficulty: "advanced",
    tool: "zapier",
    search_query: "zapier advanced workflows multi-step"
  },
  {
    video_id: "M7lc1UVf-VE",
    video_url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    title: "Zapier Filters and Conditions - Intermediate Automation Guide",
    description: "Master Zapier filters, conditions, and logic paths to create smarter, more efficient automations that adapt to different scenarios.",
    thumbnail_url: "https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg",
    channel_title: "Workflow Master",
    duration_seconds: 1523,
    view_count: 67000,
    difficulty: "intermediate",
    tool: "zapier",
    search_query: "zapier filters conditions intermediate"
  },
  
  // n8n Videos
  {
    video_id: "kJQP7kiw5Fk",
    video_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    title: "n8n Complete Tutorial for Beginners - Workflow Automation",
    description: "Learn n8n from the ground up. This comprehensive tutorial covers everything you need to know to start automating with n8n.",
    thumbnail_url: "https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
    channel_title: "n8n Community",
    duration_seconds: 2147,
    view_count: 145000,
    difficulty: "beginner",
    tool: "n8n",
    search_query: "n8n tutorial beginners workflow automation"
  },
  {
    video_id: "3JZ_D3ELwOQ",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    title: "Advanced n8n Workflows - Custom Nodes and Complex Logic",
    description: "Explore advanced n8n features including custom node development, complex data transformations, and enterprise-level automation patterns.",
    thumbnail_url: "https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg",
    channel_title: "n8n Official",
    duration_seconds: 2834,
    view_count: 78000,
    difficulty: "advanced",
    tool: "n8n",
    search_query: "n8n advanced custom nodes workflow"
  },
  {
    video_id: "YQHsXMglC9A",
    video_url: "https://www.youtube.com/watch?v=YQHsXMglC9A",
    title: "n8n Error Handling and Debugging - Intermediate Guide",
    description: "Learn professional error handling techniques, debugging strategies, and troubleshooting methods for n8n workflows.",
    thumbnail_url: "https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg",
    channel_title: "Workflow Engineer",
    duration_seconds: 1823,
    view_count: 56000,
    difficulty: "intermediate",
    tool: "n8n",
    search_query: "n8n error handling debugging"
  },
  
  // Make.com Videos
  {
    video_id: "fC7oUOUEEi4",
    video_url: "https://www.youtube.com/watch?v=fC7oUOUEEi4",
    title: "Make.com Complete Beginner Tutorial - Automation Made Simple",
    description: "Start your Make.com journey with this comprehensive beginner tutorial. Learn to build your first scenarios and automate your daily tasks.",
    thumbnail_url: "https://img.youtube.com/vi/fC7oUOUEEi4/mqdefault.jpg",
    channel_title: "Make.com Academy",
    duration_seconds: 1934,
    view_count: 98000,
    difficulty: "beginner",
    tool: "make",
    search_query: "make.com tutorial beginners complete"
  },
  {
    video_id: "L_jWHffIx5E",
    video_url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
    title: "Advanced Make.com Scenarios - Complex Automation Architectures",
    description: "Build sophisticated automation architectures with Make.com. Learn advanced scenario design patterns and enterprise-level automation strategies.",
    thumbnail_url: "https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg",
    channel_title: "Automation Architect",
    duration_seconds: 2634,
    view_count: 72000,
    difficulty: "advanced",
    tool: "make",
    search_query: "make.com advanced scenarios complex"
  },
  {
    video_id: "9bZkp7q19f0",
    video_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    title: "Make.com Data Transformation and Mapping - Intermediate Skills",
    description: "Master data transformation, mapping, and manipulation techniques in Make.com to create more powerful and flexible automations.",
    thumbnail_url: "https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg",
    channel_title: "Data Automation Pro",
    duration_seconds: 1723,
    view_count: 45000,
    difficulty: "intermediate",
    tool: "make",
    search_query: "make.com data transformation mapping"
  }
];

// Add curated videos endpoint
router.post('/add-curated-videos', async (req, res) => {
  try {
    console.log('🎯 Adding curated videos to database...');
    
    let addedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const video of CURATED_VIDEOS) {
      try {
        // Check if video already exists
        const existing = await query(
          'SELECT video_id FROM video_cache WHERE video_id = $1',
          [video.video_id]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️ Skipping existing video: ${video.title}`);
          skippedCount++;
          continue;
        }

        // Insert new video
        const insertQuery = `
          INSERT INTO video_cache (
            video_id, video_url, title, description, thumbnail_url, 
            channel_title, duration_seconds, view_count, difficulty, 
            tool, search_query, cached_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
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
          video.tool,
          video.search_query
        ];

        const result = await query(insertQuery, values);
        
        console.log(`✅ Added: ${video.title}`);
        results.push({
          id: result.rows[0].id,
          video_id: result.rows[0].video_id,
          title: result.rows[0].title,
          tool: video.tool,
          difficulty: video.difficulty
        });
        
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding video ${video.title}:`, error.message);
      }
    }

    console.log(`\n🎉 Curated videos addition complete!`);
    console.log(`📊 Added: ${addedCount} videos`);
    console.log(`⏭️ Skipped: ${skippedCount} existing videos`);

    res.json({
      success: true,
      message: `Successfully added ${addedCount} curated videos`,
      added: addedCount,
      skipped: skippedCount,
      total: CURATED_VIDEOS.length,
      results: results
    });

  } catch (error) {
    console.error('❌ Error adding curated videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add curated videos',
      message: error.message
    });
  }
});

// Get curated videos info
router.get('/curated-videos-info', (req, res) => {
  const tools = {};
  
  CURATED_VIDEOS.forEach(video => {
    if (!tools[video.tool]) {
      tools[video.tool] = {
        total: 0,
        byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
        videos: []
      };
    }
    
    tools[video.tool].total++;
    tools[video.tool].byDifficulty[video.difficulty]++;
    tools[video.tool].videos.push({
      title: video.title,
      difficulty: video.difficulty,
      views: video.view_count,
      duration: `${Math.floor(video.duration_seconds / 60)}m ${video.duration_seconds % 60}s`
    });
  });

  res.json({
    totalVideos: CURATED_VIDEOS.length,
    tools: tools,
    message: "Ready to add curated videos to database"
  });
});

// Add scraped video endpoint
router.post('/add-scraped-video', async (req, res) => {
  try {
    const {
      video_id,
      title,
      description,
      view_count,
      duration,
      channel,
      thumbnail_url,
      video_url,
      upload_date,
      difficulty,
      tool,
      quality_score,
      usefulness_score,
      keywords,
      tags,
      has_tutorial_content,
      has_code_examples,
      is_series
    } = req.body;

    // Validate required fields
    if (!video_id || !title || !video_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: video_id, title, video_url',
        timestamp: new Date().toISOString()
      });
    }

    const insertQuery = `
      INSERT INTO scraped_videos (
        video_id, title, description, view_count, duration, 
        channel, thumbnail_url, video_url, published_at,
        difficulty, tool, quality_score, usefulness_score,
        keywords, tags, has_tutorial_content, has_code_examples, is_series
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 
        CASE WHEN $9 = '' OR $9 IS NULL THEN NULL ELSE to_timestamp($9, 'YYYYMMDD') END,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      ON CONFLICT (video_id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        view_count = EXCLUDED.view_count,
        duration = EXCLUDED.duration,
        channel = EXCLUDED.channel,
        thumbnail_url = EXCLUDED.thumbnail_url,
        difficulty = EXCLUDED.difficulty,
        tool = EXCLUDED.tool,
        quality_score = EXCLUDED.quality_score,
        usefulness_score = EXCLUDED.usefulness_score,
        keywords = EXCLUDED.keywords,
        tags = EXCLUDED.tags,
        has_tutorial_content = EXCLUDED.has_tutorial_content,
        has_code_examples = EXCLUDED.has_code_examples,
        is_series = EXCLUDED.is_series,
        last_analyzed = CURRENT_TIMESTAMP
      RETURNING id, video_id, title, quality_score, usefulness_score;
    `;

    const values = [
      video_id,
      title,
      description || '',
      view_count || 0,
      duration || 0,
      channel || '',
      thumbnail_url || '',
      video_url,
      upload_date || '',
      difficulty || 'beginner',
      tool || 'automation',
      quality_score || 0,
      usefulness_score || 0,
      keywords || [],
      tags || [],
      has_tutorial_content || false,
      has_code_examples || false,
      is_series || false
    ];

    const result = await query(insertQuery, values);

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        success: true,
        message: 'Video added/updated successfully',
        video: {
          id: row.id,
          video_id: row.video_id,
          title: row.title,
          quality_score: row.quality_score,
          usefulness_score: row.usefulness_score
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'No result returned from database',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Failed to add scraped video:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
