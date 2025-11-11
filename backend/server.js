const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - more generous for dashboard
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for dashboard endpoints
    return req.path.startsWith('/api/jobs/');
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://mjre-portfolio.vercel.app',
    'https://your-frontend-domain.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/direct-videos', require('./routes/direct-videos')); // Direct database access
app.use('/api/videos', require('./routes/scraped-videos')); // Scraped videos first (more specific)
app.use('/api/videos', require('./routes/add-videos'));
app.use('/api/videos', require('./routes/simple-videos')); // Curated videos last (fallback)
app.use('/api/schema', require('./routes/schema-update'));
app.use('/api/learning', require('./routes/learning-paths'));
app.use('/api/feedback', require('./routes/user-feedback'));
app.use('/api/enhance', require('./routes/enhance-videos'));
app.use('/api/jobs', require('./routes/scraping-jobs'));
// TODO: Add these routes when implemented
// app.use('/api/users', require('./routes/users'));
// app.use('/api/challenges', require('./routes/challenges'));
// app.use('/api/recommendations', require('./routes/recommendations'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database setup endpoint
app.post('/api/setup-db', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { query } = require('./config/database');
    
    // Read and execute simple schema
    const schemaPath = path.join(__dirname, 'database', 'simple-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    res.json({ 
      message: 'Database setup completed successfully!',
      tables: ['video_cache']
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    res.status(500).json({ 
      error: 'Database setup failed',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Test database connection on startup
const { testConnection, query } = require('./config/database');

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.log('⚠️  Database connection failed, but server will continue with limited functionality');
  } else {
    // Auto-create table if it doesn't exist
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS video_cache (
          id SERIAL PRIMARY KEY,
          video_id VARCHAR(50) UNIQUE NOT NULL,
          video_url TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          channel_title VARCHAR(255),
          duration_seconds INTEGER,
          view_count BIGINT,
          difficulty VARCHAR(20) NOT NULL,
          tool VARCHAR(50) NOT NULL,
          search_query TEXT,
          cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_video_cache_tool_difficulty ON video_cache(tool, difficulty);
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_video_cache_title ON video_cache USING gin(to_tsvector('english', title));
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_video_cache_tool ON video_cache(tool);
      `);
      
      console.log('✅ Database table created/verified successfully');
    } catch (error) {
      console.log('⚠️  Database table creation failed:', error.message);
    }
  }
});

module.exports = app;
