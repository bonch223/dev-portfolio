const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Search scraped videos endpoint
router.get('/search', async (req, res) => {
  try {
    const { tool, query: searchQuery, difficulty, page = 0, limit = 12 } = req.query;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool parameter is required' });
    }

    console.log(`🔍 Searching scraped videos: tool=${tool}, difficulty=${difficulty}, query="${searchQuery}"`);

    let whereConditions = ['tool = $1'];
    let queryParams = [tool];
    let paramIndex = 2;

    // Add difficulty filter if specified
    if (difficulty && difficulty !== 'all') {
      whereConditions.push(`difficulty = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    // Add search query filter if specified
    if (searchQuery && searchQuery.trim()) {
      whereConditions.push(`(
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        channel ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(keywords) OR
        $${paramIndex + 1} = ANY(tags)
      )`);
      queryParams.push(`%${searchQuery.trim()}%`, searchQuery.trim());
      paramIndex += 2;
    }

    // Only show high-quality videos (quality_score >= 50)
    whereConditions.push('quality_score >= 50');

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM scraped_videos 
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const totalVideos = parseInt(countResult.rows[0].total);

    // Get all videos with quality sorting (no pagination)
    const videosQuery = `
      SELECT 
        video_id as id,
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
        video_url,
        'scraped' as source
      FROM scraped_videos 
      WHERE ${whereClause}
      ORDER BY quality_score DESC, usefulness_score DESC, view_count DESC
    `;

    const result = await query(videosQuery, queryParams);
    const videos = result.rows;

    // Transform videos to match frontend expectations
    const transformedVideos = videos.map(video => {
      // Fix thumbnail URL - use YouTube thumbnail API if thumbnail is "NA" or empty
      let thumbnailUrl = video.thumbnail;
      if (!thumbnailUrl || thumbnailUrl === 'NA' || thumbnailUrl === '') {
        thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
      }
      
      // Ensure view count is properly formatted
      const viewCount = video.viewCount || 0;
      
      return {
        id: video.id,
        videoId: video.id,
        title: video.title,
        description: video.description,
        thumbnail: thumbnailUrl,
        channelTitle: video.channelTitle,
        duration: video.duration_seconds,
        duration_seconds: video.duration_seconds,
        views: viewCount,
        viewCount: viewCount,
        difficulty: video.difficulty,
        tool: video.tool,
        url: video.video_url,
        video_url: video.video_url,
        quality_score: video.quality_score,
        usefulness_score: video.usefulness_score,
        keywords: video.keywords,
        tags: video.tags,
        has_tutorial_content: video.has_tutorial_content,
        has_code_examples: video.has_code_examples,
        is_series: video.is_series,
        published_at: video.published_at,
        cached_at: video.cached_at,
        source: video.source,
        // Add rating based on quality score for display
        rating: Math.round(video.quality_score / 10) / 2 // Convert 0-100 to 0-5 star rating
      };
    });

    console.log(`✅ Found ${videos.length} scraped videos for ${tool} - ${difficulty}`);

    res.json({
      videos: transformedVideos,
      fromCache: true, // Always from database
      cachedAt: videos[0]?.cached_at || new Date().toISOString(),
      totalVideos: videos.length,
      hasMore: false, // No pagination - show all videos
      nextPage: null,
      message: videos.length === 0 ? 
        "No high-quality videos found. Try adjusting your search criteria." :
        `Showing all ${videos.length} high-quality scraped videos.`
    });

  } catch (error) {
    console.error('Scraped videos search error:', error);
    res.status(500).json({ error: 'Failed to search scraped videos' });
  }
});

// Get scraped videos stats
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        tool,
        difficulty,
        COUNT(*) as video_count,
        AVG(quality_score) as avg_quality,
        AVG(usefulness_score) as avg_usefulness,
        AVG(view_count) as avg_views,
        MIN(scraped_at) as first_scraped,
        MAX(scraped_at) as last_scraped
      FROM scraped_videos 
      WHERE quality_score >= 50
      GROUP BY tool, difficulty
      ORDER BY tool, difficulty;
    `;
    
    const result = await query(statsQuery);
    
    res.json({
      success: true,
      stats: result.rows,
      totalVideos: result.rows.reduce((sum, row) => sum + parseInt(row.video_count), 0),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scraped videos stats error:', error);
    res.status(500).json({ error: 'Failed to get scraped videos stats' });
  }
});

// Get all videos (both curated and scraped) - unified view
router.get('/unified', async (req, res) => {
  try {
    const { tool, difficulty, page = 0, limit = 12 } = req.query;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool parameter is required' });
    }

    console.log(`🔍 Getting unified videos: tool=${tool}, difficulty=${difficulty}`);

    let whereConditions = ['tool = $1'];
    let queryParams = [tool];
    let paramIndex = 2;

    // Add difficulty filter if specified
    if (difficulty && difficulty !== 'all') {
      whereConditions.push(`difficulty = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get videos from both tables using the all_videos view
    const videosQuery = `
      SELECT 
        id,
        video_url,
        title,
        description,
        thumbnail,
        channelTitle,
        duration_seconds,
        viewCount,
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
        cached_at,
        source
      FROM all_videos 
      WHERE ${whereClause}
      ORDER BY quality_score DESC, usefulness_score DESC, viewCount DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const startIndex = parseInt(page) * parseInt(limit);
    queryParams.push(parseInt(limit), startIndex);

    const result = await query(videosQuery, queryParams);
    const videos = result.rows;

    // Transform videos to match frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video.id,
      videoId: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      duration: video.duration_seconds,
      duration_seconds: video.duration_seconds,
      views: video.viewCount,
      viewCount: video.viewCount,
      difficulty: video.difficulty,
      tool: video.tool,
      url: video.video_url,
      video_url: video.video_url,
      quality_score: video.quality_score,
      usefulness_score: video.usefulness_score,
      keywords: video.keywords,
      tags: video.tags,
      has_tutorial_content: video.has_tutorial_content,
      has_code_examples: video.has_code_examples,
      is_series: video.is_series,
      published_at: video.published_at,
      cached_at: video.cached_at,
      source: video.source,
      rating: Math.round(video.quality_score / 10) / 2
    }));

    const hasMore = videos.length === parseInt(limit);

    console.log(`✅ Found ${videos.length} unified videos for ${tool} - ${difficulty}`);

    res.json({
      videos: transformedVideos,
      fromCache: true,
      cachedAt: videos[0]?.cached_at || new Date().toISOString(),
      totalVideos: videos.length,
      hasMore,
      nextPage: hasMore ? parseInt(page) + 1 : null,
      message: `Showing ${videos.length} high-quality videos (curated + scraped).`
    });

  } catch (error) {
    console.error('Unified videos search error:', error);
    res.status(500).json({ error: 'Failed to get unified videos' });
  }
});

// Enhanced scraper endpoint
router.post('/scrape-enhanced', async (req, res) => {
  try {
    console.log('🚀 Starting enhanced intelligent scraping...');
    
    const { tools = ['zapier', 'n8n', 'make'], difficulties = ['beginner', 'intermediate', 'advanced'], maxVideosPerTool = 30 } = req.body;
    
    // Import the enhanced scraper
    const { EnhancedIntelligentScraper } = require('../scripts/enhanced-intelligent-scraper');
    const scraper = new EnhancedIntelligentScraper();
    
    let totalVideos = 0;
    let totalSaved = 0;
    const results = [];

    for (const tool of tools) {
      for (const difficulty of difficulties) {
        console.log(`📊 Processing ${tool} - ${difficulty}...`);
        
        try {
          const videos = await scraper.scrapeVideosForTool(tool, difficulty, maxVideosPerTool);
          totalVideos += videos.length;
          
          for (const video of videos) {
            try {
              await scraper.saveVideoToDatabase(video);
              totalSaved++;
              console.log(`  ✅ Saved: ${video.title.substring(0, 60)}... (Score: ${video.quality_score})`);
              results.push({
                video_id: video.video_id,
                title: video.title,
                quality_score: video.quality_score,
                tool: video.tool,
                difficulty: video.difficulty
              });
            } catch (error) {
              console.error(`  ❌ Failed to save: ${video.title.substring(0, 60)}...`);
            }
          }
          
          // Delay between tools
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error scraping ${tool} ${difficulty}:`, error.message);
        }
      }
    }

    console.log(`🎉 Enhanced scraping completed!`);
    console.log(`📈 Total videos found: ${totalVideos}`);
    console.log(`💾 Total videos saved: ${totalSaved}`);

    res.json({
      success: true,
      message: 'Enhanced scraping completed successfully',
      stats: {
        total_videos_found: totalVideos,
        total_videos_saved: totalSaved,
        average_quality_score: totalSaved > 0 ? 'High (60+)' : 'N/A'
      },
      results: results.slice(0, 10), // Return first 10 results
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Enhanced scraping failed:', error);
    res.status(500).json({
      success: false,
      error: 'Enhanced scraping failed',
      message: error.message
    });
  }
});

// Simple intelligent scraper endpoint for job execution
router.post('/scrape-intelligent', async (req, res) => {
  try {
    console.log('🚀 Starting intelligent scraping via job...');
    
    const { tool = 'all', max_videos_per_term = 50, min_quality_score = 60 } = req.body;
    
    // Import the intelligent scraper
    const { IntelligentYouTubeScraper } = require('../scripts/intelligent-scraper');
    const scraper = new IntelligentYouTubeScraper();
    
    let totalVideos = 0;
    let totalSaved = 0;
    const results = [];

    const toolsToScrape = tool === 'all' ? ['zapier', 'n8n'] : [tool];

    for (const toolName of toolsToScrape) {
      console.log(`📊 Processing ${toolName}...`);
      
      try {
        const videos = await scraper.scrapeVideosForTool(toolName, max_videos_per_term, min_quality_score);
        totalVideos += videos.length;
        
        for (const video of videos) {
          try {
            await scraper.saveVideoToDatabase(video);
            totalSaved++;
            console.log(`  ✅ Saved: ${video.title.substring(0, 60)}... (Score: ${video.quality_score})`);
            results.push({
              video_id: video.video_id,
              title: video.title,
              quality_score: video.quality_score,
              tool: video.tool,
              difficulty: video.difficulty
            });
          } catch (error) {
            console.error(`  ❌ Failed to save: ${video.title.substring(0, 60)}...`);
          }
        }
        
        // Delay between tools
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error scraping ${toolName}:`, error.message);
      }
    }

    console.log(`🎉 Intelligent scraping completed!`);
    console.log(`📈 Total videos found: ${totalVideos}`);
    console.log(`💾 Total videos saved: ${totalSaved}`);

    res.json({
      success: true,
      message: 'Intelligent scraping completed successfully',
      stats: {
        total_videos_found: totalVideos,
        total_videos_saved: totalSaved,
        tools_scraped: toolsToScrape
      },
      results: results.slice(0, 10), // Return first 10 results
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Intelligent scraping failed:', error);
    res.status(500).json({
      success: false,
      error: 'Intelligent scraping failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
