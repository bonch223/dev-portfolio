#!/usr/bin/env node

/**
 * Run Enhanced Scraper via API
 * Calls the deployed backend to scrape new high-quality videos
 */

const https = require('https');

const RAILWAY_BACKEND_URL = 'https://backend-production-cd9f.up.railway.app';

async function callEnhancedScraperAPI() {
  try {
    console.log('🚀 Calling enhanced scraper API...');
    
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/videos/scrape-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tools: ['zapier', 'n8n', 'make'],
        difficulties: ['beginner', 'intermediate', 'advanced'],
        maxVideosPerTool: 30
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Enhanced scraper completed successfully!');
      console.log('📊 Response:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Enhanced scraper failed:', errorData);
      return false;
    }

  } catch (error) {
    console.error('❌ Error calling enhanced scraper API:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const success = await callEnhancedScraperAPI();
    
    if (success) {
      console.log('✅ Enhanced scraper completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Enhanced scraper failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { callEnhancedScraperAPI };
