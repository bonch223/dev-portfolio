#!/usr/bin/env node

/**
 * Script to call the enhance videos API endpoint
 */

const fetch = require('node-fetch');

async function enhanceVideos() {
  try {
    console.log('🚀 Calling enhance videos API...');
    
    const response = await fetch('https://backend-production-cd9f.up.railway.app/api/enhance/enhance-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
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
