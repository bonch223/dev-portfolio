#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway Deployment Script');
console.log('============================');

// Check if Railway CLI is installed
try {
  execSync('railway --version', { stdio: 'ignore' });
  console.log('✅ Railway CLI is installed');
} catch (error) {
  console.error('❌ Railway CLI not found. Please install it first:');
  console.error('npm install -g @railway/cli');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('railway whoami', { stdio: 'ignore' });
  console.log('✅ Logged in to Railway');
} catch (error) {
  console.error('❌ Not logged in to Railway. Please run:');
  console.error('railway login');
  process.exit(1);
}

// Check for required environment variables
const requiredEnvVars = ['YOUTUBE_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease set these variables in Railway dashboard or run:');
  missingVars.forEach(varName => {
    console.error(`railway variables set ${varName}=your_value_here`);
  });
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Deploy to Railway
try {
  console.log('\n🚀 Deploying to Railway...');
  execSync('railway up', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
  
  // Get the deployment URL
  try {
    const status = execSync('railway status', { encoding: 'utf8' });
    console.log('\n📊 Deployment Status:');
    console.log(status);
  } catch (error) {
    console.log('ℹ️  Check deployment status with: railway status');
  }
  
  console.log('\n🎉 Your backend is now live on Railway!');
  console.log('📝 Next steps:');
  console.log('1. Set up your database: railway run npm run setup-db');
  console.log('2. Check logs: railway logs');
  console.log('3. View metrics: railway metrics');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
