#!/usr/bin/env node

/**
 * Scheduled Scraper Runner
 * This script is designed to be run by Railway cron jobs
 * It automatically creates and executes scraping jobs
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function runScheduledScraping() {
  try {
    console.log('🚀 Starting scheduled scraping...');
    console.log(`📅 Time: ${new Date().toISOString()}`);

    // Create a new scraping job
    const createJobResponse = await axios.post(`${BACKEND_URL}/api/jobs/jobs/create`, {
      job_name: `Scheduled scrape - ${new Date().toISOString()}`,
      job_type: 'scheduled',
      tool: 'all',
      max_videos_per_term: 50,
      min_quality_score: 60
    });

    if (!createJobResponse.data.success) {
      throw new Error('Failed to create scraping job');
    }

    const jobId = createJobResponse.data.job.id;
    console.log(`✅ Created job #${jobId}`);

    // Start the job
    const startJobResponse = await axios.post(`${BACKEND_URL}/api/jobs/jobs/${jobId}/start`);

    if (!startJobResponse.data.success) {
      throw new Error('Failed to start scraping job');
    }

    console.log(`🎬 Job #${jobId} started successfully`);
    console.log('✨ Scheduled scraping initiated');

    // Wait for a bit to let the job start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check job status
    const statusResponse = await axios.get(`${BACKEND_URL}/api/jobs/jobs/${jobId}`);
    const job = statusResponse.data.job;

    console.log(`📊 Job Status: ${job.status}`);
    console.log(`📈 Progress: ${job.completed_search_terms}/${job.total_search_terms} search terms`);
    console.log(`💾 Videos saved: ${job.total_videos_saved}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Scheduled scraping failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the scraper
runScheduledScraping();

