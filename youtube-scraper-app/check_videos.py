"""Check what videos are in the database."""

from config.database import db_manager

conn = db_manager.get_connection()
cursor = conn.cursor()

# Count videos by tool in scraped_videos table
cursor.execute('SELECT COUNT(*), tool FROM scraped_videos GROUP BY tool')
print('📊 Videos in database by tool (scraped_videos):')
total = 0
for row in cursor.fetchall():
    count = row[0]
    tool = row[1]
    total += count
    print(f'   {tool}: {count} videos')

print(f'\n   TOTAL: {total} videos')

# Count by difficulty
cursor.execute('SELECT COUNT(*), difficulty FROM scraped_videos GROUP BY difficulty')
print('\n📊 Videos by difficulty:')
for row in cursor.fetchall():
    print(f'   {row[1]}: {row[0]} videos')

# Get sample videos
print('\n📺 Sample videos (most recent):')
cursor.execute('''
    SELECT video_id, title, channel, tool, difficulty, view_count 
    FROM scraped_videos 
    ORDER BY scraped_at DESC 
    LIMIT 10
''')

for row in cursor.fetchall():
    video_id, title, channel, tool, difficulty, views = row
    print(f'\n   Video ID: {video_id}')
    print(f'   Title: {title[:60]}...')
    print(f'   Channel: {channel}')
    print(f'   Tool: {tool}')
    print(f'   Difficulty: {difficulty}')
    print(f'   Views: {views:,}')
    print(f'   URL: https://www.youtube.com/watch?v={video_id}')

cursor.close()
db_manager.return_connection(conn)
