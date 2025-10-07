const express = require('express');
const { searchVideos } = require('../services/videoCache');
const { query } = require('../config/database');

const router = express.Router();

// Video search endpoint with database caching
router.get('/search', async (req, res) => {
  try {
    const { tool, query: searchQuery, difficulty, pageToken } = req.query;
    
    console.log(`🔍 Backend received: tool="${tool}", query="${searchQuery}", difficulty="${difficulty}", pageToken="${pageToken}"`);
    
    const result = await searchVideos(tool, searchQuery, difficulty, pageToken);
    
    res.json(result);

  } catch (error) {
    console.error('❌ Video search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      message: error.message 
    });
  }
});

// Get video analytics
router.get('/analytics', async (req, res) => {
  try {
    const { tool, timeframe = '7' } = req.query;
    
    const result = await query(`
      SELECT 
        COUNT(*) as total_videos,
        COUNT(DISTINCT search_query) as unique_searches,
        AVG(access_count) as avg_access_count,
        MAX(last_accessed) as last_access
      FROM video_cache 
      WHERE tool = $1 
      AND created_at >= NOW() - INTERVAL '${parseInt(timeframe)} days'
    `, [tool]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get popular videos
router.get('/popular', async (req, res) => {
  try {
    const { tool, limit = 10 } = req.query;
    
    const result = await query(`
      SELECT 
        video_id, title, thumbnail_url, channel_name, 
        access_count, difficulty, created_at
      FROM video_cache 
      WHERE tool = $1 
      ORDER BY access_count DESC 
      LIMIT $2
    `, [tool, parseInt(limit)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Popular videos error:', error);
    res.status(500).json({ error: 'Failed to fetch popular videos' });
  }
});

// Clear cache (admin only)
router.delete('/cache', async (req, res) => {
  try {
    const { tool, olderThan } = req.query;
    
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    if (tool) {
      paramCount++;
      whereClause += ` WHERE tool = $${paramCount}`;
      params.push(tool);
    }
    
    if (olderThan) {
      paramCount++;
      whereClause += `${whereClause ? ' AND' : ' WHERE'} created_at < NOW() - INTERVAL '${parseInt(olderThan)} days'`;
    }
    
    const result = await query(`DELETE FROM video_cache${whereClause}`, params);
    
    res.json({ 
      message: `Cleared ${result.rowCount} cached videos`,
      deleted: result.rowCount 
    });
  } catch (error) {
    console.error('❌ Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;