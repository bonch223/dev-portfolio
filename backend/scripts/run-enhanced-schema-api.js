#!/usr/bin/env node

/**
 * Run Enhanced Schema Update via API
 * Calls the deployed backend to update the database schema
 */

const https = require('https');

const RAILWAY_BACKEND_URL = 'https://backend-production-cd9f.up.railway.app';

async function callEnhancedSchemaAPI() {
  try {
    console.log('🚀 Calling enhanced schema update API...');
    
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/schema/enhanced-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Enhanced schema update successful!');
      console.log('📊 Response:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Enhanced schema update failed:', errorData);
      return false;
    }

  } catch (error) {
    console.error('❌ Error calling enhanced schema API:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const success = await callEnhancedSchemaAPI();
    
    if (success) {
      console.log('✅ Enhanced schema update completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Enhanced schema update failed');
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

module.exports = { callEnhancedSchemaAPI };
