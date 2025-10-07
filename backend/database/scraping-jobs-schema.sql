-- Scraping Jobs Management Schema
-- This schema handles job tracking, scheduling, and progress monitoring

-- Main scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(200) NOT NULL,
  job_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled', 'cron'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'paused', 'completed', 'failed', 'cancelled'
  tool VARCHAR(50), -- 'zapier', 'n8n', 'all'
  search_term TEXT,
  
  -- Progress tracking
  total_search_terms INTEGER DEFAULT 0,
  completed_search_terms INTEGER DEFAULT 0,
  total_videos_found INTEGER DEFAULT 0,
  total_videos_saved INTEGER DEFAULT 0,
  videos_filtered_out INTEGER DEFAULT 0,
  current_search_term TEXT,
  
  -- Timing
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_completion TIMESTAMP,
  total_duration_seconds INTEGER,
  
  -- Error handling
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Configuration
  max_videos_per_term INTEGER DEFAULT 50,
  min_quality_score INTEGER DEFAULT 60,
  
  -- Results summary
  result_summary JSONB,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled'))
);

-- Job schedules table
CREATE TABLE IF NOT EXISTS job_schedules (
  id SERIAL PRIMARY KEY,
  schedule_name VARCHAR(200) NOT NULL,
  cron_expression VARCHAR(100) NOT NULL, -- '0 */6 * * *' for every 6 hours
  tool VARCHAR(50), -- 'zapier', 'n8n', 'all'
  is_active BOOLEAN DEFAULT true,
  
  -- Schedule configuration
  max_videos_per_term INTEGER DEFAULT 50,
  min_quality_score INTEGER DEFAULT 60,
  
  -- Tracking
  last_run_at TIMESTAMP,
  last_run_job_id INTEGER REFERENCES scraping_jobs(id),
  next_run_at TIMESTAMP,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'system'
);

-- Real-time progress tracking (for detailed updates)
CREATE TABLE IF NOT EXISTS scraping_progress (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  
  -- Progress details
  tool VARCHAR(50) NOT NULL,
  search_term TEXT NOT NULL,
  videos_found INTEGER DEFAULT 0,
  videos_processed INTEGER DEFAULT 0,
  videos_saved INTEGER DEFAULT 0,
  videos_skipped INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Video IDs saved
  saved_video_ids TEXT[], -- Array of video IDs saved
  
  CONSTRAINT valid_progress_status CHECK (status IN ('in_progress', 'completed', 'failed'))
);

-- Job logs table
CREATE TABLE IF NOT EXISTS job_logs (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  log_level VARCHAR(20) NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warning', 'error'
  log_message TEXT NOT NULL,
  log_data JSONB, -- Additional structured data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_log_level CHECK (log_level IN ('debug', 'info', 'warning', 'error'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_tool ON scraping_jobs(tool);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status_tool ON scraping_jobs(status, tool);

CREATE INDEX IF NOT EXISTS idx_job_schedules_active ON job_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_job_schedules_next_run ON job_schedules(next_run_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scraping_progress_job_id ON scraping_progress(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_progress_status ON scraping_progress(status);

CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_level ON job_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_job_logs_created_at ON job_logs(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_scraping_jobs_updated_at ON scraping_jobs;
CREATE TRIGGER update_scraping_jobs_updated_at
    BEFORE UPDATE ON scraping_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_schedules_updated_at ON job_schedules;
CREATE TRIGGER update_job_schedules_updated_at
    BEFORE UPDATE ON job_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default schedule (every 6 hours for all tools)
INSERT INTO job_schedules (schedule_name, cron_expression, tool, is_active, next_run_at)
VALUES (
  'Auto-scrape every 6 hours',
  '0 */6 * * *',
  'all',
  true,
  CURRENT_TIMESTAMP + INTERVAL '6 hours'
)
ON CONFLICT DO NOTHING;

