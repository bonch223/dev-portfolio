const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'workflow_automation',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    await client.query(schema);
    console.log('✅ Database schema executed successfully');
    
    // Insert sample data
    console.log('📊 Inserting sample data...');
    await insertSampleData(client);
    console.log('✅ Sample data inserted successfully');
    
    client.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function insertSampleData(client) {
  // Insert sample challenges
  const challenges = [
    {
      title: 'Email Marketing Automation',
      description: 'Create an automation that sends personalized emails to new subscribers based on their interests and behavior.',
      difficulty: 'intermediate',
      estimated_time: 45,
      tools_required: ['zapier', 'make'],
      tags: ['email', 'marketing', 'automation']
    },
    {
      title: 'Social Media Content Scheduler',
      description: 'Build a system that automatically schedules and posts content across multiple social media platforms.',
      difficulty: 'beginner',
      estimated_time: 30,
      tools_required: ['zapier', 'n8n'],
      tags: ['social-media', 'scheduling', 'content']
    },
    {
      title: 'Customer Support Ticket Router',
      description: 'Create an intelligent system that routes support tickets to the appropriate team based on keywords and priority.',
      difficulty: 'advanced',
      estimated_time: 60,
      tools_required: ['make', 'power-automate'],
      tags: ['support', 'routing', 'ai']
    }
  ];

  for (const challenge of challenges) {
    await client.query(`
      INSERT INTO challenges (title, description, difficulty, estimated_time, tools_required, tags, is_approved)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT DO NOTHING
    `, [
      challenge.title,
      challenge.description,
      challenge.difficulty,
      challenge.estimated_time,
      challenge.tools_required,
      challenge.tags
    ]);
  }

  console.log(`📝 Inserted ${challenges.length} sample challenges`);
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
