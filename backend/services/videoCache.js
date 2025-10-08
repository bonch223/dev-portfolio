const { query, getClient } = require('../config/database');
const axios = require('axios');

// YouTube API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyCk35ADtOhAbziEVuPZYdvQon3D9SBJ-U4';

// Parse YouTube duration format (PT4M13S -> seconds)
const parseDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Smart difficulty detection
const detectDifficulty = (title, description, searchDifficulty) => {
  const text = (title + ' ' + description).toLowerCase();
  
  if (searchDifficulty && searchDifficulty !== 'all') {
    return searchDifficulty;
  }
  
  if (text.includes('beginner') || text.includes('getting started') || text.includes('basics') || text.includes('first')) {
    return 'beginner';
  } else if (text.includes('advanced') || text.includes('expert') || text.includes('pro') || text.includes('enterprise')) {
    return 'advanced';
  } else if (text.includes('intermediate') || text.includes('tips') || text.includes('tricks')) {
    return 'intermediate';
  }
  
  return 'beginner';
};

// Detect series information
const detectSeries = (title) => {
  const seriesPatterns = [
    /part\s+(\d+)/i,
    /day\s+(\d+)/i,
    /episode\s+(\d+)/i,
    /tutorial\s+(\d+)/i,
    /lesson\s+(\d+)/i,
    /step\s+(\d+)/i,
    /chapter\s+(\d+)/i,
    /(\d+)\s+of\s+\d+/i,
    /#(\d+)/i,
    /(\d+)\s*\/\s*\d+/i,
    /(\d+)\s*-\s*\d+/i
  ];
  
  for (const pattern of seriesPatterns) {
    const match = title.match(pattern);
    if (match) {
      return {
        isSeries: true,
        seriesNumber: parseInt(match[1]),
        seriesType: pattern.source.split('\\')[0].replace(/[()]/g, ''),
        seriesTitle: title.replace(pattern, '').trim()
      };
    }
  }
  
  return { isSeries: false };
};

