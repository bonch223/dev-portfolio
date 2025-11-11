"""
Enhanced YouTube Scraper with comprehensive features.
- Difficulty-specific scraping
- Advanced quality scoring
- Smart filtering
- Metadata extraction
- Duplicate detection
"""

import logging
import yt_dlp
import re
import time
import hashlib
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from config.settings import MAX_WORKERS

logger = logging.getLogger(__name__)

@dataclass
class VideoMetadata:
    """Enhanced video metadata structure."""
    video_id: str
    title: str
    description: str
    thumbnail_url: str
    channel_name: str
    channel_id: str
    published_at: datetime
    duration_seconds: int
    view_count: int
    like_count: int
    comment_count: int
    search_query: str
    tool: str
    difficulty: str
    quality_score: float
    usefulness_score: float
    keywords: List[str]
    tags: List[str]
    has_tutorial_content: bool
    has_code_examples: bool
    is_series: bool
    video_url: str
    transcript_available: bool
    chapters_available: bool
    content_hash: str


class EnhancedYouTubeScraper:
    """Enhanced YouTube scraper with advanced features."""
    
    def __init__(self):
        self.videos_found = 0
        self.duplicates_skipped = 0
        self.quality_filtered = 0
        self.content_hashes = set()  # For duplicate detection
        
        # Enhanced yt-dlp options
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
            'format': 'best',
            'socket_timeout': 30,
            'retries': 3,
            'fragment_retries': 3,
            'ignoreerrors': True,
            'no_color': True,
            'writeinfojson': False,
            'writesubtitles': False,
            'writeautomaticsub': False,
        }
        
        # Quality scoring weights
        self.quality_weights = {
            'engagement': 0.25,      # Views, likes, comments
            'content_quality': 0.30, # Title, description quality
            'creator_authority': 0.20, # Channel reputation
            'relevance': 0.15,       # Match to search term
            'freshness': 0.10        # Publication date
        }
        
        # Difficulty-specific filters
        self.difficulty_filters = {
            'beginner': {
                'duration_range': (180, 900),  # 3-15 minutes (more realistic for tutorials)
                'min_views': 1000,
                'keywords': ['tutorial', 'beginner', 'basics', 'getting started', 'introduction', '101', 'how to'],
                'exclude_keywords': ['advanced', 'expert', 'complex', 'enterprise', 'api', 'webhook']
            },
            'intermediate': {
                'duration_range': (300, 1200),  # 5-20 minutes
                'min_views': 2000,
                'keywords': ['automation', 'workflow', 'integration', 'setup', 'configuration', 'tips'],
                'exclude_keywords': ['beginner', 'basics', '101', 'advanced', 'expert', 'enterprise']
            },
            'advanced': {
                'duration_range': (600, 1800),  # 10-30 minutes
                'min_views': 5000,
                'keywords': ['advanced', 'enterprise', 'api', 'webhook', 'custom', 'complex', 'expert'],
                'exclude_keywords': ['beginner', 'basics', '101', 'tutorial', 'getting started']
            }
        }
    
    def scrape_for_difficulty(self, tool: str, difficulty: str, max_videos: int = 5) -> List[Dict]:
        """Scrape videos for a specific difficulty level."""
        logger.info(f"🎯 Scraping {max_videos} {difficulty} videos for {tool}")
        
        # Get difficulty-specific search terms
        search_terms = self._get_difficulty_search_terms(tool, difficulty)
        
        if not search_terms:
            logger.warning(f"❌ No search terms found for {tool} - {difficulty}")
            return []
        
        # Limit search terms based on max_videos needed
        search_terms = search_terms[:min(len(search_terms), max_videos * 2)]
        
        all_videos = []
        
        with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, 3)) as executor:
            future_to_term = {
                executor.submit(self._search_with_difficulty_filter, term, tool, difficulty): term 
                for term in search_terms
            }
            
            for future in as_completed(future_to_term):
                term = future_to_term[future]
                try:
                    videos = future.result()
                    all_videos.extend(videos)
                    
                    # Stop if we have enough videos
                    if len(all_videos) >= max_videos:
                        break
                        
                except Exception as e:
                    logger.error(f"❌ Failed to process '{term}': {e}")
        
        # Sort by quality score and take the best videos
        all_videos.sort(key=lambda x: x.get('quality_score', 0), reverse=True)
        selected_videos = all_videos[:max_videos]
        
        logger.info(f"✅ Selected {len(selected_videos)} high-quality {difficulty} videos for {tool}")
        return selected_videos
    
    def _search_with_difficulty_filter(self, search_term: str, tool: str, difficulty: str) -> List[Dict]:
        """Search with difficulty-specific filtering."""
        try:
            logger.info(f"🔍 Searching: '{search_term}' ({difficulty})")
            
            search_url = f"ytsearch10:{search_term}"
            videos = []
            
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                try:
                    result = ydl.extract_info(search_url, download=False)
                    
                    if result and 'entries' in result:
                        for entry in result['entries']:
                            if entry:
                                video_data = self._extract_enhanced_metadata(entry, search_term, tool, difficulty)
                                if video_data and self._apply_difficulty_filter(video_data, difficulty):
                                    videos.append(video_data)
                    
                except Exception as e:
                    logger.error(f"❌ yt-dlp error for '{search_term}': {e}")
                    return []
            
            logger.info(f"✅ Found {len(videos)} {difficulty} videos for '{search_term}'")
            return videos
            
        except Exception as e:
            logger.error(f"❌ Search failed for '{search_term}': {e}")
            return []
    
    def _extract_enhanced_metadata(self, entry: Dict, search_term: str, tool: str, difficulty: str) -> Optional[Dict]:
        """Extract comprehensive video metadata."""
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
            
            # Extract title and description
            title = entry.get('title', 'Untitled')
            description = entry.get('description', '')[:1000]  # Limit length
            
            # Generate content hash for duplicate detection
            content_hash = hashlib.md5(f"{video_id}{title}".encode()).hexdigest()
            
            if content_hash in self.content_hashes:
                self.duplicates_skipped += 1
                return None
            
            self.content_hashes.add(content_hash)
            
            # Extract keywords and tags
            keywords = self._extract_keywords(title, description, search_term)
            tags = entry.get('tags', []) or []
            
            # Determine content characteristics
            has_tutorial_content = self._has_tutorial_content(title, description)
            has_code_examples = self._has_code_examples(title, description)
            is_series = self._is_part_of_series(title)
            
            # Calculate quality scores
            quality_score = self._calculate_quality_score(entry, search_term, difficulty)
            usefulness_score = self._calculate_usefulness_score(entry, tool, difficulty)
            
            return {
                'video_id': video_id,
                'title': title,
                'description': description,
                'thumbnail_url': entry.get('thumbnail', ''),
                'channel_name': entry.get('uploader', 'Unknown'),
                'channel_id': entry.get('channel_id', ''),
                'published_at': published_at.isoformat(),
                'duration_seconds': int(entry.get('duration', 0)),
                'view_count': int(entry.get('view_count', 0)),
                'like_count': int(entry.get('like_count', 0)),
                'comment_count': int(entry.get('comment_count', 0)),
                'search_query': search_term,
                'tool': tool,
                'difficulty': difficulty,
                'quality_score': quality_score,
                'usefulness_score': usefulness_score,
                'keywords': keywords,
                'tags': tags[:10],  # Limit tags
                'has_tutorial_content': has_tutorial_content,
                'has_code_examples': has_code_examples,
                'is_series': is_series,
                'video_url': f"https://www.youtube.com/watch?v={video_id}",
                'transcript_available': bool(entry.get('subtitles')),
                'chapters_available': bool(entry.get('chapters')),
                'content_hash': content_hash
            }
            
        except Exception as e:
            logger.debug(f"Failed to extract enhanced metadata: {e}")
            return None
    
    def _apply_difficulty_filter(self, video_data: Dict, difficulty: str) -> bool:
        """Apply difficulty-specific filtering."""
        if difficulty not in self.difficulty_filters:
            return True
        
        filter_config = self.difficulty_filters[difficulty]
        
        # Duration filter
        duration = video_data['duration_seconds']
        min_duration, max_duration = filter_config['duration_range']
        if duration < min_duration or duration > max_duration:
            return False
        
        # View count filter
        if video_data['view_count'] < filter_config['min_views']:
            return False
        
        # Keyword inclusion filter
        title_desc = f"{video_data['title']} {video_data['description']}".lower()
        has_required_keywords = any(keyword in title_desc for keyword in filter_config['keywords'])
        if not has_required_keywords:
            return False
        
        # Keyword exclusion filter (more intelligent)
        excluded_keywords = filter_config['exclude_keywords']
        has_excluded_keywords = any(keyword in title_desc for keyword in excluded_keywords)
        
        # Only exclude if the excluded keyword appears in a context that suggests advanced content
        # For example, exclude "api" only if it appears with "advanced", "enterprise", etc.
        if has_excluded_keywords:
            # Check if excluded keywords appear in advanced contexts
            advanced_contexts = ['advanced', 'enterprise', 'expert', 'complex']
            has_advanced_context = any(context in title_desc for context in advanced_contexts)
            
            # Only exclude if there's an advanced context
            if has_advanced_context:
                return False
        
        # Quality score filter (adjusted for realistic scoring)
        if video_data['quality_score'] < 40:  # Lowered from 60 to 40
            return False
        
        return True
    
    def _calculate_quality_score(self, entry: Dict, search_term: str, difficulty: str) -> float:
        """Calculate comprehensive quality score."""
        score = 0.0
        
        # Engagement score (0-25 points)
        view_count = entry.get('view_count', 0)
        like_count = entry.get('like_count', 0)
        comment_count = entry.get('comment_count', 0)
        
        if view_count > 0:
            engagement_ratio = (like_count + comment_count * 2) / view_count
            score += min(25, engagement_ratio * 1000)
        
        # Content quality score (0-30 points)
        title = entry.get('title', '').lower()
        description = entry.get('description', '').lower()
        
        # Title quality indicators
        quality_indicators = ['tutorial', 'guide', 'step by step', 'complete', 'comprehensive']
        title_quality = sum(1 for indicator in quality_indicators if indicator in title)
        score += title_quality * 5  # Up to 25 points
        
        # Description length (detailed descriptions are better)
        if len(description) > 200:
            score += 5  # 5 points for detailed descriptions
        
        # Creator authority score (0-20 points)
        # This is simplified - in a real implementation, you'd track channel reputation
        channel_subscribers = entry.get('channel_follower_count', 0)
        if channel_subscribers > 10000:
            score += 10
        elif channel_subscribers > 1000:
            score += 5
        
        # Relevance score (0-15 points)
        search_words = search_term.lower().split()
        title_words = title.split()
        relevance = sum(1 for word in search_words if word in title_words)
        score += relevance * 3
        
        # Freshness score (0-10 points)
        upload_date = entry.get('upload_date')
        if upload_date:
            try:
                upload_datetime = datetime.strptime(upload_date, '%Y%m%d')
                days_old = (datetime.now() - upload_datetime).days
                if days_old < 365:  # Less than 1 year old
                    score += 10 - (days_old / 36.5)  # Decay over time
            except:
                pass
        
        return min(100, score)  # Cap at 100
    
    def _calculate_usefulness_score(self, entry: Dict, tool: str, difficulty: str) -> float:
        """Calculate usefulness score for learning."""
        score = 0.0
        
        title = entry.get('title', '').lower()
        description = entry.get('description', '').lower()
        
        # Tutorial content indicators
        tutorial_indicators = ['tutorial', 'how to', 'step by step', 'guide', 'walkthrough']
        tutorial_score = sum(1 for indicator in tutorial_indicators if indicator in title)
        score += tutorial_score * 10
        
        # Tool-specific indicators
        tool_indicators = {
            'zapier': ['zap', 'automation', 'workflow', 'trigger', 'action'],
            'n8n': ['node', 'workflow', 'automation', 'expression', 'webhook']
        }
        
        if tool in tool_indicators:
            tool_score = sum(1 for indicator in tool_indicators[tool] if indicator in title or indicator in description)
            score += tool_score * 5
        
        # Difficulty-specific indicators
        if difficulty == 'beginner':
            beginner_indicators = ['beginner', 'basics', 'getting started', 'introduction', '101']
            beginner_score = sum(1 for indicator in beginner_indicators if indicator in title)
            score += beginner_score * 8
        elif difficulty == 'intermediate':
            intermediate_indicators = ['automation', 'integration', 'setup', 'configuration']
            intermediate_score = sum(1 for indicator in intermediate_indicators if indicator in title)
            score += intermediate_score * 6
        elif difficulty == 'advanced':
            advanced_indicators = ['advanced', 'enterprise', 'api', 'webhook', 'custom']
            advanced_score = sum(1 for indicator in advanced_indicators if indicator in title)
            score += advanced_score * 7
        
        return min(100, score)
    
    def _extract_keywords(self, title: str, description: str, search_term: str) -> List[str]:
        """Extract relevant keywords from title and description."""
        text = f"{title} {description}".lower()
        
        # Common automation keywords
        keywords = []
        keyword_patterns = [
            r'\b(automation|workflow|integration|tutorial|guide|step by step)\b',
            r'\b(beginner|intermediate|advanced|basics|getting started)\b',
            r'\b(api|webhook|trigger|action|zap|node)\b',
            r'\b(setup|configuration|custom|enterprise)\b'
        ]
        
        for pattern in keyword_patterns:
            matches = re.findall(pattern, text)
            keywords.extend(matches)
        
        # Add search term words
        keywords.extend(search_term.lower().split())
        
        # Remove duplicates and return
        return list(set(keywords))[:10]
    
    def _has_tutorial_content(self, title: str, description: str) -> bool:
        """Check if video has tutorial content."""
        tutorial_indicators = ['tutorial', 'guide', 'how to', 'step by step', 'walkthrough', 'lesson']
        text = f"{title} {description}".lower()
        return any(indicator in text for indicator in tutorial_indicators)
    
    def _has_code_examples(self, title: str, description: str) -> bool:
        """Check if video likely contains code examples."""
        code_indicators = ['code', 'script', 'javascript', 'python', 'api', 'webhook', 'json']
        text = f"{title} {description}".lower()
        return any(indicator in text for indicator in code_indicators)
    
    def _is_part_of_series(self, title: str) -> bool:
        """Check if video is part of a series."""
        series_indicators = ['part', 'episode', 'series', '#', 'lesson']
        return any(indicator in title.lower() for indicator in series_indicators)
    
    def _get_difficulty_search_terms(self, tool: str, difficulty: str) -> List[str]:
        """Get search terms specific to difficulty level."""
        from config.tools_config import AUTOMATION_TOOLS
        
        if tool not in AUTOMATION_TOOLS:
            return []
        
        tool_config = AUTOMATION_TOOLS[tool]
        search_terms = []
        
        # Get difficulty-specific categories
        if difficulty == 'beginner':
            categories = ['beginner_basics', 'beginner_features']
        elif difficulty == 'intermediate':
            categories = ['intermediate_integrations', 'intermediate_workflows']
        elif difficulty == 'advanced':
            categories = ['advanced_technical', 'advanced_enterprise']
        else:
            return []
        
        # Collect search terms from relevant categories
        for category in categories:
            if category in tool_config.get('search_terms', {}):
                search_terms.extend(tool_config['search_terms'][category])
        
        return search_terms
    
    def get_stats(self) -> Dict:
        """Get scraping statistics."""
        return {
            'videos_found': self.videos_found,
            'duplicates_skipped': self.duplicates_skipped,
            'quality_filtered': self.quality_filtered,
            'unique_content_hashes': len(self.content_hashes),
            'method': 'Enhanced yt-dlp with difficulty-specific filtering'
        }
