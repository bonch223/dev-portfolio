"""YouTube Data API v3 scraper for educational content."""

import logging
import requests
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from config.settings import MAX_VIDEOS_PER_TERM, MIN_VIDEO_VIEWS, MAX_WORKERS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class YouTubeAPIScraperFixed:
    """YouTube Data API v3 scraper for finding real educational videos."""
    
    def __init__(self):
        self.api_key = os.getenv('YOUTUBE_API_KEY_1')
        self.videos_found = 0
        self.duplicates_skipped = 0
        self.max_videos_per_term = MAX_VIDEOS_PER_TERM
        self.quota_used = 0
        
        if not self.api_key or self.api_key == 'your_youtube_api_key_here':
            logger.warning("⚠️ YouTube API key not set. Please add YOUTUBE_API_KEY_1 to .env file")
    
    def search_videos(self, search_term, max_results=None):
        """Search for real YouTube videos using the Data API."""
        if max_results is None:
            max_results = min(10, self.max_videos_per_term)  # Limit for API quota
            
        if not self.api_key or self.api_key == 'your_youtube_api_key_here':
            logger.error("❌ YouTube API key not configured")
            return []
            
        try:
            logger.info(f"🔍 Searching for REAL videos: '{search_term}' (max {max_results} results)")
            
            # YouTube Data API v3 search endpoint
            search_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': search_term,
                'type': 'video',
                'maxResults': max_results,
                'order': 'relevance',
                'publishedAfter': (datetime.now() - timedelta(days=365)).isoformat() + 'Z',
                'videoDuration': 'medium',  # 4-20 minutes
                'relevanceLanguage': 'en',
                'key': self.api_key
            }
            
            response = requests.get(search_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            self.quota_used += 100  # Search costs 100 quota
            
            videos = []
            video_items = data.get('items', [])
            
            # Get video details for each video
            if video_items:
                video_ids = [item['id']['videoId'] for item in video_items]
                video_details = self._get_video_details(video_ids)
                
                for item in video_items:
                    video_id = item['id']['videoId']
                    snippet = item['snippet']
                    
                    # Get additional details
                    details = video_details.get(video_id, {})
                    
                    video_data = {
                        'video_id': video_id,
                        'title': snippet['title'],
                        'description': snippet['description'][:500],  # Limit description length
                        'thumbnail_url': snippet['thumbnails']['high']['url'],
                        'channel_name': snippet['channelTitle'],
                        'channel_id': snippet['channelId'],
                        'published_at': snippet['publishedAt'],
                        'duration_seconds': details.get('duration', 0),
                        'view_count': details.get('view_count', 0),
                        'like_count': details.get('like_count', 0),
                        'comment_count': details.get('comment_count', 0),
                    }
                    
                    if self._filter_video(video_data):
                        videos.append(video_data)
            
            logger.info(f"✅ Found {len(videos)} REAL videos for '{search_term}'")
            return videos
            
        except Exception as e:
            logger.error(f"❌ Search failed for '{search_term}': {e}")
            return []
    
    def _get_video_details(self, video_ids):
        """Get additional video details like duration and view count."""
        try:
            if not video_ids:
                return {}
                
            details_url = "https://www.googleapis.com/youtube/v3/videos"
            params = {
                'part': 'contentDetails,statistics',
                'id': ','.join(video_ids),
                'key': self.api_key
            }
            
            response = requests.get(details_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            self.quota_used += 1  # Each video detail costs 1 quota
            
            details = {}
            for item in data.get('items', []):
                video_id = item['id']
                content_details = item.get('contentDetails', {})
                statistics = item.get('statistics', {})
                
                # Parse duration (PT4M13S -> seconds)
                duration_text = content_details.get('duration', 'PT0S')
                duration = self._parse_duration(duration_text)
                
                details[video_id] = {
                    'duration': duration,
                    'view_count': int(statistics.get('viewCount', 0)),
                    'like_count': int(statistics.get('likeCount', 0)),
                    'comment_count': int(statistics.get('commentCount', 0))
                }
            
            return details
            
        except Exception as e:
            logger.error(f"❌ Failed to get video details: {e}")
            return {}
    
    def _parse_duration(self, duration_text):
        """Parse YouTube duration format (PT4M13S -> seconds)."""
        try:
            import re
            match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_text)
            if not match:
                return 0
            
            hours = int(match.group(1) or 0)
            minutes = int(match.group(2) or 0)
            seconds = int(match.group(3) or 0)
            
            return hours * 3600 + minutes * 60 + seconds
        except:
            return 0
    
    def _filter_video(self, video_data):
        """Apply quality filters to video."""
        # Check view count
        if video_data['view_count'] < MIN_VIDEO_VIEWS:
            return False
        
        # Check duration (prefer 4-20 minute videos)
        duration = video_data['duration_seconds']
        if duration < 240 or duration > 1200:  # 4-20 minutes
            return False
        
        # Filter out very short or very long videos
        return True
    
    def scrape_parallel(self, search_terms, tool_name, progress_callback=None):
        """Scrape multiple search terms in parallel (with API quota management)."""
        all_videos = []
        total_terms = len(search_terms)
        
        logger.info(f"🚀 Starting REAL YouTube API scraping for {total_terms} search terms ({tool_name})")
        logger.info(f"🌐 Using YouTube Data API v3 (REAL videos for learners!)")
        
        # Process terms sequentially to manage API quota
        for i, term in enumerate(search_terms):
            try:
                videos = self.search_videos(term)
                
                # Add search metadata
                for video in videos:
                    video['search_query'] = term
                    video['tool'] = tool_name
                
                all_videos.extend(videos)
                self.videos_found += len(videos)
                
                # Progress callback
                if progress_callback:
                    progress_callback(i + 1, total_terms, term, len(videos))
                
                logger.info(f"✅ [{i + 1}/{total_terms}] '{term}': {len(videos)} REAL videos")
                
                # API quota management - longer delay
                time.sleep(2)
                
                # Check quota limit (YouTube API has daily quota limits)
                if self.quota_used > 8000:  # Conservative limit
                    logger.warning("⚠️ Approaching API quota limit, stopping early")
                    break
                    
            except Exception as e:
                logger.error(f"❌ Failed to process '{term}': {e}")
        
        logger.info(f"🎉 REAL YouTube API scraping complete! Found {len(all_videos)} REAL videos")
        logger.info(f"📊 API quota used: {self.quota_used} units")
        return all_videos
    
    def get_stats(self):
        """Get scraping statistics."""
        return {
            'videos_found': self.videos_found,
            'duplicates_skipped': self.duplicates_skipped,
            'quota_used': self.quota_used,
            'method': 'YouTube Data API v3 (REAL videos for learners)'
        }