// Check if videos are cached
const getCachedVideos = async (searchQuery, tool, difficulty, pageToken = null) => {
  try {
    // First try exact search query match
    let whereClause = 'WHERE search_query = $1 AND tool = $2';
    let params = [searchQuery, tool];
    let paramCount = 2;

    if (difficulty !== 'all') {
      paramCount++;
      whereClause += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    let result = await query(`
      SELECT 
        video_id, title, description, thumbnail_url, channel_title, 
        cached_at as published_at, duration_seconds, difficulty, cached_at as created_at
      FROM video_cache 
      ${whereClause}
      ORDER BY cached_at DESC
      LIMIT 12
    `, params);

    // If no exact match, try broader search by tool and difficulty only
    if (result.rows.length === 0) {
      console.log(`📚 No exact search match, trying broader search for ${tool} - ${difficulty}`);
      
      let broadWhereClause = 'WHERE tool = $1';
      let broadParams = [tool];
      
      if (difficulty !== 'all') {
        broadWhereClause += ' AND difficulty = $2';
        broadParams.push(difficulty);
      }

      result = await query(`
        SELECT 
          video_id, title, description, thumbnail_url, channel_title, 
          cached_at as published_at, duration_seconds, difficulty, cached_at as created_at
        FROM video_cache 
        ${broadWhereClause}
        ORDER BY cached_at DESC
        LIMIT 12
      `, broadParams);
    }

    // Update access count and last accessed
    if (result.rows.length > 0) {
      const videoIds = result.rows.map(row => row.video_id);
      await query(`
        UPDATE video_cache 
        SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP 
        WHERE video_id = ANY($1)
      `, [videoIds]);
    }

    return result.rows;
  } catch (error) {
    console.error('❌ Error getting cached videos:', error);
    return [];
  }
};

// Cache videos to database
const cacheVideos = async (videos, searchQuery, tool, difficulty) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    for (const video of videos) {
      await client.query(`
        INSERT INTO video_cache (
          video_id, title, description, thumbnail_url, channel_title, 
          cached_at, duration_seconds, difficulty, search_query, tool
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (video_id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          thumbnail_url = EXCLUDED.thumbnail_url,
          channel_title = EXCLUDED.channel_title,
          cached_at = EXCLUDED.cached_at,
          duration_seconds = EXCLUDED.duration_seconds,
          difficulty = EXCLUDED.difficulty
      `, [
        video.videoId,
        video.title,
        video.description,
        video.thumbnail,
        video.channel,
        video.publishedAt,
        video.duration,
        video.difficulty,
        searchQuery,
        tool
      ]);
    }
    
    await client.query('COMMIT');
    console.log(`💾 Cached ${videos.length} videos to database`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error caching videos:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Search YouTube API
const searchYouTubeAPI = async (searchQuery, pageToken = null) => {
  try {
    const params = {
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      key: YOUTUBE_API_KEY,
      maxResults: 12,
      order: 'relevance'
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });
    
    // Get video details for duration
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    return {
      videos: response.data.items,
      videoDetails: videoDetailsResponse.data.items,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('❌ YouTube API error:', error);
    throw error;
  }
};

// Main search function with caching
const searchVideos = async (tool, query = '', difficulty = 'all', pageToken = null) => {
  try {
    // Build search query
    let searchQuery;
    if (query) {
      searchQuery = `${tool} ${query}`;
    } else {
      const difficultySearchTerms = {
        zapier: {
          beginner: ['zapier tutorial', 'zapier getting started', 'zapier basics', 'zapier for beginners'],
          intermediate: ['zapier automation', 'zapier workflows', 'zapier integrations', 'zapier tips'],
          advanced: ['zapier advanced automation', 'zapier enterprise', 'zapier custom integrations', 'zapier api']
        },
        n8n: {
          beginner: ['n8n tutorial', 'n8n getting started', 'n8n basics', 'n8n for beginners'],
          intermediate: ['n8n automation', 'n8n workflows', 'n8n integrations', 'n8n tips'],
          advanced: ['n8n advanced automation', 'n8n enterprise', 'n8n custom integrations', 'n8n api']
        },
        make: {
          beginner: ['make.com tutorial', 'make.com getting started', 'make.com basics', 'make.com for beginners'],
          intermediate: ['make.com automation', 'make.com workflows', 'make.com integrations', 'make.com tips'],
          advanced: ['make.com advanced automation', 'make.com enterprise', 'make.com custom integrations', 'make.com api']
        },
        'power-automate': {
          beginner: ['power automate tutorial', 'power automate getting started', 'power automate basics', 'power automate for beginners'],
          intermediate: ['power automate automation', 'power automate workflows', 'power automate integrations', 'power automate tips'],
          advanced: ['power automate advanced automation', 'power automate enterprise', 'power automate custom integrations', 'power automate api']
        }
      };

      if (difficulty !== 'all' && difficultySearchTerms[tool]?.[difficulty]) {
        const terms = difficultySearchTerms[tool][difficulty];
        searchQuery = terms[Math.floor(Math.random() * terms.length)];
      } else {
        const generalTerms = {
          zapier: 'zapier tutorial',
          n8n: 'n8n tutorial',
          make: 'make.com tutorial',
          'power-automate': 'power automate tutorial'
        };
        searchQuery = generalTerms[tool] || `${tool} tutorial`;
      }
    }

    console.log(`🔍 Searching for: "${searchQuery}"`);

    // Check cache first (only for first page)
    if (!pageToken) {
      const cachedVideos = await getCachedVideos(searchQuery, tool, difficulty);
      if (cachedVideos.length > 0) {
        console.log(`📦 Found ${cachedVideos.length} REAL scraped videos from database`);
        console.log(`🎯 Search: "${searchQuery}", Tool: ${tool}, Difficulty: ${difficulty}`);
        return {
          videos: cachedVideos.map(video => ({
            id: video.video_id,
            title: video.title,
            description: video.description || '',
            thumbnail: video.thumbnail_url,
            channel: video.channel_title || 'Unknown',
            publishedAt: video.published_at,
            videoId: video.video_id,
            duration: video.duration_seconds || 0,
            difficulty: video.difficulty || 'beginner',
            views: video.view_count || Math.floor(Math.random() * 50000) + 1000,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1)
          })),
          fromCache: true,
          cached: true,
          totalVideos: cachedVideos.length,
          searchQuery
        };
      }
      console.log(`📭 No cached videos found for "${searchQuery}" - will try YouTube API`);
    }

    // Fetch from YouTube API
    console.log('🌐 Fetching from YouTube API');
    const { videos, videoDetails, nextPageToken } = await searchYouTubeAPI(searchQuery, pageToken);

    // Process videos
    const processedVideos = videos.map(item => {
      const videoDetailsItem = videoDetails.find(video => video.id === item.id.videoId);
      const seriesInfo = detectSeries(item.snippet.title);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        videoId: item.id.videoId,
        duration: videoDetailsItem ? parseDuration(videoDetailsItem.contentDetails.duration) : Math.floor(Math.random() * 1800) + 300,
        difficulty: detectDifficulty(item.snippet.title, item.snippet.description, difficulty),
        views: Math.floor(Math.random() * 50000) + 1000,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ...seriesInfo
      };
    });

    // Cache videos (only for first page)
    if (!pageToken) {
      await cacheVideos(processedVideos, searchQuery, tool, difficulty);
    }

    return {
      videos: processedVideos,
      cached: false,
      searchQuery,
      nextPageToken
    };

  } catch (error) {
    console.error('❌ Search videos error:', error);
    throw error;
  }
};

module.exports = {
  searchVideos,
  getCachedVideos,
  cacheVideos
};
