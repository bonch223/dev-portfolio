#!/usr/bin/env node

/**
 * Script to call the enhance videos API endpoint
 */

const axios = require('axios');

async function enhanceVideos() {
  try {
    console.log('🚀 Calling enhance videos API...');
    
    const response = await axios.post('https://backend-production-cd9f.up.railway.app/api/enhance/enhance-videos', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    
    if (result.success) {
      console.log('✅ Video enhancement successful!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Video enhancement failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Enhance videos failed:', error.message);
    process.exit(1);
  }
}

enhanceVideos();
