"""Fast parallel YouTube Data API v3 scraper."""

import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import time
from config.settings import (
    YOUTUBE_API_KEYS, MAX_VIDEOS_PER_TERM,
    MIN_VIDEO_VIEWS, MIN_VIDEO_DURATION, MAX_VIDEO_DURATION,
    DATE_FILTER_YEARS, MAX_WORKERS
)

logger = logging.getLogger(__name__)


class YouTubeAPIScraperFast:
    """High-performance YouTube API scraper with parallel processing."""
    
    def __init__(self):
        self.api_keys = YOUTUBE_API_KEYS.copy() if YOUTUBE_API_KEYS else []
        self.current_key_index = 0
        self.youtube_clients = []
        self.quota_used = 0
        self.videos_found = 0
        self.duplicates_skipped = 0
        
        if not self.api_keys:
            logger.warning("⚠️ No YouTube API keys configured!")
        else:
            self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize YouTube API clients for all keys."""
        for api_key in self.api_keys:
            try:
                client = build('youtube', 'v3', developerKey=api_key)
                self.youtube_clients.append(client)
                logger.info(f"✅ Initialized YouTube API client ({len(self.youtube_clients)}/{len(self.api_keys)})")
            except Exception as e:
                logger.error(f"❌ Failed to initialize API client: {e}")
    
    def _get_client(self):
        """Get next available YouTube API client (round-robin)."""
        if not self.youtube_clients:
            raise Exception("No YouTube API clients available")
        
        client = self.youtube_clients[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.youtube_clients)
        return client
    
    def _calculate_date_filter(self):
        """Calculate the publishedAfter date for filtering."""
        date_ago = datetime.now() - timedelta(days=365 * DATE_FILTER_YEARS)
        return date_ago.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    def search_videos(self, search_term, max_results=MAX_VIDEOS_PER_TERM):
        """Search for videos using YouTube API."""
        try:
            client = self._get_client()
            published_after = self._calculate_date_filter()
            
            request = client.search().list(
                part='id,snippet',
                q=search_term,
                type='video',
                maxResults=min(max_results, 50),  # API max is 50 per request
                order='relevance',
                publishedAfter=published_after,
                videoDuration='medium',  # 4-20 minutes
                relevanceLanguage='en'
            )
            
            response = request.execute()
            self.quota_used += 100  # Search costs 100 units
            
            video_ids = []
            for item in response.get('items', []):
                if item['id']['kind'] == 'youtube#video':
                    video_ids.append(item['id']['videoId'])
            
            # If we need more results, paginate
            next_page_token = response.get('nextPageToken')
            while next_page_token and len(video_ids) < max_results:
                request = client.search().list(
                    part='id,snippet',
                    q=search_term,
                    type='video',
                    maxResults=min(max_results - len(video_ids), 50),
                    order='relevance',
                    publishedAfter=published_after,
                    pageToken=next_page_token,
                    videoDuration='medium',
                    relevanceLanguage='en'
                )
                
                response = request.execute()
                self.quota_used += 100
                
                for item in response.get('items', []):
                    if item['id']['kind'] == 'youtube#video':
                        video_ids.append(item['id']['videoId'])
                
                next_page_token = response.get('nextPageToken')
            
            logger.info(f"🔍 Found {len(video_ids)} video IDs for '{search_term}'")
            return video_ids
            
        except HttpError as e:
            if 'quotaExceeded' in str(e):
                logger.error(f"❌ API quota exceeded!")
                return []
            else:
                logger.error(f"❌ YouTube API error: {e}")
                return []
        except Exception as e:
            logger.error(f"❌ Search failed for '{search_term}': {e}")
            return []
    
    def get_video_details_batch(self, video_ids):
        """Get detailed information for multiple videos in batch (efficient)."""
        if not video_ids:
            return []
        
        videos_data = []
        
        # Process in batches of 50 (API limit)
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i+50]
            
            try:
                client = self._get_client()
                
                request = client.videos().list(
                    part='snippet,contentDetails,statistics',
                    id=','.join(batch_ids)
                )
                
                response = request.execute()
                self.quota_used += 1  # Videos.list costs 1 unit per request
                
                for item in response.get('items', []):
                    video_data = self._parse_video_data(item)
                    if video_data and self._filter_video(video_data):
                        videos_data.append(video_data)
                
                logger.info(f"📹 Processed batch {i//50 + 1}: {len(videos_data)} videos passed filters")
                
            except Exception as e:
                logger.error(f"❌ Failed to get video details for batch: {e}")
                continue
        
        return videos_data
    
    def _parse_video_data(self, item):
        """Parse video data from API response."""
        try:
            snippet = item.get('snippet', {})
            content_details = item.get('contentDetails', {})
            statistics = item.get('statistics', {})
            
            # Parse duration (ISO 8601 format like PT15M33S)
            duration_str = content_details.get('duration', 'PT0S')
            duration_seconds = self._parse_duration(duration_str)
            
            # Parse published date
            published_at = snippet.get('publishedAt', '')
            if published_at:
                published_at = datetime.strptime(published_at, '%Y-%m-%dT%H:%M:%SZ')
            
            # Get thumbnails (prefer maxres > high > medium > default)
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = (
                thumbnails.get('maxres', {}).get('url') or
                thumbnails.get('high', {}).get('url') or
                thumbnails.get('medium', {}).get('url') or
                thumbnails.get('default', {}).get('url', '')
            )
            
            return {
                'video_id': item.get('id', ''),
                'title': snippet.get('title', ''),
                'description': snippet.get('description', ''),
                'thumbnail_url': thumbnail_url,
                'channel_name': snippet.get('channelTitle', ''),
                'channel_id': snippet.get('channelId', ''),
                'published_at': published_at,
                'duration_seconds': duration_seconds,
                'view_count': int(statistics.get('viewCount', 0)),
                'like_count': int(statistics.get('likeCount', 0)),
                'comment_count': int(statistics.get('commentCount', 0)),
            }
        except Exception as e:
            logger.error(f"❌ Failed to parse video data: {e}")
            return None
    
    def _parse_duration(self, duration_str):
        """Parse ISO 8601 duration to seconds."""
        import re
        
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 0
        
        hours = int(match.group(1)) if match.group(1) else 0
        minutes = int(match.group(2)) if match.group(2) else 0
        seconds = int(match.group(3)) if match.group(3) else 0
        
        return hours * 3600 + minutes * 60 + seconds
    
    def _filter_video(self, video_data):
        """Apply quality filters to video."""
        # Check view count
        if video_data['view_count'] < MIN_VIDEO_VIEWS:
            return False
        
        # Check duration
        if video_data['duration_seconds'] < MIN_VIDEO_DURATION:
            return False
        
        if video_data['duration_seconds'] > MAX_VIDEO_DURATION:
            return False
        
        return True
    
    def scrape_parallel(self, search_terms, tool_name, progress_callback=None):
        """Scrape multiple search terms in parallel for maximum speed."""
        all_videos = []
        total_terms = len(search_terms)
        
        logger.info(f"🚀 Starting parallel scraping for {total_terms} search terms ({tool_name})")
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
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
                    video_ids = future.result()
                    
                    if video_ids:
                        # Get detailed info for all videos in batch
                        videos = self.get_video_details_batch(video_ids)
                        
                        # Add search metadata
                        for video in videos:
                            video['search_query'] = term
                            video['tool'] = tool_name
                        
                        all_videos.extend(videos)
                        self.videos_found += len(videos)
                    
                    # Progress callback
                    if progress_callback:
                        progress_callback(completed, total_terms, term, len(video_ids))
                    
                    logger.info(f"✅ [{completed}/{total_terms}] '{term}': {len(video_ids)} videos found")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to process '{term}': {e}")
        
        logger.info(f"🎉 Parallel scraping complete! Found {len(all_videos)} videos")
        return all_videos
    
    def get_stats(self):
        """Get scraping statistics."""
        return {
            'quota_used': self.quota_used,
            'videos_found': self.videos_found,
            'duplicates_skipped': self.duplicates_skipped,
            'api_keys_used': len(self.youtube_clients)
        }






