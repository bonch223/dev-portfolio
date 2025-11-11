"""Intelligent difficulty classification for YouTube videos."""

import re
import logging

logger = logging.getLogger(__name__)


class DifficultyClassifier:
    """Classifies video difficulty based on multiple factors."""
    
    # Keyword weights for difficulty detection
    DIFFICULTY_KEYWORDS = {
        'beginner': {
            'strong': [
                'beginner', 'beginners', 'for beginners', 'absolute beginner',
                'getting started', 'intro', 'introduction', 'basics', 'basic',
                'fundamentals', 'tutorial', 'guide', 'walkthrough',
                'step by step', 'easy', 'simple', 'quick start',
                '101', 'crash course', 'from scratch', 'zero to'
            ],
            'medium': [
                'learn', 'how to', 'start', 'first', 'new to',
                'understand', 'explained', 'overview', 'demo'
            ]
        },
        'intermediate': {
            'strong': [
                'intermediate', 'workflow', 'automation', 'integration',
                'project', 'build', 'create', 'practical', 'real world',
                'use case', 'example', 'hands on', 'building',
                'implementing', 'working with'
            ],
            'medium': [
                'setup', 'configure', 'connect', 'sync', 'process',
                'manage', 'organize', 'automate'
            ]
        },
        'advanced': {
            'strong': [
                'advanced', 'complex', 'custom', 'api', 'webhook',
                'code', 'coding', 'programming', 'developer',
                'javascript', 'python', 'technical', 'development',
                'professional', 'expert level', 'deep dive'
            ],
            'medium': [
                'optimization', 'performance', 'scaling', 'architecture',
                'patterns', 'best practices', 'troubleshooting'
            ]
        },
        'expert': {
            'strong': [
                'expert', 'enterprise', 'production', 'architecture',
                'scalability', 'optimization', 'advanced optimization',
                'system design', 'microservices', 'infrastructure'
            ],
            'medium': [
                'security', 'deployment', 'ci/cd', 'devops',
                'kubernetes', 'docker compose'
            ]
        }
    }
    
    # Duration thresholds (in seconds)
    DURATION_THRESHOLDS = {
        'beginner': (300, 1200),      # 5-20 minutes
        'intermediate': (900, 2400),   # 15-40 minutes
        'advanced': (1500, 3600),      # 25-60 minutes
        'expert': (2400, 7200)         # 40+ minutes
    }
    
    def classify(self, video_data):
        """Classify video difficulty level."""
        title = video_data.get('title', '').lower()
        description = video_data.get('description', '').lower()
        duration = video_data.get('duration_seconds', 0)
        
        # Calculate scores for each difficulty level
        scores = {
            'beginner': 0,
            'intermediate': 0,
            'advanced': 0,
            'expert': 0
        }
        
        # Title keyword matching (60% weight)
        title_scores = self._score_text(title)
        for level, score in title_scores.items():
            scores[level] += score * 0.6
        
        # Description keyword matching (25% weight)
        description_scores = self._score_text(description)
        for level, score in description_scores.items():
            scores[level] += score * 0.25
        
        # Duration matching (15% weight)
        duration_scores = self._score_duration(duration)
        for level, score in duration_scores.items():
            scores[level] += score * 0.15
        
        # Determine final difficulty
        difficulty = max(scores, key=scores.get)
        confidence = scores[difficulty] / sum(scores.values()) if sum(scores.values()) > 0 else 0
        
        logger.debug(f"Classified '{video_data.get('title', '')}' as {difficulty} (confidence: {confidence:.2f})")
        
        return difficulty, confidence, scores
    
    def _score_text(self, text):
        """Score text against difficulty keywords."""
        scores = {
            'beginner': 0,
            'intermediate': 0,
            'advanced': 0,
            'expert': 0
        }
        
        for level, keywords in self.DIFFICULTY_KEYWORDS.items():
            # Strong keywords
            for keyword in keywords['strong']:
                if keyword in text:
                    scores[level] += 2.0
            
            # Medium keywords
            for keyword in keywords['medium']:
                if keyword in text:
                    scores[level] += 1.0
        
        return scores
    
    def _score_duration(self, duration):
        """Score based on video duration."""
        scores = {
            'beginner': 0,
            'intermediate': 0,
            'advanced': 0,
            'expert': 0
        }
        
        for level, (min_dur, max_dur) in self.DURATION_THRESHOLDS.items():
            if min_dur <= duration <= max_dur:
                # Perfect match
                scores[level] = 2.0
            elif duration < min_dur:
                # Too short, partial credit
                ratio = duration / min_dur
                scores[level] = ratio * 1.0
            else:
                # Too long, partial credit
                ratio = max_dur / duration
                scores[level] = ratio * 1.0
        
        return scores
    
    def classify_batch(self, videos):
        """Classify multiple videos at once."""
        results = []
        
        for video in videos:
            difficulty, confidence, scores = self.classify(video)
            # Map 'expert' to 'advanced' for database compatibility
            if difficulty == 'expert':
                difficulty = 'advanced'
            video['difficulty'] = difficulty
            video['classification_confidence'] = confidence
            video['classification_scores'] = scores
            results.append(video)
        
        return results


