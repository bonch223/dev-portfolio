#!/usr/bin/env node

/**
 * System Initialization Script
 * Sets up database schema and verifies all components
 */

const axios = require('axios');

const BACKEND_URL = 'https://backend-production-cd9f.up.railway.app';

async function initializeSystem() {
  console.log('🚀 Initializing Scraping System...\n');

  try {
    // Step 1: Setup database schema
    console.log('📊 Step 1: Setting up database schema...');
    const schemaResponse = await axios.post(`${BACKEND_URL}/api/jobs/setup-schema`);
    
    if (schemaResponse.data.success) {
      console.log('✅ Database schema initialized successfully\n');
    } else {
      throw new Error('Failed to initialize database schema');
    }

    // Step 2: Check dashboard stats
    console.log('📈 Step 2: Checking dashboard stats...');
    const statsResponse = await axios.get(`${BACKEND_URL}/api/jobs/dashboard/stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log('✅ Dashboard stats retrieved:');
      console.log(`   - Running jobs: ${stats.running_jobs || 0}`);
      console.log(`   - Completed jobs: ${stats.completed_jobs || 0}`);
      console.log(`   - Total videos scraped: ${stats.total_videos_scraped || 0}\n`);
    }

    // Step 3: Check schedules
    console.log('⏰ Step 3: Checking automated schedules...');
    const schedulesResponse = await axios.get(`${BACKEND_URL}/api/jobs/schedules`);
    
    if (schedulesResponse.data.success) {
      const schedules = schedulesResponse.data.schedules;
      console.log(`✅ Found ${schedules.length} schedule(s):`);
      schedules.forEach(schedule => {
        console.log(`   - ${schedule.schedule_name} (${schedule.cron_expression}) - ${schedule.is_active ? 'Active' : 'Inactive'}`);
      });
      console.log();
    }

    // Step 4: Create a test job
    console.log('🧪 Step 4: Creating test scraping job...');
    const createJobResponse = await axios.post(`${BACKEND_URL}/api/jobs/jobs/create`, {
      job_name: 'Test Job - System Initialization',
      tool: 'zapier',
      max_videos_per_term: 10,
      min_quality_score: 60
    });

    if (createJobResponse.data.success) {
      const job = createJobResponse.data.job;
      console.log(`✅ Test job created successfully (ID: ${job.id})\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 SYSTEM INITIALIZATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Next Steps:');
    console.log('   1. Access dashboard: https://your-domain.com/scraping-dashboard');
    console.log('   2. Create scraping jobs through the UI');
    console.log('   3. Set up Railway cron jobs (see backend/CRON_SETUP.md)');
    console.log('   4. Monitor progress in real-time');
    console.log('\n💡 Quick Actions:');
    console.log('   - Start test job: POST /api/jobs/jobs/1/start');
    console.log('   - View all jobs: GET /api/jobs/jobs');
    console.log('   - Check stats: GET /api/jobs/dashboard/stats');
    console.log('\n✨ Happy Scraping! 🚀\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Initialization failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify Railway backend is deployed and running');
    console.log('   2. Check DATABASE_URL environment variable is set');
    console.log('   3. Ensure backend URL is correct');
    console.log('   4. Review Railway logs for errors\n');
    
    process.exit(1);
  }
}

// Run initialization
initializeSystem();

