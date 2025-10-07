const { query } = require('../config/database');

// Get cached videos from database
const getCachedVideos = async (tool, difficulty) => {
  try {
    const result = await query(
      `SELECT * FROM video_cache 
       WHERE tool = $1 AND difficulty = $2
       ORDER BY cached_at DESC`,
      [tool, difficulty]
    );
    
    // Map database fields to frontend expected format
    return result.rows.map(row => ({
      id: row.video_id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail_url,
      channelTitle: row.channel_title,
      publishedAt: row.cached_at,
      url: row.video_url,
      duration: row.duration_seconds || 0,
      viewCount: row.view_count || 0,
      difficulty: row.difficulty,
      tool: row.tool
    }));
  } catch (error) {
    console.error('Error getting cached videos:', error);
    return [];
  }
};

// Search cached videos by title/description
const searchCachedVideos = async (tool, searchQuery) => {
  try {
    const result = await query(
      `SELECT * FROM video_cache 
       WHERE tool = $1 AND (
         title ILIKE $2 OR 
         description ILIKE $2 OR
         to_tsvector('english', title) @@ plainto_tsquery('english', $3)
       )
       ORDER BY cached_at DESC`,
      [tool, `%${searchQuery}%`, searchQuery]
    );
    
    // Map database fields to frontend expected format
    return result.rows.map(row => ({
      id: row.video_id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail_url,
      channelTitle: row.channel_title,
      publishedAt: row.cached_at,
      url: row.video_url,
      duration: row.duration_seconds || 0,
      viewCount: row.view_count || 0,
      difficulty: row.difficulty,
      tool: row.tool
    }));
  } catch (error) {
    console.error('Error searching cached videos:', error);
    return [];
  }
};

// Cache videos to database
const cacheVideos = async (videos, tool, difficulty, searchQuery = '') => {
  try {
    for (const video of videos) {
      await query(
        `INSERT INTO video_cache 
         (video_id, video_url, title, description, thumbnail_url, 
          channel_title, duration_seconds, view_count, difficulty, tool, search_query)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (video_id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         thumbnail_url = EXCLUDED.thumbnail_url,
         cached_at = CURRENT_TIMESTAMP`,
        [
          video.id,           // video_id
          video.url,          // video_url
          video.title,        // title
          video.description,  // description
          video.thumbnail,    // thumbnail_url
          video.channelTitle, // channel_title
          video.duration,     // duration_seconds
          video.viewCount,    // view_count
          difficulty,         // difficulty
          tool,              // tool
          searchQuery        // search_query
        ]
      );
    }
    console.log(`✅ Cached ${videos.length} videos for ${tool} - ${difficulty}`);
  } catch (error) {
    console.error('Error caching videos:', error);
  }
};

// Clear expired cache (older than 7 days)
const clearExpiredCache = async () => {
  try {
    const result = await query(
      `DELETE FROM video_cache WHERE cached_at < NOW() - INTERVAL '7 days'`
    );
    console.log(`🗑️  Cleared ${result.rowCount} expired cache entries`);
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

// Get cache stats
const getCacheStats = async () => {
  try {
    const result = await query(`
      SELECT 
        tool,
        difficulty,
        COUNT(*) as video_count,
        MAX(cached_at) as last_updated
      FROM video_cache 
      GROUP BY tool, difficulty
      ORDER BY tool, difficulty
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return [];
  }
};

module.exports = {
  getCachedVideos,
  searchCachedVideos,
  cacheVideos,
  clearExpiredCache,
  getCacheStats
};
