"""Real YouTube scraper using yt-dlp (no API key needed)."""

import logging
import yt_dlp
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from config.settings import MAX_VIDEOS_PER_TERM, MAX_WORKERS

logger = logging.getLogger(__name__)


class YtDlpRealScraper:
    """Real YouTube video scraper using yt-dlp - NO API key required!"""
    
    def __init__(self):
        self.videos_found = 0
        self.duplicates_skipped = 0
        self.max_videos_per_term = MAX_VIDEOS_PER_TERM
        
        # yt-dlp options for REAL YouTube search
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,  # Get full video info
            'skip_download': True,
            'format': 'best',
            'socket_timeout': 30,
            'retries': 3,
            'fragment_retries': 3,
            'ignoreerrors': True,
            'no_color': True,
        }
    
    def search_videos(self, search_term, max_results=None):
        """Search for REAL YouTube videos using yt-dlp."""
        if max_results is None:
            max_results = min(10, self.max_videos_per_term)
            
        try:
            logger.info(f"🔍 Searching for REAL videos: '{search_term}' (max {max_results})")
            
            # YouTube search URL
            search_url = f"ytsearch{max_results}:{search_term}"
            
            videos = []
            
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                try:
                    # Extract video information
                    result = ydl.extract_info(search_url, download=False)
                    
                    if result and 'entries' in result:
                        for entry in result['entries']:
                            if entry:  # Skip None entries
                                video_data = self._extract_video_data(entry, search_term)
                                if video_data and self._filter_video(video_data):
                                    videos.append(video_data)
                                    logger.debug(f"   ✓ '{video_data['title'][:50]}...'")
                    
                except Exception as e:
                    logger.error(f"❌ yt-dlp extraction error for '{search_term}': {e}")
                    return []
            
            logger.info(f"✅ Found {len(videos)} REAL videos for '{search_term}'")
            return videos
            
        except Exception as e:
            logger.error(f"❌ Search failed for '{search_term}': {e}")
            return []
    
    def _extract_video_data(self, entry, search_term):
        """Extract video data from yt-dlp entry."""
        try:
            video_id = entry.get('id')
            if not video_id:
                return None
            
            # Parse publish date
            upload_date = entry.get('upload_date')
            if upload_date:
                try:
                    published_at = datetime.strptime(upload_date, '%Y%m%d')
                except:
                    published_at = datetime.now()
            else:
                published_at = datetime.now()
            
            return {
                'video_id': video_id,
                'title': entry.get('title', 'Untitled'),
                'description': entry.get('description', '')[:500],  # Limit length
                'thumbnail_url': entry.get('thumbnail', ''),
                'channel_name': entry.get('uploader', 'Unknown'),
                'channel_id': entry.get('channel_id', ''),
                'published_at': published_at.isoformat(),
                'duration_seconds': int(entry.get('duration', 0)),
                'view_count': int(entry.get('view_count', 0)),
                'like_count': int(entry.get('like_count', 0)),
                'comment_count': int(entry.get('comment_count', 0)),
            }
            
        except Exception as e:
            logger.debug(f"Failed to extract video data: {e}")
            return None
    
    def _filter_video(self, video_data):
        """Apply quality filters."""
        # Must have video_id and title
        if not video_data.get('video_id') or not video_data.get('title'):
            return False
        
        # Check duration (prefer 4-20 minute videos for tutorials)
        duration = video_data['duration_seconds']
        if duration < 180 or duration > 1800:  # 3-30 minutes
            return False
        
        # Check view count (filter out very low quality)
        if video_data['view_count'] < 500:
            return False
        
        return True
    
    def scrape_parallel_streaming(self, search_terms, tool_name, immediate_callback, progress_callback=None):
        """Scrape multiple search terms with IMMEDIATE processing as videos are found."""
        total_terms = len(search_terms)
        
        logger.info(f"🚀 Starting STREAMING YouTube scraping for {total_terms} search terms ({tool_name})")
        logger.info(f"🎓 Using yt-dlp to find REAL videos (NO API key needed!)")
        logger.info(f"💡 Videos will be processed and saved IMMEDIATELY as found!")
        
        # Use ThreadPoolExecutor for parallel scraping
        with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, 3)) as executor:
            # Submit all search tasks
            future_to_term = {
                executor.submit(self.search_videos, term): term 
                for term in search_terms
            }
            
            completed = 0
            for future in as_completed(future_to_term):
                term = future_to_term[future]
                completed += 1
                
                try:
                    videos = future.result()
                    self.videos_found += len(videos)
                    
                    # IMMEDIATELY process and insert videos!
                    if videos and immediate_callback:
                        immediate_callback(videos, term)
                    
                    # Progress callback
                    if progress_callback:
                        progress_callback(completed, total_terms, term, len(videos))
                    
                    logger.info(f"✅ [{completed}/{total_terms}] '{term}': {len(videos)} REAL videos")
                    
                    # Delay to avoid rate limiting
                    time.sleep(1.5)
                    
                except Exception as e:
                    logger.error(f"❌ Failed to process '{term}': {e}")
                    if progress_callback:
                        progress_callback(completed, total_terms, term, 0)
        
        logger.info(f"🎉 STREAMING scraping complete! Videos inserted to DB in real-time!")
    
    def scrape_parallel(self, search_terms, tool_name, progress_callback=None):
        """Scrape multiple search terms in parallel (legacy method)."""
        all_videos = []
        total_terms = len(search_terms)
        
        logger.info(f"🚀 Starting REAL YouTube scraping for {total_terms} search terms ({tool_name})")
        logger.info(f"🎓 Using yt-dlp to find REAL videos for learners (NO API key needed!)")
        
        # Use ThreadPoolExecutor for parallel scraping
        with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, 3)) as executor:
            # Submit all search tasks
            future_to_term = {
                executor.submit(self.search_videos, term): term 
                for term in search_terms
            }
            
            completed = 0
            for future in as_completed(future_to_term):
                term = future_to_term[future]
                completed += 1
                
                try:
                    videos = future.result()
                    
                    # Add search metadata
                    for video in videos:
                        video['search_query'] = term
                        video['tool'] = tool_name
                    
                    all_videos.extend(videos)
                    self.videos_found += len(videos)
                    
                    # Progress callback
                    if progress_callback:
                        progress_callback(completed, total_terms, term, len(videos))
                    
                    logger.info(f"✅ [{completed}/{total_terms}] '{term}': {len(videos)} REAL videos")
                    
                    # Delay to avoid rate limiting
                    time.sleep(1.5)
                    
                except Exception as e:
                    logger.error(f"❌ Failed to process '{term}': {e}")
                    if progress_callback:
                        progress_callback(completed, total_terms, term, 0)
        
        logger.info(f"🎉 REAL YouTube scraping complete! Found {len(all_videos)} REAL videos")
        return all_videos
    
    def get_stats(self):
        """Get scraping statistics."""
        return {
            'videos_found': self.videos_found,
            'duplicates_skipped': self.duplicates_skipped,
            'method': 'yt-dlp (REAL YouTube videos, NO API key needed)'
        }


