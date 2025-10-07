#!/usr/bin/env node

/**
 * API Key Management Server
 * Provides HTTP endpoints for automatic API key generation
 */

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_KEY_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const CONFIG_FILE = path.join(__dirname, '../config/youtube-api-keys.json');

class APIKeyServer {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || null;
  }

  async checkGoogleCloudSDK() {
    try {
      await execAsync('gcloud --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  async createAPIKey() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const keyName = `YouTubeAPIKey-${timestamp}`;
      
      const { stdout } = await execAsync(`gcloud alpha services api-keys create --display-name="${keyName}"`);
      
      // Extract the API key from the output
      const keyMatch = stdout.match(/keyString:\s*([A-Za-z0-9_-]+)/);
      if (keyMatch) {
        return keyMatch[1];
      }
      return null;
    } catch (error) {
      console.error('Failed to create API key:', error.message);
      return null;
    }
  }

  async testAPIKey(apiKey) {
    try {
      const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`;
      const response = await fetch(testUrl);
      return response.ok;
    } catch (error) {
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
      console.log('Could not load existing keys');
    }
    
    return {
      keys: [],
      lastUsed: null,
      createdAt: new Date().toISOString()
    };
  }

  async saveKeys(keysData) {
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(keysData, null, 2));
  }

  async updateEnvFile(newKey) {
    try {
      const ENV_FILE = path.join(__dirname, '../.env.local');
      let envContent = '';
      if (fs.existsSync(ENV_FILE)) {
        envContent = fs.readFileSync(ENV_FILE, 'utf8');
      }

      const keyRegex = /^VITE_YOUTUBE_API_KEY=.*$/m;
      const newKeyLine = `VITE_YOUTUBE_API_KEY=${newKey}`;
      
      if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, newKeyLine);
      } else {
        envContent += `\n${newKeyLine}\n`;
      }

      fs.writeFileSync(ENV_FILE, envContent);
    } catch (error) {
      console.error('Could not update .env.local file:', error.message);
    }
  }
}

const apiKeyServer = new APIKeyServer();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/keys', async (req, res) => {
  try {
    const keysData = await apiKeyServer.loadExistingKeys();
    res.json({
      success: true,
      keys: keysData.keys.map(k => ({
        id: k.key.substring(0, 20) + '...',
        status: k.status,
        createdAt: k.createdAt,
        usage: k.usage,
        isCurrent: k.key === keysData.lastUsed
      })),
      total: keysData.keys.length,
      current: keysData.lastUsed ? keysData.lastUsed.substring(0, 20) + '...' : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/generate', async (req, res) => {
  try {
    console.log('🔄 API key generation requested...');
    
    // Check if Google Cloud SDK is available
    const hasSDK = await apiKeyServer.checkGoogleCloudSDK();
    if (!hasSDK) {
      return res.status(400).json({
        success: false,
        error: 'Google Cloud SDK not found. Please install it first.',
        instructions: {
          windows: 'winget install Google.CloudSDK',
          mac: 'brew install --cask google-cloud-sdk',
          linux: 'curl https://sdk.cloud.google.com | bash'
        }
      });
    }

    // Create new API key
    const newKey = await apiKeyServer.createAPIKey();
    if (!newKey) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create API key'
      });
    }

    // Test the API key
    const isValid = await apiKeyServer.testAPIKey(newKey);
    if (!isValid) {
      return res.status(500).json({
        success: false,
        error: 'API key test failed'
      });
    }

    // Load existing keys
    const keysData = await apiKeyServer.loadExistingKeys();
    
    // Add new key
    const keyInfo = {
      key: newKey,
      createdAt: new Date().toISOString(),
      status: 'active',
      usage: 0,
      autoGenerated: true
    };
    
    keysData.keys.push(keyInfo);
    keysData.lastUsed = newKey;
    keysData.updatedAt = new Date().toISOString();

    // Save keys
    await apiKeyServer.saveKeys(keysData);
    
    // Update environment file
    await apiKeyServer.updateEnvFile(newKey);

    console.log('✅ New API key generated and saved');

    res.json({
      success: true,
      message: 'New API key generated successfully',
      key: newKey.substring(0, 20) + '...',
      totalKeys: keysData.keys.length
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/rotate', async (req, res) => {
  try {
    const keysData = await apiKeyServer.loadExistingKeys();
    
    if (keysData.keys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No API keys available'
      });
    }

    // Find next active key
    const currentIndex = keysData.keys.findIndex(k => k.key === keysData.lastUsed);
    const nextIndex = (currentIndex + 1) % keysData.keys.length;
    const nextKey = keysData.keys[nextIndex];

    if (nextKey.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'No active keys available for rotation'
      });
    }

    keysData.lastUsed = nextKey.key;
    keysData.updatedAt = new Date().toISOString();

    await apiKeyServer.saveKeys(keysData);
    await apiKeyServer.updateEnvFile(nextKey.key);

    res.json({
      success: true,
      message: 'API key rotated successfully',
      key: nextKey.key.substring(0, 20) + '...',
      totalKeys: keysData.keys.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Key Management Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Generate key: POST http://localhost:${PORT}/generate`);
  console.log(`🔄 Rotate key: POST http://localhost:${PORT}/rotate`);
});

export default app;

