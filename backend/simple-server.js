const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyCk35ADtOhAbziEVuPZYdvQon3D9SBJ-U4';

// Simple video search endpoint
app.get('/api/videos/search', async (req, res) => {
  try {
    const { tool, query, difficulty, pageToken } = req.query;
    
    console.log(`🔍 Backend received: tool="${tool}", query="${query}", difficulty="${difficulty}", pageToken="${pageToken}"`);
    
    console.log(`🔍 Searching for: ${tool} - ${query} - ${difficulty}`);
    
    // Build search query with difficulty-specific terms
    const difficultySearchTerms = {
      zapier: {
        beginner: ['zapier tutorial beginner', 'zapier getting started', 'zapier basics', 'zapier first automation'],
        intermediate: ['zapier intermediate', 'zapier advanced tips', 'zapier multi-step', 'zapier filters'],
        advanced: ['zapier advanced', 'zapier webhooks', 'zapier custom apps', 'zapier enterprise']
      },
      n8n: {
        beginner: ['n8n tutorial beginner', 'n8n getting started', 'n8n basics', 'n8n first workflow'],
        intermediate: ['n8n intermediate', 'n8n advanced', 'n8n error handling', 'n8n complex logic'],
        advanced: ['n8n advanced', 'n8n custom nodes', 'n8n self hosting', 'n8n enterprise']
      },
      make: {
        beginner: ['make.com tutorial beginner', 'make.com getting started', 'make.com basics', 'make.com first scenario'],
        intermediate: ['make.com intermediate', 'make.com advanced', 'make.com data transformation', 'make.com complex scenarios'],
        advanced: ['make.com advanced', 'make.com custom modules', 'make.com api integration', 'make.com enterprise']
      },
      'power-automate': {
        beginner: ['power automate tutorial beginner', 'power automate getting started', 'power automate basics', 'power automate first flow'],
        intermediate: ['power automate intermediate', 'power automate advanced', 'power automate conditional logic', 'power automate data operations'],
        advanced: ['power automate advanced', 'power automate custom connectors', 'power automate premium features', 'power automate enterprise']
      }
    };
    
    let searchQuery;
    if (query) {
      // User provided custom query - always combine with tool name
      searchQuery = `${tool} ${query}`;
    } else if (difficulty && difficulty !== 'all' && difficultySearchTerms[tool]?.[difficulty]) {
      // Use difficulty-specific search terms
      const terms = difficultySearchTerms[tool][difficulty];
      searchQuery = terms[Math.floor(Math.random() * terms.length)];
    } else {
      // Fallback to general search
      const generalTerms = {
        zapier: 'zapier tutorial',
        n8n: 'n8n tutorial',
        make: 'make.com tutorial',
        'power-automate': 'power automate tutorial'
      };
      searchQuery = generalTerms[tool] || `${tool} tutorial`;
    }

    console.log(`🌐 YouTube API search: "${searchQuery}"`);

    // Call YouTube API
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        key: YOUTUBE_API_KEY,
        maxResults: 12,
        order: 'relevance',
        ...(pageToken && { pageToken })
      }
    });

    // Get video details for duration
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    console.log(`📺 YouTube API returned ${response.data.items.length} videos`);
    console.log(`🔍 First video title: "${response.data.items[0]?.snippet?.title || 'No videos'}"`);

    console.log(`✅ Found ${response.data.items.length} videos`);

    // Parse YouTube duration format (PT4M13S -> seconds)
    const parseDuration = (duration) => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      const seconds = parseInt(match[3] || 0);
      
      return hours * 3600 + minutes * 60 + seconds;
    };

    // Smart difficulty detection based on video title and description
    const detectDifficulty = (title, description, searchDifficulty) => {
      const text = (title + ' ' + description).toLowerCase();
      
      // If we searched for a specific difficulty, use that
      if (searchDifficulty && searchDifficulty !== 'all') {
        return searchDifficulty;
      }
      
      // Detect based on content
      if (text.includes('beginner') || text.includes('getting started') || text.includes('basics') || text.includes('first')) {
        return 'beginner';
      } else if (text.includes('advanced') || text.includes('expert') || text.includes('pro') || text.includes('enterprise')) {
        return 'advanced';
      } else if (text.includes('intermediate') || text.includes('tips') || text.includes('tricks')) {
        return 'intermediate';
      }
      
      return 'beginner'; // Default to beginner
    };

    // Detect and group video series
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
        /(\d+)\s*\/\s*\d+/i,  // 1/5, 2/5 format
        /(\d+)\s*-\s*\d+/i     // 1-5, 2-5 format
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

    // Process videos with playlist information
    const videos = response.data.items.map(item => {
      const seriesInfo = detectSeries(item.snippet.title);
      if (seriesInfo.isSeries) {
        console.log(`🎬 Series detected: "${item.snippet.title}" → ${seriesInfo.seriesType} #${seriesInfo.seriesNumber}`);
      }
      
      // Find corresponding video details
      const videoDetails = videoDetailsResponse.data.items.find(video => video.id === item.id.videoId);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        videoId: item.id.videoId,
        duration: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : Math.floor(Math.random() * 1800) + 300,
        difficulty: detectDifficulty(item.snippet.title, item.snippet.description, difficulty),
        views: Math.floor(Math.random() * 50000) + 1000,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ...seriesInfo
      };
    });

    console.log(`📊 Processing ${videos.length} videos`);

    res.json({
      videos,
      cached: false,
      searchQuery,
      nextPageToken: response.data.nextPageToken || null
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 Video search: http://localhost:${PORT}/api/videos/search?tool=zapier&query=beginner`);
});
