const express = require('express');
const { query } = require('../config/database');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Apply database schema for job tracking
router.post('/setup-schema', async (req, res) => {
  try {
    console.log('🔧 Setting up scraping jobs database schema...');
    
    const schemaPath = path.join(__dirname, '../database/scraping-jobs-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await query(schema);
    
    console.log('✅ Scraping jobs schema applied successfully');
    
    res.json({
      success: true,
      message: 'Scraping jobs database schema applied successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to apply schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply database schema',
      message: error.message
    });
  }
});

// Get all jobs with optional filtering
router.get('/jobs', async (req, res) => {
  try {
    const { status, tool, limit = 50, offset = 0 } = req.query;
    
    let whereClause = [];
    let params = [];
    let paramCount = 1;
    
    if (status) {
      whereClause.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    if (tool) {
      whereClause.push(`tool = $${paramCount++}`);
      params.push(tool);
    }
    
    const whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    
    const jobsQuery = `
      SELECT 
        id, job_name, job_type, status, tool, search_term,
        total_search_terms, completed_search_terms,
        total_videos_found, total_videos_saved, videos_filtered_out,
        current_search_term, started_at, paused_at, resumed_at, completed_at,
        estimated_completion, total_duration_seconds, error_count, last_error,
        created_at, updated_at, max_videos_per_term, min_quality_score,
        result_summary
      FROM scraping_jobs
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    params.push(limit, offset);
    
    const result = await query(jobsQuery, params);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM scraping_jobs ${whereString}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    
    res.json({
      success: true,
      jobs: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

// Get single job details with progress
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobQuery = `
      SELECT * FROM scraping_jobs WHERE id = $1
    `;
    
    const progressQuery = `
      SELECT * FROM scraping_progress 
      WHERE job_id = $1 
      ORDER BY started_at DESC
    `;
    
    const logsQuery = `
      SELECT * FROM job_logs 
      WHERE job_id = $1 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    
    const [jobResult, progressResult, logsResult] = await Promise.all([
      query(jobQuery, [id]),
      query(progressQuery, [id]),
      query(logsQuery, [id])
    ]);
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job: jobResult.rows[0],
      progress: progressResult.rows,
      logs: logsResult.rows
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch job details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job details',
      message: error.message
    });
  }
});

// Create new scraping job
router.post('/jobs/create', async (req, res) => {
  try {
    const { 
      job_name, 
      tool = 'all', 
      max_videos_per_term = 50,
      min_quality_score = 60,
      job_type = 'manual'
    } = req.body;
    
    const insertQuery = `
      INSERT INTO scraping_jobs (
        job_name, job_type, status, tool, 
        max_videos_per_term, min_quality_score, 
        created_at, updated_at
      ) VALUES (
        $1, $2, 'pending', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    
    const result = await query(insertQuery, [
      job_name || `Scrape ${tool} videos`,
      job_type,
      tool,
      max_videos_per_term,
      min_quality_score
    ]);
    
    res.json({
      success: true,
      job: result.rows[0],
      message: 'Scraping job created successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to create job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      message: error.message
    });
  }
});

// Start/execute a scraping job
router.post('/jobs/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update job status to running
    const updateQuery = `
      UPDATE scraping_jobs 
      SET status = 'running', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('pending', 'paused')
      RETURNING *
    `;
    
    const result = await query(updateQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job cannot be started (might be already running or completed)'
      });
    }
    
    const job = result.rows[0];
    
    // Log the start
    await query(
      `INSERT INTO job_logs (job_id, log_level, log_message) VALUES ($1, 'info', 'Job started')`,
      [id]
    );
    
    // Trigger the actual scraping (asynchronously)
    // We'll import and call the scraper here
    setImmediate(async () => {
      try {
        const { IntelligentYouTubeScraper } = require('../scripts/intelligent-scraper');
        const scraper = new IntelligentYouTubeScraper();
        
        // TODO: Run scraper with job tracking
        console.log(`🚀 Starting scraper for job ${id}...`);
        
      } catch (error) {
        console.error(`❌ Scraper failed for job ${id}:`, error);
        await query(
          `UPDATE scraping_jobs SET status = 'failed', last_error = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [error.message, id]
        );
      }
    });
    
    res.json({
      success: true,
      job: job,
      message: 'Scraping job started'
    });
    
  } catch (error) {
    console.error('❌ Failed to start job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start job',
      message: error.message
    });
  }
});

// Pause a running job
router.post('/jobs/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateQuery = `
      UPDATE scraping_jobs 
      SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'running'
      RETURNING *
    `;
    
    const result = await query(updateQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job cannot be paused (might not be running)'
      });
    }
    
    await query(
      `INSERT INTO job_logs (job_id, log_level, log_message) VALUES ($1, 'info', 'Job paused')`,
      [id]
    );
    
    res.json({
      success: true,
      job: result.rows[0],
      message: 'Job paused successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to pause job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause job',
      message: error.message
    });
  }
});

// Cancel a job
router.post('/jobs/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateQuery = `
      UPDATE scraping_jobs 
      SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('pending', 'running', 'paused')
      RETURNING *
    `;
    
    const result = await query(updateQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job cannot be cancelled'
      });
    }
    
    await query(
      `INSERT INTO job_logs (job_id, log_level, log_message) VALUES ($1, 'warning', 'Job cancelled by user')`,
      [id]
    );
    
    res.json({
      success: true,
      job: result.rows[0],
      message: 'Job cancelled successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to cancel job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel job',
      message: error.message
    });
  }
});

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedulesQuery = `
      SELECT * FROM job_schedules 
      ORDER BY created_at DESC
    `;
    
    const result = await query(schedulesQuery);
    
    res.json({
      success: true,
      schedules: result.rows
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedules',
      message: error.message
    });
  }
});

// Create or update schedule
router.post('/schedules', async (req, res) => {
  try {
    const {
      schedule_name,
      cron_expression,
      tool = 'all',
      is_active = true,
      max_videos_per_term = 50,
      min_quality_score = 60
    } = req.body;
    
    const insertQuery = `
      INSERT INTO job_schedules (
        schedule_name, cron_expression, tool, is_active,
        max_videos_per_term, min_quality_score,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await query(insertQuery, [
      schedule_name,
      cron_expression,
      tool,
      is_active,
      max_videos_per_term,
      min_quality_score
    ]);
    
    res.json({
      success: true,
      schedule: result.rows[0],
      message: 'Schedule created successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to create schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule',
      message: error.message
    });
  }
});

// Toggle schedule active status
router.patch('/schedules/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateQuery = `
      UPDATE job_schedules 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      schedule: result.rows[0],
      message: `Schedule ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Failed to toggle schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle schedule',
      message: error.message
    });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'running') as running_jobs,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_jobs,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
        COUNT(*) FILTER (WHERE status = 'paused') as paused_jobs,
        SUM(total_videos_saved) as total_videos_scraped,
        AVG(total_duration_seconds) FILTER (WHERE status = 'completed') as avg_duration_seconds
      FROM scraping_jobs
    `;
    
    const result = await query(statsQuery);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message
    });
  }
});

module.exports = router;

