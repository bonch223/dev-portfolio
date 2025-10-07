const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Submit user feedback for a video
router.post('/feedback', async (req, res) => {
  try {
    const {
      video_id, user_rating, quality_rating, helpfulness_rating,
      accuracy_rating, clarity_rating, user_comment, feedback_type,
      user_session_id, user_ip_hash
    } = req.body;

    // Validate required fields
    if (!video_id || !user_rating) {
      return res.status(400).json({
        success: false,
        error: 'video_id and user_rating are required'
      });
    }

    // Validate rating ranges
    const ratings = { user_rating, quality_rating, helpfulness_rating, accuracy_rating, clarity_rating };
    for (const [key, value] of Object.entries(ratings)) {
      if (value !== undefined && (value < 1 || value > 5)) {
        return res.status(400).json({
          success: false,
          error: `${key} must be between 1 and 5`
        });
      }
    }

    // Check if video exists
    const videoCheckQuery = `SELECT video_id FROM scraped_videos WHERE video_id = $1`;
    const videoCheckResult = await query(videoCheckQuery, [video_id]);
    
    if (videoCheckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Insert feedback
    const insertQuery = `
      INSERT INTO user_feedback (
        video_id, user_rating, quality_rating, helpfulness_rating,
        accuracy_rating, clarity_rating, user_comment, feedback_type,
        user_session_id, user_ip_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      video_id, user_rating, quality_rating || null, helpfulness_rating || null,
      accuracy_rating || null, clarity_rating || null, user_comment || null,
      feedback_type || 'general', user_session_id || null, user_ip_hash || null
    ];

    const result = await query(insertQuery, values);

    // Update video ratings
    await updateVideoRatings(video_id);

    res.status(201).json({
      success: true,
      feedback: result.rows[0],
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

// Get feedback for a specific video
router.get('/feedback/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 20, offset = 0, feedback_type } = req.query;

    let whereClause = 'WHERE video_id = $1';
    const params = [videoId];
    let paramCount = 1;

    if (feedback_type) {
      paramCount++;
      whereClause += ` AND feedback_type = $${paramCount}`;
      params.push(feedback_type);
    }

    const feedbackQuery = `
      SELECT 
        id, user_rating, quality_rating, helpfulness_rating,
        accuracy_rating, clarity_rating, user_comment, feedback_type,
        created_at
      FROM user_feedback 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(parseInt(limit), parseInt(offset));
    const result = await query(feedbackQuery, params);

    // Get aggregated ratings
    const aggregatedQuery = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(user_rating) as avg_user_rating,
        AVG(quality_rating) as avg_quality_rating,
        AVG(helpfulness_rating) as avg_helpfulness_rating,
        AVG(accuracy_rating) as avg_accuracy_rating,
        AVG(clarity_rating) as avg_clarity_rating
      FROM user_feedback 
      WHERE video_id = $1
    `;

    const aggregatedResult = await query(aggregatedQuery, [videoId]);

    res.json({
      success: true,
      feedback: result.rows,
      aggregated: aggregatedResult.rows[0],
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// Get user's feedback history
router.get('/user-feedback/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const feedbackQuery = `
      SELECT 
        uf.*,
        sv.title, sv.thumbnail_url, sv.channel, sv.tool, sv.difficulty
      FROM user_feedback uf
      LEFT JOIN scraped_videos sv ON uf.video_id = sv.video_id
      WHERE uf.user_session_id = $1
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(feedbackQuery, [sessionId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      feedback_history: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching user feedback history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user feedback history'
    });
  }
});

// Update video ratings based on user feedback
async function updateVideoRatings(videoId) {
  try {
    const aggregatedQuery = `
      SELECT 
        COUNT(*) as rating_count,
        AVG(user_rating) as avg_user_rating,
        AVG(quality_rating) as avg_quality_rating,
        AVG(helpfulness_rating) as avg_helpfulness_rating,
        AVG(accuracy_rating) as avg_accuracy_rating,
        AVG(clarity_rating) as avg_clarity_rating
      FROM user_feedback 
      WHERE video_id = $1
    `;

    const result = await query(aggregatedQuery, [videoId]);
    const ratings = result.rows[0];

    if (ratings.rating_count > 0) {
      const updateQuery = `
        UPDATE scraped_videos SET
          user_ratings = $1,
          user_rating_count = $2,
          quality_rating = $3,
          helpfulness_rating = $4,
          accuracy_rating = $5,
          clarity_rating = $6,
          last_quality_update = CURRENT_TIMESTAMP
        WHERE video_id = $7
      `;

      await query(updateQuery, [
        Math.round(ratings.avg_user_rating * 100) / 100,
        parseInt(ratings.rating_count),
        ratings.avg_quality_rating ? Math.round(ratings.avg_quality_rating * 100) / 100 : null,
        ratings.avg_helpfulness_rating ? Math.round(ratings.avg_helpfulness_rating * 100) / 100 : null,
        ratings.avg_accuracy_rating ? Math.round(ratings.avg_accuracy_rating * 100) / 100 : null,
        ratings.avg_clarity_rating ? Math.round(ratings.avg_clarity_rating * 100) / 100 : null,
        videoId
      ]);
    }
  } catch (error) {
    console.error('❌ Error updating video ratings:', error);
  }
}

// Get feedback analytics
router.get('/analytics', async (req, res) => {
  try {
    const { tool, difficulty, date_from, date_to } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (tool) {
      paramCount++;
      whereClause += ` AND sv.tool = $${paramCount}`;
      params.push(tool);
    }

    if (difficulty) {
      paramCount++;
      whereClause += ` AND sv.difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    if (date_from) {
      paramCount++;
      whereClause += ` AND uf.created_at >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      whereClause += ` AND uf.created_at <= $${paramCount}`;
      params.push(date_to);
    }

    const analyticsQuery = `
      SELECT 
        COUNT(*) as total_feedback,
        AVG(uf.user_rating) as avg_rating,
        AVG(uf.quality_rating) as avg_quality,
        AVG(uf.helpfulness_rating) as avg_helpfulness,
        AVG(uf.accuracy_rating) as avg_accuracy,
        AVG(uf.clarity_rating) as avg_clarity,
        COUNT(CASE WHEN uf.user_rating >= 4 THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN uf.user_rating <= 2 THEN 1 END) as negative_feedback,
        COUNT(CASE WHEN uf.user_comment IS NOT NULL THEN 1 END) as feedback_with_comments
      FROM user_feedback uf
      LEFT JOIN scraped_videos sv ON uf.video_id = sv.video_id
      ${whereClause}
    `;

    const result = await query(analyticsQuery, params);
    const analytics = result.rows[0];

    // Calculate satisfaction rate
    const satisfactionRate = analytics.total_feedback > 0 ? 
      (analytics.positive_feedback / analytics.total_feedback * 100) : 0;

    res.json({
      success: true,
      analytics: {
        ...analytics,
        satisfaction_rate: Math.round(satisfactionRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('❌ Error fetching feedback analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback analytics'
    });
  }
});

// Get top-rated videos based on user feedback
router.get('/top-rated', async (req, res) => {
  try {
    const { tool, difficulty, limit = 10 } = req.query;

    let whereClause = 'WHERE sv.user_rating_count >= 3'; // Minimum 3 ratings
    const params = [];
    let paramCount = 0;

    if (tool) {
      paramCount++;
      whereClause += ` AND sv.tool = $${paramCount}`;
      params.push(tool);
    }

    if (difficulty) {
      paramCount++;
      whereClause += ` AND sv.difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    const topRatedQuery = `
      SELECT 
        sv.video_id, sv.title, sv.description, sv.thumbnail_url,
        sv.channel, sv.tool, sv.difficulty_level, sv.quality_score,
        sv.user_ratings, sv.user_rating_count, sv.quality_rating,
        sv.helpfulness_rating, sv.accuracy_rating, sv.clarity_rating
      FROM scraped_videos sv
      ${whereClause}
      ORDER BY sv.user_ratings DESC, sv.user_rating_count DESC, sv.quality_score DESC
      LIMIT $${paramCount + 1}
    `;

    params.push(parseInt(limit));
    const result = await query(topRatedQuery, params);

    res.json({
      success: true,
      top_rated_videos: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching top-rated videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top-rated videos'
    });
  }
});

// Report inappropriate feedback
router.post('/report', async (req, res) => {
  try {
    const { feedback_id, reason, reporter_session_id } = req.body;

    if (!feedback_id || !reason) {
      return res.status(400).json({
        success: false,
        error: 'feedback_id and reason are required'
      });
    }

    // In a real application, you would store this in a reports table
    // For now, we'll just log it
    console.log(`🚨 Feedback reported: ID ${feedback_id}, Reason: ${reason}, Reporter: ${reporter_session_id}`);

    res.json({
      success: true,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error reporting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report'
    });
  }
});

module.exports = router;
