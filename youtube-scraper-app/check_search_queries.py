"""Check what search queries are in the database."""

from config.database import db_manager

conn = db_manager.get_connection()
cursor = conn.cursor()

# Get unique search queries
cursor.execute('''
    SELECT DISTINCT search_query, COUNT(*) as count
    FROM video_cache
    WHERE tool = 'zapier'
    GROUP BY search_query
    ORDER BY count DESC
    LIMIT 20
''')

print('📊 Search queries in database:')
print()
for row in cursor.fetchall():
    search_query, count = row
    print(f'   "{search_query}": {count} videos')

cursor.close()
db_manager.return_connection(conn)