class QualityScorer:
    """Calculates quality score for videos based on multiple factors."""
    
    def __init__(self):
        self.weights = {
            'engagement': 0.30,     # Views, likes, comments
            'content': 0.25,        # Duration, description quality
            'creator': 0.20,        # Channel authority (if available)
            'relevance': 0.15,      # Title/description match
            'freshness': 0.10       # Recency
        }
    
    def calculate_quality_score(self, video_data, search_term=''):
        """Calculate comprehensive quality score (0-100)."""
        try:
            scores = {
                'engagement': self._score_engagement(video_data),
                'content': self._score_content(video_data),
                'creator': self._score_creator(video_data),
                'relevance': self._score_relevance(video_data, search_term),
                'freshness': self._score_freshness(video_data)
            }
            
            # Calculate weighted total
            total_score = sum(scores[key] * self.weights[key] for key in scores)
            
            video_data['quality_score'] = round(total_score, 2)
            video_data['quality_breakdown'] = scores
            
            logger.debug(f"Set quality_score={video_data['quality_score']} for video {video_data.get('video_id', 'unknown')}")
            
            return total_score
        except Exception as e:
            logger.error(f"Error calculating quality score: {e}")
            video_data['quality_score'] = 50.0  # Default fallback
            return 50.0
    
    def _score_engagement(self, video_data):
        """Score based on views, likes, comments."""
        views = video_data.get('view_count', 0)
        likes = video_data.get('like_count', 0)
        comments = video_data.get('comment_count', 0)
        
        # View score (0-40 points)
        view_score = min(40, (views / 1000) * 2)  # 1k views = 2 points, max 40
        
        # Like ratio score (0-30 points)
        like_ratio = (likes / views * 100) if views > 0 else 0
        like_score = min(30, like_ratio * 10)  # 3% = 30 points
        
        # Comment score (0-20 points)
        comment_score = min(20, (comments / 10) * 1)  # 10 comments = 1 point, max 20
        
        # Engagement score (0-10 points)
        engagement_ratio = ((likes + comments) / views * 100) if views > 0 else 0
        engagement_score = min(10, engagement_ratio * 5)
        
        total = view_score + like_score + comment_score + engagement_score
        return min(100, total)
    
    def _score_content(self, video_data):
        """Score based on content quality indicators."""
        duration = video_data.get('duration_seconds', 0)
        description = video_data.get('description', '')
        title = video_data.get('title', '')
        
        # Duration score (0-40 points) - prefer 10-30 minute videos
        if 600 <= duration <= 1800:  # 10-30 minutes
            duration_score = 40
        elif 300 <= duration <= 2400:  # 5-40 minutes
            duration_score = 30
        elif duration < 300:
            duration_score = 10
        else:
            duration_score = 20
        
        # Description quality (0-30 points)
        desc_length = len(description)
        if desc_length > 500:
            desc_score = 30
        elif desc_length > 200:
            desc_score = 20
        elif desc_length > 50:
            desc_score = 10
        else:
            desc_score = 5
        
        # Title quality (0-30 points)
        title_length = len(title)
        if 30 <= title_length <= 70:  # Optimal length
            title_score = 30
        elif 20 <= title_length <= 100:
            title_score = 20
        else:
            title_score = 10
        
        total = duration_score + desc_score + title_score
        return min(100, total)
    
    def _score_creator(self, video_data):
        """Score based on channel authority."""
        channel_name = video_data.get('channel_name', '')
        
        # Simple heuristic (in real implementation, would fetch channel stats)
        # For now, give baseline score
        return 50.0
    
    def _score_relevance(self, video_data, search_term):
        """Score based on relevance to search term."""
        if not search_term:
            return 50.0
        
        title = video_data.get('title', '').lower()
        description = video_data.get('description', '').lower()
        search_lower = search_term.lower()
        
        # Exact match in title (50 points)
        title_score = 50 if search_lower in title else 0
        
        # Partial match in title (25 points)
        search_words = search_lower.split()
        partial_matches = sum(1 for word in search_words if word in title)
        partial_score = (partial_matches / len(search_words)) * 25 if search_words else 0
        
        # Description match (25 points)
        desc_score = 25 if search_lower in description else 0
        
        total = title_score + partial_score + desc_score
        return min(100, total)
    
    def _score_freshness(self, video_data):
        """Score based on video recency."""
        from datetime import datetime
        
        published_at = video_data.get('published_at')
        if not published_at:
            return 50.0
        
        if isinstance(published_at, str):
            try:
                published_at = datetime.strptime(published_at, '%Y-%m-%dT%H:%M:%SZ')
            except:
                return 50.0
        
        age_days = (datetime.now() - published_at).days
        
        if age_days <= 90:  # 3 months
            return 100.0
        elif age_days <= 180:  # 6 months
            return 90.0
        elif age_days <= 365:  # 1 year
            return 80.0
        elif age_days <= 730:  # 2 years
            return 60.0
        elif age_days <= 1095:  # 3 years
            return 40.0
        else:
            return 20.0
    
    def score_batch(self, videos, search_term=''):
        """Score multiple videos at once."""
        for video in videos:
            self.calculate_quality_score(video, search_term)
        return videos



