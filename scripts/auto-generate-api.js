#!/usr/bin/env node

/**
 * Automated YouTube API Key Generator
 * Automatically creates new API keys when quota is exhausted
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG_FILE = path.join(__dirname, '../config/youtube-api-keys.json');
const ENV_FILE = path.join(__dirname, '../.env.local');

class AutoAPIKeyGenerator {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || null;
    this.autoMode = process.argv.includes('--auto');
  }

  async checkGoogleCloudSDK() {
    try {
      await execAsync('gcloud --version');
      return true;
    } catch (error) {
      console.log('❌ Google Cloud SDK not found. Installing...');
      return await this.installGoogleCloudSDK();
    }
  }

  async installGoogleCloudSDK() {
    const platform = process.platform;
    let installCommand;

    if (platform === 'win32') {
      installCommand = 'winget install Google.CloudSDK';
    } else if (platform === 'darwin') {
      installCommand = 'brew install --cask google-cloud-sdk';
    } else {
      installCommand = 'curl https://sdk.cloud.google.com | bash';
    }

    try {
      console.log(`📦 Installing Google Cloud SDK: ${installCommand}`);
      await execAsync(installCommand);
      console.log('✅ Google Cloud SDK installed successfully');
      return true;
    } catch (error) {
      console.log('❌ Failed to install Google Cloud SDK:', error.message);
      return false;
    }
  }

  async authenticateGoogleCloud() {
    try {
      console.log('🔑 Authenticating with Google Cloud...');
      await execAsync('gcloud auth login --no-launch-browser');
      console.log('✅ Authentication successful');
      return true;
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async setProject(projectId) {
    try {
      console.log(`🎯 Setting project: ${projectId}`);
      await execAsync(`gcloud config set project ${projectId}`);
      console.log('✅ Project set successfully');
      return true;
    } catch (error) {
      console.log('❌ Failed to set project:', error.message);
      return false;
    }
  }

  async enableYouTubeAPI() {
    try {
      console.log('🎬 Enabling YouTube Data API...');
      await execAsync('gcloud services enable youtube.googleapis.com');
      console.log('✅ YouTube Data API enabled');
      return true;
    } catch (error) {
      console.log('❌ Failed to enable YouTube API:', error.message);
      return false;
    }
  }

  async createAPIKey() {
    try {
      console.log('🔐 Creating new API key...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const keyName = `YouTubeAPIKey-${timestamp}`;
      
      const { stdout } = await execAsync(`gcloud alpha services api-keys create --display-name="${keyName}"`);
      
      // Extract the API key from the output
      const keyMatch = stdout.match(/keyString:\s*([A-Za-z0-9_-]+)/);
      if (keyMatch) {
        const apiKey = keyMatch[1];
        console.log('✅ API key created successfully');
        return apiKey;
      } else {
        console.log('❌ Could not extract API key from output');
        return null;
      }
    } catch (error) {
      console.log('❌ Failed to create API key:', error.message);
      return null;
    }
  }

  async testAPIKey(apiKey) {
    try {
      console.log('🧪 Testing API key...');
      const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`;
      
      const response = await fetch(testUrl);
      if (response.ok) {
        console.log('✅ API key is working!');
        return true;
      } else {
        console.log(`❌ API key test failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ API key test failed:', error.message);
      return false;
    }
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

  async generateNewKeyAutomatically() {
    console.log('\n🤖 Automated YouTube API Key Generation');
    console.log('=====================================\n');

    // Check if Google Cloud SDK is installed
    const hasSDK = await this.checkGoogleCloudSDK();
    if (!hasSDK) {
      console.log('❌ Google Cloud SDK installation failed');
      return null;
    }

    // Authenticate if not already authenticated
    try {
      await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"');
    } catch (error) {
      const authenticated = await this.authenticateGoogleCloud();
      if (!authenticated) {
        console.log('❌ Authentication failed');
        return null;
      }
    }

    // Set project if provided
    if (this.projectId) {
      const projectSet = await this.setProject(this.projectId);
      if (!projectSet) {
        console.log('❌ Failed to set project');
        return null;
      }
    }

    // Enable YouTube API
    const apiEnabled = await this.enableYouTubeAPI();
    if (!apiEnabled) {
      console.log('❌ Failed to enable YouTube API');
      return null;
    }

    // Create API key
    const apiKey = await this.createAPIKey();
    if (!apiKey) {
      console.log('❌ Failed to create API key');
      return null;
    }

    // Test the API key
    const isValid = await this.testAPIKey(apiKey);
    if (!isValid) {
      console.log('❌ API key test failed');
      return null;
    }

    return apiKey;
  }

  async addNewKeyToSystem(apiKey) {
    // Load existing keys
    const keysData = await this.loadExistingKeys();
    
    // Add new key
    const keyInfo = {
      key: apiKey,
      createdAt: new Date().toISOString(),
      status: 'active',
      usage: 0,
      autoGenerated: true
    };
    
    keysData.keys.push(keyInfo);
    keysData.lastUsed = apiKey;
    keysData.updatedAt = new Date().toISOString();

    // Save keys
    await this.saveKeys(keysData);
    
    // Update environment file
    await this.updateEnvFile(apiKey);

    console.log('\n🎉 New API key added automatically!');
    console.log(`📊 Total keys: ${keysData.keys.length}`);
    console.log('🔄 Restart your development server to use the new key');
    
    return apiKey;
  }

  async run() {
    try {
      console.log('🚀 Starting automated API key generation...\n');
      
      // Generate new key
      const newKey = await this.generateNewKeyAutomatically();
      if (!newKey) {
        console.log('❌ Failed to generate new API key');
        process.exit(1);
      }

      // Add to system
      await this.addNewKeyToSystem(newKey);
      
      console.log('\n✅ Automated API key generation completed successfully!');
      console.log(`🔑 New API key: ${newKey.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('❌ Error during automated generation:', error.message);
      process.exit(1);
    }
  }
}

// Run the automated generator
const generator = new AutoAPIKeyGenerator();
generator.run();

