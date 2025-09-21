// Vercel serverless function for visitor counting
// This will be deployed as /api/visitor-counter

// In production, you'd want to use a database like:
// - Vercel KV (Redis)
// - PlanetScale (MySQL)
// - Supabase (PostgreSQL)
// For now, we'll use a simple approach with file storage

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'visitor-data.json');

// Initialize data file if it doesn't exist
const initializeData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      totalVisits: 150, // Start from a realistic number
      dailyVisits: {},
      lastResetDate: new Date().toDateString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

// Save data to file
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  // Enable CORS for all origins (in production, specify your domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    let data = initializeData();
    const today = new Date().toDateString();
    
    // Reset daily count if it's a new day
    if (today !== data.lastResetDate) {
      data.lastResetDate = today;
      data.dailyVisits[today] = 0;
    }
    
    // Initialize today's count if it doesn't exist
    if (!data.dailyVisits[today]) {
      data.dailyVisits[today] = 0;
    }
    
    if (req.method === 'POST') {
      // Increment visitor count
      data.totalVisits++;
      data.dailyVisits[today]++;
      saveData(data);
      
      res.status(200).json({
        success: true,
        totalVisits: data.totalVisits,
        todayVisits: data.dailyVisits[today],
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'GET') {
      // Get current counts
      res.status(200).json({
        totalVisits: data.totalVisits,
        todayVisits: data.dailyVisits[today] || 0,
        lastUpdated: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Visitor counter API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      fallback: true 
    });
  }
}
