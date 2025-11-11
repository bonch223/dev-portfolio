"""Create SQL import file for Railway database."""

import csv
import os

def create_sql_import():
    """Create SQL file to import videos."""
    print("📝 Creating SQL import file...")
    
    csv_filename = "scraped_videos_export.csv"
    if not os.path.exists(csv_filename):
        print(f"❌ CSV file {csv_filename} not found!")
        return None
    
    sql_filename = "import_videos.sql"
    
    with open(csv_filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        with open(sql_filename, 'w', encoding='utf-8') as sqlfile:
            sqlfile.write("-- Import scraped videos to Railway database\n")
            sqlfile.write("-- This will insert/update videos with correct view counts\n\n")
            
            count = 0
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
                count += 1
                
                if count % 100 == 0:
                    print(f"✅ Processed {count} videos...")
    
    print(f"✅ Created {sql_filename} with {count} video imports")
    return sql_filename

if __name__ == "__main__":
    sql_file = create_sql_import()
    if sql_file:
        print(f"\n🎉 SQL file created: {sql_file}")
        print("\n📋 Next steps:")
        print("1. Run: railway run psql -f import_videos.sql")
        print("2. Verify: railway run psql -c 'SELECT COUNT(*) FROM scraped_videos;'")
        print("3. Check view counts: railway run psql -c 'SELECT video_id, title, view_count FROM scraped_videos ORDER BY view_count DESC LIMIT 5;'")
    else:
        print("❌ Failed to create SQL file")

