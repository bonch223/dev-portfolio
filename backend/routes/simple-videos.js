const express = require('express');
const axios = require('axios');
const { getCachedVideos, searchCachedVideos, cacheVideos, clearExpiredCache, getCacheStats } = require('../services/simpleVideoCache');

// Smart difficulty detection based on title and description
function detectDifficulty(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Advanced keywords
  const advancedKeywords = [
    'advanced', 'expert', 'professional', 'enterprise', 'complex', 'sophisticated',
    'api', 'webhook', 'integration', 'automation', 'workflow', 'custom', 'script',
    'developer', 'programming', 'code', 'technical', 'architecture'
  ];
  
  // Beginner keywords
  const beginnerKeywords = [
    'beginner', 'basic', 'intro', 'introduction', 'getting started', 'first time',
    'tutorial', 'learn', 'how to', 'step by step', 'simple', 'easy', 'quick start'
  ];
  
  // Intermediate keywords
  const intermediateKeywords = [
    'intermediate', 'medium', 'guide', 'tips', 'tricks', 'best practices',
    'optimization', 'improvement', 'enhancement', 'setup', 'configuration'
  ];
  
  const advancedCount = advancedKeywords.filter(keyword => text.includes(keyword)).length;
  const beginnerCount = beginnerKeywords.filter(keyword => text.includes(keyword)).length;
  const intermediateCount = intermediateKeywords.filter(keyword => text.includes(keyword)).length;
  
  if (advancedCount > beginnerCount && advancedCount > intermediateCount) {
    return 'advanced';
  } else if (beginnerCount > intermediateCount) {
    return 'beginner';
  } else {
    return 'intermediate';
  }
}

const router = express.Router();

// Search videos endpoint
router.get('/search', async (req, res) => {
  try {
    const { tool, query, difficulty } = req.query;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool parameter is required' });
    }

    let videos = [];
    let fromCache = false;

    // If there's a search query, search cache first
    if (query && query.trim()) {
      const cachedResults = await searchCachedVideos(tool, query.trim());
      if (cachedResults.length > 0) {
        videos = cachedResults;
        fromCache = true;
        console.log(`🔍 Found ${cachedResults.length} cached videos for search: "${query}"`);
      }
    } else {
      // No search query, get cached videos by tool and difficulty
      const cachedVideos = await getCachedVideos(tool, difficulty);
      
      if (cachedVideos.length > 0) {
        videos = cachedVideos;
        fromCache = true;
        console.log(`📚 Found ${cachedVideos.length} cached videos for ${tool} - ${difficulty}`);
      }
    }

    // Database-only mode: Only use cached videos, no YouTube API calls
    if (videos.length === 0) {
      console.log(`📚 No cached videos found for ${tool} - ${difficulty}`);
      console.log(`💡 Videos are curated and added manually to provide the best learning experience`);
    }
    
    // Handle pagination for cached videos
    const { page = 0, limit = 12 } = req.query;
    const startIndex = parseInt(page) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedVideos = videos.slice(startIndex, endIndex);
    
    res.json({
      videos: paginatedVideos,
      fromCache,
      cachedAt: fromCache ? videos[0]?.cached_at : new Date().toISOString(),
      totalVideos: videos.length,
      hasMore: endIndex < videos.length,
      nextPage: endIndex < videos.length ? parseInt(page) + 1 : null,
      message: videos.length === 0 ? 
        "No videos found. More curated videos will be added regularly to provide the best learning experience." :
        "Showing curated videos for the best learning experience."
    });

  } catch (error) {
    console.error('Video search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

// Note: YouTube API functionality removed - now using database-only curated videos

// Cache stats endpoint
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({ stats });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear cache endpoint
router.delete('/cache', async (req, res) => {
  try {
    const { query } = require('../config/database');
    await query('DELETE FROM video_cache');
    res.json({ message: 'All cached videos cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
