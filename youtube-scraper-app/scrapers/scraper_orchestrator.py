"""Main scraper orchestrator for coordinating all scraping operations."""

import logging
from datetime import datetime
from scrapers.ytdlp_real_scraper import YtDlpRealScraper
from scrapers.difficulty_classifier import DifficultyClassifier, QualityScorer
from config.database import db_manager
from config.tools_config import get_all_search_terms
from config.settings import MIN_QUALITY_SCORE, BATCH_INSERT_SIZE

logger = logging.getLogger(__name__)


class ScraperOrchestrator:
    """Orchestrates the entire scraping process."""
    
    def __init__(self):
        self.ytdlp_scraper = YtDlpRealScraper()  # Real YouTube scraper using yt-dlp (NO API key)
        self.difficulty_classifier = DifficultyClassifier()
        self.quality_scorer = QualityScorer()
        self.db = db_manager
        
        self.stats = {
            'total_searched': 0,
            'total_found': 0,
            'total_passed_quality': 0,
            'total_inserted': 0,
            'total_duplicates': 0,
            'start_time': None,
            'end_time': None
        }
    
    def scrape_tool(self, tool_name, categories=None, progress_callback=None, max_videos_per_term=50):
        """Scrape all videos for a specific tool with immediate processing."""
        logger.info(f"🚀 Starting scraping for {tool_name.upper()}")
        self.stats['start_time'] = datetime.now()
        
        # Initialize database connection
        if not self.db.connection_pool:
            self.db.initialize_pool()
        
        # Get search terms
        search_terms = get_all_search_terms(tool_name)
        if categories:
            from config.tools_config import get_search_terms_by_category
            search_terms = get_search_terms_by_category(tool_name, categories)
        
        if not search_terms:
            logger.error(f"❌ No search terms found for {tool_name}")
            return False
        
        logger.info(f"📋 Using {len(search_terms)} search terms")
        logger.info(f"💡 Videos will be processed and inserted IMMEDIATELY as found")
        self.stats['total_searched'] = len(search_terms)
        
        # Update yt-dlp scraper max videos setting
        self.ytdlp_scraper.max_videos_per_term = max_videos_per_term
        
        # Scrape with immediate processing callback
        def immediate_process_callback(videos_batch, search_term):
            """Process and insert videos immediately as they're found."""
            try:
                if not videos_batch:
                    logger.debug(f"No videos in batch for '{search_term}'")
                    return
                
                logger.debug(f"Processing {len(videos_batch)} videos from '{search_term}'")
                
                # Add search metadata
                for video in videos_batch:
                    video['search_query'] = search_term
                    video['tool'] = tool_name
                    self.stats['total_found'] += 1
                
                # Classify difficulty immediately
                videos_batch = self.difficulty_classifier.classify_batch(videos_batch)
                logger.debug(f"Classified {len(videos_batch)} videos")
                
                # Calculate quality scores immediately
                for video in videos_batch:
                    self.quality_scorer.calculate_quality_score(video, search_term)
                
                # Filter by quality
                quality_videos = [
                    v for v in videos_batch 
                    if v.get('quality_score', 0) >= MIN_QUALITY_SCORE
                ]
                
                self.stats['total_passed_quality'] += len(quality_videos)
                logger.debug(f"{len(quality_videos)} videos passed quality filter (min: {MIN_QUALITY_SCORE})")
                
                # Insert immediately
                if quality_videos:
                    inserted = self._insert_videos_batch(quality_videos)
                    self.stats['total_inserted'] += inserted
                    self.stats['total_duplicates'] += len(quality_videos) - inserted
                    
                    if inserted > 0:
                        logger.info(f"   💾 Inserted {inserted} videos from '{search_term}' → DB NOW!")
                    else:
                        logger.debug(f"No new videos inserted from '{search_term}' (all duplicates)")
                else:
                    logger.debug(f"No quality videos from '{search_term}'")
                    
            except Exception as e:
                logger.error(f"❌ Error in immediate_process_callback for '{search_term}': {e}")
                import traceback
                logger.error(traceback.format_exc())
        
        # Scrape REAL YouTube videos with immediate processing!
        self.ytdlp_scraper.scrape_parallel_streaming(
            search_terms, 
            tool_name,
            immediate_process_callback,
            progress_callback
        )
        
        self.stats['end_time'] = datetime.now()
        
        # Log final statistics
        self._log_statistics()
        
        return self.stats['total_inserted'] > 0
    
    def _insert_videos_batch(self, videos):
        """Insert videos in batches for performance."""
        total_inserted = 0
        
        for i in range(0, len(videos), BATCH_INSERT_SIZE):
            batch = videos[i:i + BATCH_INSERT_SIZE]
            
            # Prepare batch data (match existing backend schema)
            batch_data = []
            for video in batch:
                video_id = video['video_id']
                batch_data.append({
                    'video_id': video_id,
                    'video_url': f"https://www.youtube.com/watch?v={video_id}",
                    'title': video['title'],
                    'description': video.get('description', ''),
                    'thumbnail_url': video.get('thumbnail_url', ''),
                    'channel_title': video.get('channel_name', ''),  # Map channel_name to channel_title
                    'duration_seconds': video.get('duration_seconds', 0),
                    'view_count': video.get('view_count', 0),
                    'difficulty': video.get('difficulty', 'beginner'),
                    'search_query': video.get('search_query', ''),
                    'tool': video.get('tool', ''),
                    'quality_score': video.get('quality_score', 50.0),  # Add quality_score!
                    'published_at': video.get('published_at', '')
                })
            
            # Insert batch
            inserted = self.db.insert_videos_batch(batch_data)
            total_inserted += inserted
            
            logger.info(f"💾 Batch {i//BATCH_INSERT_SIZE + 1}: Inserted {inserted}/{len(batch)} videos")
        
        return total_inserted
    
    def _log_statistics(self):
        """Log scraping statistics."""
        duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
        
        logger.info("=" * 60)
        logger.info("📊 SCRAPING STATISTICS")
        logger.info("=" * 60)
        logger.info(f"Search Terms Processed: {self.stats['total_searched']}")
        logger.info(f"Videos Found: {self.stats['total_found']}")
        logger.info(f"Passed Quality Filter: {self.stats['total_passed_quality']}")
        logger.info(f"Inserted to Database: {self.stats['total_inserted']}")
        logger.info(f"Duplicates Skipped: {self.stats['total_duplicates']}")
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info(f"Method: yt-dlp (REAL YouTube videos, NO API key)")
        logger.info("=" * 60)
    
    def get_stats(self):
        """Get current statistics."""
        return {
            **self.stats,
            'scraper_stats': self.ytdlp_scraper.get_stats()
        }
    
    def scrape_both_tools(self, progress_callback=None):
        """Scrape both Zapier and N8N."""
        logger.info("🚀 Starting full scraping for Zapier and N8N")
        
        # Scrape Zapier
        logger.info("\n" + "=" * 60)
        logger.info("Starting Zapier scraping...")
        logger.info("=" * 60 + "\n")
        
        success_zapier = self.scrape_tool('zapier', progress_callback=progress_callback)
        
        # Scrape N8N
        logger.info("\n" + "=" * 60)
        logger.info("Starting N8N scraping...")
        logger.info("=" * 60 + "\n")
        
        success_n8n = self.scrape_tool('n8n', progress_callback=progress_callback)
        
        return success_zapier and success_n8n

