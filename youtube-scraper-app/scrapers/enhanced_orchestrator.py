"""
Enhanced Scraper Orchestrator with difficulty-specific scraping.
"""

import logging
from datetime import datetime
from typing import List, Dict, Optional, Callable
from scrapers.enhanced_youtube_scraper import EnhancedYouTubeScraper
from scrapers.difficulty_classifier import DifficultyClassifier
from config.database import db_manager

logger = logging.getLogger(__name__)


class EnhancedScraperOrchestrator:
    """Enhanced orchestrator with difficulty-specific scraping capabilities."""
    
    def __init__(self):
        self.enhanced_scraper = EnhancedYouTubeScraper()
        self.difficulty_classifier = DifficultyClassifier()
        self.db = db_manager
        
        self.stats = {
            'tool_name': '',
            'total_searched': 0,
            'total_found': 0,
            'total_passed_quality': 0,
            'total_inserted': 0,
            'total_duplicates': 0,
            'start_time': None
        }
    
    def scrape_difficulty_specific(self, tool_name: str, difficulty: str, max_videos: int = 5, progress_callback: Optional[Callable] = None) -> bool:
        """Scrape videos for a specific difficulty level."""
        logger.info(f"🎯 Starting {difficulty} video scraping for {tool_name}")
        self.reset_stats()
        self.stats['tool_name'] = tool_name
        self.stats['start_time'] = datetime.now()
        
        try:
            # Scrape videos for specific difficulty
            videos = self.enhanced_scraper.scrape_for_difficulty(tool_name, difficulty, max_videos)
            
            if not videos:
                logger.warning(f"❌ No {difficulty} videos found for {tool_name}")
                return False
            
            logger.info(f"📊 Found {len(videos)} {difficulty} videos for {tool_name}")
            self.stats['total_found'] = len(videos)
            
            # Process and insert videos
            processed_videos = self._process_videos(videos)
            self.stats['total_passed_quality'] = len(processed_videos)
            
            if processed_videos:
                inserted_count = self.db.insert_videos_batch(processed_videos)
                self.stats['total_inserted'] = inserted_count
                logger.info(f"✅ Inserted {inserted_count} {difficulty} videos for {tool_name}")
            else:
                logger.warning(f"⚠️ No videos passed quality filtering for {difficulty}")
            
            # Print statistics
            self.print_stats(self.stats['start_time'])
            return True
            
        except Exception as e:
            logger.error(f"❌ Error scraping {difficulty} videos for {tool_name}: {e}")
            return False
    
    def scrape_all_difficulties(self, tool_name: str, videos_per_difficulty: Dict[str, int] = None, progress_callback: Optional[Callable] = None) -> Dict[str, bool]:
        """Scrape videos for all difficulty levels."""
        if videos_per_difficulty is None:
            videos_per_difficulty = {
                'beginner': 5,
                'intermediate': 10,
                'advanced': 8
            }
        
        logger.info(f"🚀 Starting comprehensive scraping for {tool_name}")
        results = {}
        
        for difficulty, max_videos in videos_per_difficulty.items():
            logger.info(f"📚 Scraping {difficulty} videos ({max_videos} videos)")
            
            success = self.scrape_difficulty_specific(tool_name, difficulty, max_videos, progress_callback)
            results[difficulty] = success
            
            if progress_callback:
                progress_callback(f"Completed {difficulty} scraping", max_videos, success)
        
        return results
    
    def _process_videos(self, videos: List[Dict]) -> List[Dict]:
        """Process and enhance videos before database insertion."""
        processed_videos = []
        
        for video in videos:
            try:
                # Ensure all required fields are present
                processed_video = self._ensure_video_structure(video)
                
                # Additional quality checks
                if self._passes_quality_checks(processed_video):
                    processed_videos.append(processed_video)
                else:
                    logger.debug(f"Skipped video due to quality checks: {video.get('title', 'Unknown')[:50]}")
                
            except Exception as e:
                logger.error(f"Error processing video: {e}")
                continue
        
        return processed_videos
    
    def _ensure_video_structure(self, video: Dict) -> Dict:
        """Ensure video has all required fields for database insertion."""
        # Map channel_name to channel_title for database compatibility
        if 'channel_name' in video and 'channel_title' not in video:
            video['channel_title'] = video['channel_name']
        
        # Ensure all required fields exist
        required_fields = {
            'video_url': f"https://www.youtube.com/watch?v={video.get('video_id', '')}",
            'channel_title': video.get('channel_title', video.get('channel_name', 'Unknown')),
            'duration_seconds': video.get('duration_seconds', 0),
            'view_count': video.get('view_count', 0),
            'difficulty': video.get('difficulty', 'intermediate'),
            'search_query': video.get('search_query', ''),
            'tool': video.get('tool', ''),
            'quality_score': video.get('quality_score', 50),
            'published_at': video.get('published_at', datetime.now().isoformat())
        }
        
        # Update video with required fields
        for field, default_value in required_fields.items():
            if field not in video or video[field] is None:
                video[field] = default_value
        
        return video
    
    def _passes_quality_checks(self, video: Dict) -> bool:
        """Additional quality checks for videos."""
        # Check quality score
        if video.get('quality_score', 0) < 50:
            return False
        
        # Check if video has meaningful content
        title = video.get('title', '')
        if len(title) < 10:
            return False
        
        # Check for spam indicators
        spam_indicators = ['click here', 'subscribe now', 'free money', 'make money fast']
        title_lower = title.lower()
        if any(indicator in title_lower for indicator in spam_indicators):
            return False
        
        return True
    
    def reset_stats(self):
        """Reset scraping statistics."""
        self.stats = {
            'tool_name': '',
            'total_searched': 0,
            'total_found': 0,
            'total_passed_quality': 0,
            'total_inserted': 0,
            'total_duplicates': 0,
            'start_time': None
        }
    
    def print_stats(self, start_time: datetime):
        """Print comprehensive scraping statistics."""
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.info("=" * 80)
        logger.info("📊 ENHANCED SCRAPING STATISTICS")
        logger.info("=" * 80)
        logger.info(f"Tool: {self.stats['tool_name']}")
        logger.info(f"Videos Found: {self.stats['total_found']}")
        logger.info(f"Passed Quality Filter: {self.stats['total_passed_quality']}")
        logger.info(f"Inserted to Database: {self.stats['total_inserted']}")
        logger.info(f"Duplicates Skipped: {self.stats['total_duplicates']}")
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info(f"Method: Enhanced yt-dlp with difficulty-specific filtering")
        
        # Enhanced scraper stats
        scraper_stats = self.enhanced_scraper.get_stats()
        logger.info(f"Unique Content Hashes: {scraper_stats['unique_content_hashes']}")
        logger.info(f"Quality Filtered: {scraper_stats['quality_filtered']}")
        
        logger.info("=" * 80)
    
    def get_database_stats(self, tool_name: str = None) -> Dict:
        """Get current database statistics."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            if tool_name:
                cursor.execute("""
                    SELECT difficulty, COUNT(*) as count, AVG(quality_score) as avg_quality
                    FROM scraped_videos 
                    WHERE tool = %s 
                    GROUP BY difficulty
                    ORDER BY difficulty
                """, (tool_name,))
            else:
                cursor.execute("""
                    SELECT tool, difficulty, COUNT(*) as count, AVG(quality_score) as avg_quality
                    FROM scraped_videos 
                    GROUP BY tool, difficulty
                    ORDER BY tool, difficulty
                """)
            
            results = cursor.fetchall()
            cursor.close()
            self.db.return_connection(conn)
            
            return {
                'videos_by_difficulty': results,
                'total_videos': sum(row[2] for row in results) if results else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return {'error': str(e)}



