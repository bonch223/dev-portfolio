const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Railway database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importVideos() {
  console.log('🚂 Starting video import to Railway database...');
  
  try {
    // Read the CSV file
    const csvFile = '../youtube-scraper-app/scraped_videos_export.csv';
    if (!fs.existsSync(csvFile)) {
      console.error('❌ CSV file not found:', csvFile);
      return;
    }
    
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📊 Found ${lines.length - 1} videos to import`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    // Process each video
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        // Parse CSV line (simple parsing - might need improvement for complex data)
        const values = parseCSVLine(line);
        if (values.length !== headers.length) {
          console.warn(`⚠️ Skipping line ${i}: incorrect number of columns`);
          skippedCount++;
          continue;
        }
        
        const video = {};
        headers.forEach((header, index) => {
          video[header] = values[index];
        });
        
        // Insert/update video
        await pool.query(`
          INSERT INTO scraped_videos (
            video_id, video_url, title, description, thumbnail_url,
            channel, duration, view_count, difficulty, tool, quality_score,
            published_at, scraped_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (video_id) 
          DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            view_count = EXCLUDED.view_count,
            quality_score = EXCLUDED.quality_score,
            scraped_at = EXCLUDED.scraped_at
        `, [
          video.video_id,
          video.video_url,
          video.title,
          video.description,
          video.thumbnail_url,
          video.channel,
          parseInt(video.duration) || 0,
          parseInt(video.view_count) || 0,
          video.difficulty,
          video.tool,
          parseFloat(video.quality_score) || 0,
          video.published_at,
          video.scraped_at
        ]);
        
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`✅ Imported ${importedCount} videos...`);
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to import video on line ${i}:`, error.message);
        skippedCount++;
        continue;
      }
    }
    
    console.log('=' * 60);
    console.log('🎉 IMPORT COMPLETE!');
    console.log('=' * 60);
    console.log(`✅ Successfully imported: ${importedCount} videos`);
    console.log(`⚠️ Skipped: ${skippedCount} videos`);
    
    // Verify import
    const result = await pool.query('SELECT COUNT(*) as count FROM scraped_videos');
    console.log(`📊 Total videos in database: ${result.rows[0].count}`);
    
    // Show sample with view counts
    const sampleResult = await pool.query(`
      SELECT video_id, title, view_count, tool 
      FROM scraped_videos 
      ORDER BY view_count DESC 
      LIMIT 5
    `);
    
    console.log('📺 Sample videos with highest view counts:');
    sampleResult.rows.forEach(video => {
      console.log(`  - ${video.title.substring(0, 50)}... (${video.view_count.toLocaleString()} views, ${video.tool})`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await pool.end();
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

// Run the import
importVideos().then(() => {
  console.log('🎉 Import completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});

