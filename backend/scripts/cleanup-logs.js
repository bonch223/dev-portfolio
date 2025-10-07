#!/usr/bin/env node

/**
 * Cleanup Script
 * Removes old job logs and completed jobs older than 30 days
 */

const { query, closePool } = require('../config/database');

async function cleanupOldData() {
  try {
    console.log('🧹 Starting cleanup process...');

    // Delete logs older than 30 days
    const logsResult = await query(`
      DELETE FROM job_logs 
      WHERE created_at < NOW() - INTERVAL '30 days'
    `);
    console.log(`✅ Deleted ${logsResult.rowCount} old log entries`);

    // Delete completed/failed jobs older than 30 days
    const jobsResult = await query(`
      DELETE FROM scraping_jobs 
      WHERE status IN ('completed', 'failed', 'cancelled') 
      AND completed_at < NOW() - INTERVAL '30 days'
    `);
    console.log(`✅ Deleted ${jobsResult.rowCount} old jobs`);

    console.log('✨ Cleanup completed successfully');
    await closePool();
    process.exit(0);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await closePool();
    process.exit(1);
  }
}

cleanupOldData();

