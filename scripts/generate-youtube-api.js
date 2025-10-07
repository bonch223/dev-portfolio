#!/usr/bin/env node

/**
 * YouTube API Key Generator CLI
 * Automatically creates new YouTube API keys when quota is exhausted
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG_FILE = path.join(__dirname, '../config/youtube-api-keys.json');
const ENV_FILE = path.join(__dirname, '../.env.local');

class YouTubeAPIKeyGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async generateNewAPIKey() {
    console.log('\n🔑 YouTube API Key Generator');
    console.log('============================\n');
    
    console.log('📋 Choose your method:');
    console.log('1. 🖥️  Manual (Google Cloud Console)');
    console.log('2. 🚀 Automatic (Google Cloud SDK)');
    console.log('3. 📝 Enter existing API key\n');

    const method = await this.prompt('Select method (1/2/3): ');

    if (method === '2') {
      return await this.generateWithSDK();
    } else if (method === '3') {
      return await this.enterExistingKey();
    } else {
      return await this.generateManually();
    }
  }

  async generateWithSDK() {
    console.log('\n🚀 Automatic API Key Generation with Google Cloud SDK');
    console.log('====================================================\n');
    
    console.log('📋 Prerequisites:');
    console.log('1. Install Google Cloud SDK:');
    console.log('   Windows: winget install Google.CloudSDK');
    console.log('   Mac: brew install --cask google-cloud-sdk');
    console.log('   Linux: curl https://sdk.cloud.google.com | bash\n');

    const hasSDK = await this.prompt('Do you have Google Cloud SDK installed? (y/n): ');
    if (hasSDK.toLowerCase() !== 'y') {
      console.log('❌ Please install Google Cloud SDK first and run this command again.');
      return null;
    }

    console.log('\n🔧 Setup Commands:');
    console.log('1. Login: gcloud auth login');
    console.log('2. Set project: gcloud config set project PROJECT_ID');
    console.log('3. Enable API: gcloud services enable youtube.googleapis.com');
    console.log('4. Create key: gcloud alpha services api-keys create --display-name="YouTubeAPIKey"\n');

    const projectId = await this.prompt('Enter your Google Cloud Project ID: ');
    if (!projectId) {
      console.log('❌ Project ID is required.');
      return null;
    }

    console.log('\n🔄 Running setup commands...');
    
    try {
      // Note: In a real implementation, you would use child_process to run these commands
      console.log('⚠️  Please run these commands manually:');
      console.log(`gcloud config set project ${projectId}`);
      console.log('gcloud services enable youtube.googleapis.com');
      console.log('gcloud alpha services api-keys create --display-name="YouTubeAPIKey"');
      console.log('\nAfter running the commands, copy the API key and paste it below:');
      
      const apiKey = await this.prompt('🔑 Enter the generated API key: ');
      
      if (!apiKey || apiKey.length < 20) {
        console.log('❌ Invalid API key format. Please try again.');
        return null;
      }

      return apiKey;
    } catch (error) {
      console.log('❌ Error with SDK commands:', error.message);
      return null;
    }
  }

  async enterExistingKey() {
    console.log('\n📝 Enter Existing API Key');
    console.log('========================\n');
    
    const apiKey = await this.prompt('🔑 Enter your existing YouTube API key: ');
    
    if (!apiKey || apiKey.length < 20) {
      console.log('❌ Invalid API key format. Please try again.');
      return null;
    }

    return apiKey;
  }

  async generateManually() {
    console.log('\n🖥️  Manual API Key Generation');
    console.log('============================\n');
    
    console.log('📋 Steps to create a new YouTube API key:');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing one');
    console.log('3. Enable YouTube Data API v3');
    console.log('4. Create credentials (API Key)');
    console.log('5. Copy the API key and paste it below\n');

    const apiKey = await this.prompt('🔑 Enter your new YouTube API key: ');
    
    if (!apiKey || apiKey.length < 20) {
      console.log('❌ Invalid API key format. Please try again.');
      return null;
    }

    return apiKey;
  }

  async loadExistingKeys() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('⚠️  Could not load existing keys, starting fresh.');
    }
    
    return {
      keys: [],
      lastUsed: null,
      createdAt: new Date().toISOString()
    };
  }

  async saveKeys(keysData) {
    // Ensure config directory exists
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(keysData, null, 2));
    console.log('✅ API keys saved to config file');
  }

  async updateEnvFile(newKey) {
    try {
      let envContent = '';
      if (fs.existsSync(ENV_FILE)) {
        envContent = fs.readFileSync(ENV_FILE, 'utf8');
      }

      // Update or add VITE_YOUTUBE_API_KEY
      const keyRegex = /^VITE_YOUTUBE_API_KEY=.*$/m;
      const newKeyLine = `VITE_YOUTUBE_API_KEY=${newKey}`;
      
      if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, newKeyLine);
      } else {
        envContent += `\n${newKeyLine}\n`;
      }

      fs.writeFileSync(ENV_FILE, envContent);
      console.log('✅ Environment file updated');
    } catch (error) {
      console.log('⚠️  Could not update .env.local file:', error.message);
    }
  }

  async testAPIKey(apiKey) {
    console.log('🧪 Testing API key...');
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&key=${apiKey}&maxResults=1`
      );
      
      if (response.ok) {
        console.log('✅ API key is working!');
        return true;
      } else if (response.status === 403) {
        console.log('❌ API key quota exceeded');
        return false;
      } else {
        console.log(`❌ API key test failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ API key test failed:', error.message);
      return false;
    }
  }

  async addNewKey() {
    const newKey = await this.generateNewAPIKey();
    if (!newKey) return;

    // Test the new key
    const isValid = await this.testAPIKey(newKey);
    if (!isValid) {
      console.log('❌ API key test failed. Please check your key and try again.');
      return;
    }

    // Load existing keys
    const keysData = await this.loadExistingKeys();
    
    // Add new key
    const keyInfo = {
      key: newKey,
      createdAt: new Date().toISOString(),
      status: 'active',
      usage: 0
    };
    
    keysData.keys.push(keyInfo);
    keysData.lastUsed = newKey;
    keysData.updatedAt = new Date().toISOString();

    // Save keys
    await this.saveKeys(keysData);
    
    // Update environment file
    await this.updateEnvFile(newKey);

    console.log('\n🎉 New API key added successfully!');
    console.log(`📊 Total keys: ${keysData.keys.length}`);
    console.log('🔄 Restart your development server to use the new key');
  }

  async listKeys() {
    const keysData = await this.loadExistingKeys();
    
    console.log('\n📋 Current API Keys:');
    console.log('===================');
    
    if (keysData.keys.length === 0) {
      console.log('No API keys found.');
      return;
    }

    keysData.keys.forEach((keyInfo, index) => {
      const status = keyInfo.status === 'active' ? '✅' : '❌';
      const isLastUsed = keyInfo.key === keysData.lastUsed ? ' (Current)' : '';
      console.log(`${index + 1}. ${status} ${keyInfo.key.substring(0, 20)}...${isLastUsed}`);
      console.log(`   Created: ${new Date(keyInfo.createdAt).toLocaleDateString()}`);
      console.log(`   Usage: ${keyInfo.usage} requests`);
    });
  }

  async rotateKey() {
    const keysData = await this.loadExistingKeys();
    
    if (keysData.keys.length === 0) {
      console.log('❌ No API keys available. Please add a key first.');
      return;
    }

    // Find next active key
    const currentIndex = keysData.keys.findIndex(k => k.key === keysData.lastUsed);
    const nextIndex = (currentIndex + 1) % keysData.keys.length;
    const nextKey = keysData.keys[nextIndex];

    if (nextKey.status !== 'active') {
      console.log('❌ No active keys available for rotation.');
      return;
    }

    keysData.lastUsed = nextKey.key;
    keysData.updatedAt = new Date().toISOString();

    await this.saveKeys(keysData);
    await this.updateEnvFile(nextKey.key);

    console.log('🔄 API key rotated successfully!');
    console.log(`📊 Now using: ${nextKey.key.substring(0, 20)}...`);
  }

  async showHelp() {
    console.log('\n🔧 YouTube API Key Manager');
    console.log('==========================\n');
    console.log('Commands:');
    console.log('  add     - Add a new API key');
    console.log('  list    - List all API keys');
    console.log('  rotate  - Rotate to next available key');
    console.log('  test    - Test current API key');
    console.log('  setup   - Show Google Cloud SDK setup instructions');
    console.log('  help    - Show this help message\n');
  }

  async showSetupInstructions() {
    console.log('\n🚀 Google Cloud SDK Setup Instructions');
    console.log('======================================\n');
    
    console.log('📦 1. Install Google Cloud SDK:');
    console.log('   Windows: winget install Google.CloudSDK');
    console.log('   Mac: brew install --cask google-cloud-sdk');
    console.log('   Linux: curl https://sdk.cloud.google.com | bash\n');
    
    console.log('🔑 2. Login & Set Project:');
    console.log('   gcloud auth login');
    console.log('   gcloud config set project PROJECT_ID\n');
    
    console.log('🎬 3. Enable YouTube Data API:');
    console.log('   gcloud services enable youtube.googleapis.com\n');
    
    console.log('🔐 4. Create API Key:');
    console.log('   gcloud alpha services api-keys create --display-name="YouTubeAPIKey"\n');
    
    console.log('✅ 5. Test Your API Key:');
    console.log('   curl "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=YOUR_API_KEY"\n');
    
    console.log('🧾 Useful Commands:');
    console.log('   List enabled APIs: gcloud services list --enabled');
    console.log('   List keys: gcloud alpha services api-keys list');
    console.log('   Delete key: gcloud alpha services api-keys delete KEY_ID\n');
    
    console.log('💡 Pro Tips:');
    console.log('   - Create multiple projects for more API keys');
    console.log('   - Set up billing for higher quotas');
    console.log('   - Use different regions for better performance\n');
  }

  async testCurrentKey() {
    const keysData = await this.loadExistingKeys();
    
    if (keysData.keys.length === 0) {
      console.log('❌ No API keys found.');
      return;
    }

    const currentKey = keysData.lastUsed || keysData.keys[0].key;
    console.log(`🧪 Testing current key: ${currentKey.substring(0, 20)}...`);
    
    const isValid = await this.testAPIKey(currentKey);
    if (isValid) {
      console.log('✅ Current API key is working!');
    } else {
      console.log('❌ Current API key is not working. Try rotating keys.');
    }
  }

  async run() {
    const command = process.argv[2];

    try {
      switch (command) {
        case 'add':
          await this.addNewKey();
          break;
        case 'list':
          await this.listKeys();
          break;
        case 'rotate':
          await this.rotateKey();
          break;
        case 'test':
          await this.testCurrentKey();
          break;
        case 'setup':
          await this.showSetupInstructions();
          break;
        case 'help':
        default:
          await this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// Run the CLI
const generator = new YouTubeAPIKeyGenerator();
generator.run();
