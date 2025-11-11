"""Import videos to Railway database using Railway CLI."""

import subprocess
import csv
import os
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_railway_cli():
    """Check if Railway CLI is installed and user is logged in."""
    try:
        # Check if railway CLI is installed
        result = subprocess.run(['railway', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            logger.error("❌ Railway CLI not found. Install with: npm install -g @railway/cli")
            return False
        
        logger.info(f"✅ Railway CLI found: {result.stdout.strip()}")
        
        # Check if user is logged in
        result = subprocess.run(['railway', 'whoami'], capture_output=True, text=True)
        if result.returncode != 0:
            logger.error("❌ Not logged in to Railway. Run: railway login")
            return False
        
        logger.info(f"✅ Logged in as: {result.stdout.strip()}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error checking Railway CLI: {e}")
        return False

def create_import_sql():
    """Create SQL file to import videos."""
    logger.info("📝 Creating import SQL file...")
    
    csv_filename = "scraped_videos_export.csv"
    if not os.path.exists(csv_filename):
        logger.error(f"❌ CSV file {csv_filename} not found!")
        return None
    
    sql_filename = "import_videos.sql"
    
    with open(csv_filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        with open(sql_filename, 'w', encoding='utf-8') as sqlfile:
            sqlfile.write("-- Import scraped videos to Railway database\n")
            sqlfile.write("-- This will insert/update videos with correct view counts\n\n")
            
            for row in reader:
                # Escape single quotes in text fields
                title = row['title'].replace("'", "''")
                description = row['description'].replace("'", "''")
                channel = row['channel'].replace("'", "''")
                
                sql = f"""
INSERT INTO scraped_videos (
    video_id, video_url, title, description, thumbnail_url,
    channel, duration, view_count, difficulty, tool, quality_score,
    published_at, scraped_at
) VALUES (
    '{row['video_id']}', '{row['video_url']}', '{title}', '{description}', '{row['thumbnail_url']}',
    '{channel}', {row['duration']}, {row['view_count']}, '{row['difficulty']}', '{row['tool']}', {row['quality_score']},
    '{row['published_at']}', '{row['scraped_at']}'
)
ON CONFLICT (video_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    view_count = EXCLUDED.view_count,
    quality_score = EXCLUDED.quality_score,
    scraped_at = EXCLUDED.scraped_at;
"""
                sqlfile.write(sql)
    
    logger.info(f"✅ Created {sql_filename}")
    return sql_filename

def run_railway_import(sql_filename):
    """Run the import using Railway CLI."""
    logger.info("🚂 Running import on Railway...")
    
    try:
        # Run the SQL file on Railway database
        cmd = ['railway', 'run', 'psql', '-f', sql_filename]
        
        logger.info(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            logger.info("✅ Import completed successfully!")
            logger.info("Output:", result.stdout)
            return True
        else:
            logger.error("❌ Import failed!")
            logger.error("Error:", result.stderr)
            return False
            
    except Exception as e:
        logger.error(f"❌ Error running Railway import: {e}")
        return False

def verify_import():
    """Verify the import was successful."""
    logger.info("🔍 Verifying import...")
    
    try:
        # Check video count
        cmd = ['railway', 'run', 'psql', '-c', 'SELECT COUNT(*) as total_videos FROM scraped_videos;']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"📊 Railway database now has videos!")
            logger.info("Output:", result.stdout)
            
            # Check sample videos with view counts
            cmd = ['railway', 'run', 'psql', '-c', 
                   'SELECT video_id, title, view_count, tool FROM scraped_videos ORDER BY view_count DESC LIMIT 3;']
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("📺 Sample videos with highest view counts:")
                logger.info("Output:", result.stdout)
            
            return True
        else:
            logger.error("❌ Verification failed!")
            logger.error("Error:", result.stderr)
            return False
            
    except Exception as e:
        logger.error(f"❌ Error verifying import: {e}")
        return False

if __name__ == "__main__":
    print("🚂 RAILWAY DATABASE IMPORT")
    print("=" * 60)
    
    # Check Railway CLI
    if not check_railway_cli():
        print("\n❌ Railway CLI setup required.")
        print("Please:")
        print("1. Install Railway CLI: npm install -g @railway/cli")
        print("2. Login: railway login")
        print("3. Make sure you're in the correct Railway project")
        exit(1)
    
    # Create SQL import file
    sql_file = create_import_sql()
    if not sql_file:
        exit(1)
    
    # Run import
    print(f"\n📥 Importing {sql_file} to Railway database...")
    if run_railway_import(sql_file):
        print("\n🎉 SUCCESS! Videos imported to Railway database!")
        
        # Verify
        verify_import()
        
        print("\n📺 Your frontend should now show correct view counts!")
        print("🌐 Check: https://backend-production-cd9f.up.railway.app/api/videos/search?tool=zapier")
    else:
        print("\n❌ Import failed. Check the logs above.")

