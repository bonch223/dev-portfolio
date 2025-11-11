const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Direct video search endpoint - bypasses complex logic
router.get('/search', async (req, res) => {
  try {
    const { tool, difficulty } = req.query;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool parameter is required' });
    }

    console.log(`🔍 Direct search: tool=${tool}, difficulty=${difficulty}`);

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

    // Get videos directly from video_cache table
    const videosQuery = `
      SELECT 
        video_id as id,
        title,
        description,
        thumbnail_url as thumbnail,
        channel_title as channelTitle,
        duration_seconds,
        view_count as viewCount,
        difficulty,
        tool,
        cached_at as publishedAt,
        video_url
      FROM video_cache 
      WHERE ${whereClause}
      ORDER BY cached_at DESC
      LIMIT 50
    `;

    const result = await query(videosQuery, queryParams);
    const videos = result.rows;

    // Transform videos to match frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      thumbnail: video.thumbnail || '',
      channelTitle: video.channelTitle || 'Unknown',
      publishedAt: video.publishedAt,
      videoId: video.id,
      duration: video.duration_seconds || 0,
      difficulty: video.difficulty || 'beginner',
      tool: video.tool,
      views: video.viewCount || 0,
      rating: '4.5',
      url: video.video_url || `https://www.youtube.com/watch?v=${video.id}`
    }));

    res.json({
      videos: transformedVideos,
      fromCache: true,
      totalVideos: transformedVideos.length,
      searchQuery: `${tool} ${difficulty || 'all'}`
    });

  } catch (error) {
    console.error('❌ Direct video search error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      message: error.message 
    });
  }
});

module.exports = router;



