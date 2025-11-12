"""Real YouTube scraper that finds actual videos."""

import logging
import requests
from bs4 import BeautifulSoup
import re
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from config.settings import MAX_VIDEOS_PER_TERM, MIN_VIDEO_VIEWS, MAX_WORKERS

logger = logging.getLogger(__name__)


class RealYouTubeScraper:
    """Real YouTube scraper that finds actual videos."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.videos_found = 0
        self.duplicates_skipped = 0
        self.max_videos_per_term = MAX_VIDEOS_PER_TERM
    
    def search_videos(self, search_term, max_results=None):
        """Search for REAL YouTube videos."""
        if max_results is None:
            max_results = self.max_videos_per_term
            
        try:
            logger.info(f"🔍 Searching for REAL videos: '{search_term}' (max {max_results} results)")
            
            # Use YouTube's search endpoint that returns JSON
            search_url = "https://www.youtube.com/results"
            params = {
                'search_query': search_term,
                'sp': 'CAI%253D'  # Sort by relevance
            }
            
            response = self.session.get(search_url, params=params, timeout=30)
            response.raise_for_status()
            
            # Look for the initial data script that contains video info
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the script tag with ytInitialData
            scripts = soup.find_all('script')
            videos = []
            
            for script in scripts:
                if script.string and 'var ytInitialData' in script.string:
                    # Extract the JSON data
                    script_text = script.string
                    start = script_text.find('var ytInitialData = ') + len('var ytInitialData = ')
                    end = script_text.find(';</script>', start)
                    
                    if start > len('var ytInitialData = ') and end > start:
                        try:
                            import json
                            json_str = script_text[start:end]
                            data = json.loads(json_str)
                            
                            # Extract video data from the JSON structure
                            videos = self._extract_videos_from_json(data, search_term, max_results)
                            break
                        except Exception as e:
                            logger.debug(f"Failed to parse JSON: {e}")
                            continue
            
            # If no videos found from JSON, try alternative method
            if not videos:
                videos = self._extract_videos_from_html(soup, search_term, max_results)
            
            # Only return real videos (not dummy ones)
            real_videos = [v for v in videos if not v.get('video_id', '').startswith('dummy_')]
            
            logger.info(f"✅ Found {len(real_videos)} REAL videos for '{search_term}'")
            return real_videos
            
        except Exception as e:
            logger.error(f"❌ Search failed for '{search_term}': {e}")
            return []
    
    def _extract_videos_from_json(self, data, search_term, max_results):
        """Extract videos from YouTube's JSON data."""
        videos = []
        
        try:
            # Navigate through the JSON structure to find video results
            contents = data.get('contents', {})
            two_column_search_results = contents.get('twoColumnSearchResultsRenderer', {})
            primary_contents = two_column_search_results.get('primaryContents', {})
            section_list = primary_contents.get('sectionListRenderer', {})
            contents_list = section_list.get('contents', [])
            
            for content in contents_list:
                item_section = content.get('itemSectionRenderer', {})
                contents_items = item_section.get('contents', [])
                
                for item in contents_items[:max_results]:
                    video_renderer = item.get('videoRenderer')
                    if video_renderer:
                        video_data = self._parse_video_renderer(video_renderer, search_term)
                        if video_data:
                            videos.append(video_data)
                            
        except Exception as e:
            logger.debug(f"Failed to extract from JSON: {e}")
        
        return videos
    
    def _parse_video_renderer(self, video_renderer, search_term):
        """Parse a video renderer object."""
        try:
            video_id = video_renderer.get('videoId')
            if not video_id:
                return None
            
            title = video_renderer.get('title', {}).get('runs', [{}])[0].get('text', '')
            channel_title = video_renderer.get('ownerText', {}).get('runs', [{}])[0].get('text', 'Unknown')
            
            # Get thumbnail
            thumbnails = video_renderer.get('thumbnail', {}).get('thumbnails', [])
            thumbnail_url = thumbnails[-1].get('url', '') if thumbnails else ''
            
            # Get duration
            length_text = video_renderer.get('lengthText', {}).get('simpleText', '0:00')
            duration_seconds = self._parse_duration(length_text)
            
            # Get view count
            view_count_text = video_renderer.get('viewCountText', {}).get('simpleText', '0 views')
            view_count = self._parse_view_count(view_count_text)
            
            video_data = {
                'video_id': video_id,
                'title': title,
                'description': '',  # Not available in search results
                'thumbnail_url': thumbnail_url,
                'channel_name': channel_title,
                'channel_id': '',
                'published_at': None,  # Not easily available
                'duration_seconds': duration_seconds,
                'view_count': view_count,
                'like_count': 0,
                'comment_count': 0,
            }
            
            return video_data
            
        except Exception as e:
            logger.debug(f"Failed to parse video renderer: {e}")
            return None
    
    def _extract_videos_from_html(self, soup, search_term, max_results):
        """Fallback method to extract videos from HTML."""
        videos = []
        
        try:
            # Look for video links in the HTML
            video_links = soup.find_all('a', {'href': re.compile(r'/watch\?v=')})
            
            for link in video_links[:max_results]:
                try:
                    href = link.get('href')
                    video_id = href.split('v=')[1].split('&')[0]
                    
                    # Get title from the link
                    title_element = link.find('span', {'id': 'video-title'})
                    title = title_element.get('title', '') if title_element else ''
                    
                    if title and video_id:
                        video_data = {
                            'video_id': video_id,
                            'title': title,
                            'description': '',
                            'thumbnail_url': f'https://i.ytimg.com/vi/{video_id}/default.jpg',
                            'channel_name': 'Unknown',
                            'channel_id': '',
                            'published_at': None,
                            'duration_seconds': 0,
                            'view_count': 0,
                            'like_count': 0,
                            'comment_count': 0,
                        }
                        videos.append(video_data)
                        
                except Exception as e:
                    logger.debug(f"Failed to parse video link: {e}")
                    continue
                    
        except Exception as e:
            logger.debug(f"Failed to extract from HTML: {e}")
        
        return videos
    
    def _parse_duration(self, text):
        """Parse duration from text like '5:30' or '1:23:45'."""
        try:
            parts = text.split(':')
            if len(parts) == 2:
                return int(parts[0]) * 60 + int(parts[1])
            elif len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        except:
            return 0
    
    def _parse_view_count(self, text):
        """Parse view count from text like '1.2M views' or '500K views'."""
        try:
            # Remove 'views' and clean up
            text = text.lower().replace('views', '').replace('view', '').strip()
            
            if 'm' in text:
                return int(float(text.replace('m', '')) * 1000000)
            elif 'k' in text:
                return int(float(text.replace('k', '')) * 1000)
            elif 'b' in text:
                return int(float(text.replace('b', '')) * 1000000000)
            else:
                # Extract numbers only
                numbers = re.findall(r'\d+', text)
                return int(''.join(numbers)) if numbers else 0
        except:
            return 0
    
    def _filter_video(self, video_data):
        """Apply quality filters to video."""
        # Check view count
        if video_data['view_count'] < MIN_VIDEO_VIEWS:
            return False
        
        return True
    
    def scrape_parallel(self, search_terms, tool_name, progress_callback=None):
        """Scrape multiple search terms in parallel."""
        all_videos = []
        total_terms = len(search_terms)
        
        logger.info(f"🚀 Starting REAL parallel scraping for {total_terms} search terms ({tool_name})")
        logger.info(f"🌐 Using REAL YouTube scraping (no dummy data!)")
        
        with ThreadPoolExecutor(max_workers=2) as executor:  # Reduced workers to be respectful
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
                    
                    # Be respectful - longer delay
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"❌ Failed to process '{term}': {e}")
        
        logger.info(f"🎉 REAL parallel scraping complete! Found {len(all_videos)} REAL videos")
        return all_videos
    
    def get_stats(self):
        """Get scraping statistics."""
        return {
            'videos_found': self.videos_found,
            'duplicates_skipped': self.duplicates_skipped,
            'method': 'REAL YouTube scraping (no dummy data)'
        }




