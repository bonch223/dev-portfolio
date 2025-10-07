const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get all learning paths for a specific tool and difficulty
router.get('/paths', async (req, res) => {
  try {
    const { tool, difficulty } = req.query;
    
    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    if (tool) {
      paramCount++;
      whereClause += ` AND tool = $${paramCount}`;
      params.push(tool);
    }

    if (difficulty) {
      paramCount++;
      whereClause += ` AND difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    const pathsQuery = `
      SELECT 
        id, path_name, tool, difficulty_level, description,
        estimated_duration, video_order, prerequisites, learning_objectives,
        target_audience, industry_focus, skill_level_required, completion_criteria,
        certification_available, created_at, updated_at, user_rating, completion_count
      FROM learning_paths 
      ${whereClause}
      ORDER BY user_rating DESC, completion_count DESC
    `;

    const result = await query(pathsQuery, params);
    
    res.json({
      success: true,
      paths: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching learning paths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning paths'
    });
  }
});

// Get a specific learning path with video details
router.get('/paths/:pathId', async (req, res) => {
  try {
    const { pathId } = req.params;
    
    // Get path details
    const pathQuery = `
      SELECT * FROM learning_paths WHERE id = $1 AND is_active = true
    `;
    const pathResult = await query(pathQuery, [pathId]);
    
    if (pathResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }

    const path = pathResult.rows[0];
    
    // Get videos in the path
    let videos = [];
    if (path.video_order && path.video_order.length > 0) {
      const videosQuery = `
        SELECT 
          video_id, title, description, view_count, duration, channel,
          thumbnail_url, video_url, published_at, tool, difficulty,
          quality_score, usefulness_score, engagement_score, authority_score,
          tutorial_type, use_case, industry, complexity_level,
          estimated_learning_time, learning_objectives, prerequisites, key_topics
        FROM scraped_videos 
        WHERE video_id = ANY($1)
        ORDER BY array_position($1, video_id)
      `;
      
      const videosResult = await query(videosQuery, [path.video_order]);
      videos = videosResult.rows;
    }

    // Get related videos (videos that could be prerequisites or next steps)
    const relatedVideosQuery = `
      SELECT DISTINCT
        v.video_id, v.title, v.description, v.view_count, v.duration, v.channel,
        v.thumbnail_url, v.video_url, v.tool, v.difficulty,
        v.quality_score, v.tutorial_type, v.use_case, v.industry
      FROM scraped_videos v
      WHERE v.tool = $1 AND v.difficulty = $2 AND v.quality_score >= 60
      AND v.video_id != ALL($3)
      ORDER BY v.quality_score DESC, v.view_count DESC
      LIMIT 10
    `;
    
    const relatedResult = await query(relatedVideosQuery, [
      path.tool, 
      path.difficulty_level, 
      path.video_order || []
    ]);
    
    res.json({
      success: true,
      path: {
        ...path,
        videos: videos,
        related_videos: relatedResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning path'
    });
  }
});

// Create a new learning path
router.post('/paths', async (req, res) => {
  try {
    const {
      path_name, tool, difficulty_level, description, estimated_duration,
      video_order, prerequisites, learning_objectives, target_audience,
      industry_focus, skill_level_required, completion_criteria,
      certification_available
    } = req.body;

    const insertQuery = `
      INSERT INTO learning_paths (
        path_name, tool, difficulty_level, description, estimated_duration,
        video_order, prerequisites, learning_objectives, target_audience,
        industry_focus, skill_level_required, completion_criteria,
        certification_available
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const values = [
      path_name, tool, difficulty_level, description, estimated_duration,
      video_order, prerequisites, learning_objectives, target_audience,
      industry_focus, skill_level_required, completion_criteria,
      certification_available || false
    ];

    const result = await query(insertQuery, values);
    
    res.status(201).json({
      success: true,
      path: result.rows[0],
      message: 'Learning path created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating learning path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create learning path'
    });
  }
});

// Update a learning path
router.put('/paths/:pathId', async (req, res) => {
  try {
    const { pathId } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    paramCount++;
    values.push(pathId);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE learning_paths 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }

    res.json({
      success: true,
      path: result.rows[0],
      message: 'Learning path updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating learning path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update learning path'
    });
  }
});

// Get video relationships
router.get('/relationships/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { relationship_type } = req.query;
    
    let whereClause = 'WHERE (source_video_id = $1 OR target_video_id = $1)';
    const params = [videoId];
    let paramCount = 1;

    if (relationship_type) {
      paramCount++;
      whereClause += ` AND relationship_type = $${paramCount}`;
      params.push(relationship_type);
    }

    const relationshipsQuery = `
      SELECT 
        vr.*,
        CASE 
          WHEN vr.source_video_id = $1 THEN sv.title
          ELSE tv.title
        END as related_video_title,
        CASE 
          WHEN vr.source_video_id = $1 THEN sv.thumbnail_url
          ELSE tv.thumbnail_url
        END as related_video_thumbnail,
        CASE 
          WHEN vr.source_video_id = $1 THEN sv.video_url
          ELSE tv.video_url
        END as related_video_url,
        CASE 
          WHEN vr.source_video_id = $1 THEN sv.quality_score
          ELSE tv.quality_score
        END as related_video_quality
      FROM video_relationships vr
      LEFT JOIN scraped_videos sv ON vr.source_video_id = sv.video_id
      LEFT JOIN scraped_videos tv ON vr.target_video_id = tv.video_id
      ${whereClause}
      ORDER BY vr.strength DESC, vr.confidence DESC
    `;

    const result = await query(relationshipsQuery, params);
    
    res.json({
      success: true,
      relationships: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching video relationships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video relationships'
    });
  }
});

// Create video relationship
router.post('/relationships', async (req, res) => {
  try {
    const {
      source_video_id, target_video_id, relationship_type,
      strength, confidence, relationship_reason
    } = req.body;

    const insertQuery = `
      INSERT INTO video_relationships (
        source_video_id, target_video_id, relationship_type,
        strength, confidence, relationship_reason
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (source_video_id, target_video_id, relationship_type)
      DO UPDATE SET
        strength = EXCLUDED.strength,
        confidence = EXCLUDED.confidence,
        relationship_reason = EXCLUDED.relationship_reason,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      source_video_id, target_video_id, relationship_type,
      strength || 1.0, confidence || 1.0, relationship_reason
    ];

    const result = await query(insertQuery, values);
    
    res.status(201).json({
      success: true,
      relationship: result.rows[0],
      message: 'Video relationship created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating video relationship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create video relationship'
    });
  }
});

// Auto-generate learning paths based on video relationships and quality scores
router.post('/generate-paths', async (req, res) => {
  try {
    const { tool, difficulty_level, max_paths = 3 } = req.body;
    
    // Get high-quality videos for the tool and difficulty
    const videosQuery = `
      SELECT 
        video_id, title, description, quality_score, view_count,
        tutorial_type, use_case, industry, complexity_level,
        prerequisites, learning_objectives, key_topics
      FROM scraped_videos 
      WHERE tool = $1 AND difficulty_level = $2 AND quality_score >= 70
      ORDER BY quality_score DESC, view_count DESC
      LIMIT 50
    `;

    const videosResult = await query(videosQuery, [tool, difficulty_level]);
    const videos = videosResult.rows;

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No high-quality videos found for the specified criteria'
      });
    }

    const generatedPaths = [];

    // Generate learning paths based on different strategies
    for (let i = 0; i < Math.min(max_paths, 3); i++) {
      let pathVideos = [];
      let pathName = '';
      let description = '';

      switch (i) {
        case 0:
          // Quality-based path (highest quality videos)
          pathVideos = videos.slice(0, 8).map(v => v.video_id);
          pathName = `${tool.charAt(0).toUpperCase() + tool.slice(1)} ${difficulty_level} - Top Quality Videos`;
          description = `A curated collection of the highest quality ${difficulty_level} videos for ${tool}.`;
          break;
          
        case 1:
          // Tutorial type-based path (step-by-step tutorials)
          pathVideos = videos
            .filter(v => v.tutorial_type === 'step-by-step')
            .slice(0, 6)
            .map(v => v.video_id);
          pathName = `${tool.charAt(0).toUpperCase() + tool.slice(1)} ${difficulty_level} - Step-by-Step Tutorials`;
          description = `Hands-on step-by-step tutorials to master ${tool} at ${difficulty_level} level.`;
          break;
          
        case 2:
          // Use case-based path (business applications)
          pathVideos = videos
            .filter(v => v.use_case === 'business')
            .slice(0, 6)
            .map(v => v.video_id);
          pathName = `${tool.charAt(0).toUpperCase() + tool.slice(1)} ${difficulty_level} - Business Applications`;
          description = `Real-world business applications and use cases for ${tool} automation.`;
          break;
      }

      if (pathVideos.length >= 3) {
        // Calculate estimated duration
        const durationQuery = `
          SELECT SUM(duration) as total_duration 
          FROM scraped_videos 
          WHERE video_id = ANY($1)
        `;
        const durationResult = await query(durationQuery, [pathVideos]);
        const estimatedDuration = Math.ceil((durationResult.rows[0].total_duration || 0) / 60);

        // Extract common learning objectives
        const learningObjectives = videos
          .filter(v => pathVideos.includes(v.video_id))
          .flatMap(v => v.learning_objectives || [])
          .filter((obj, index, arr) => arr.indexOf(obj) === index)
          .slice(0, 5);

        // Extract prerequisites
        const prerequisites = videos
          .filter(v => pathVideos.includes(v.video_id))
          .flatMap(v => v.prerequisites || [])
          .filter((prereq, index, arr) => arr.indexOf(prereq) === index)
          .slice(0, 3);

        const pathData = {
          path_name: pathName,
          tool: tool,
          difficulty_level: difficulty_level,
          description: description,
          estimated_duration: estimatedDuration,
          video_order: pathVideos,
          prerequisites: prerequisites,
          learning_objectives: learningObjectives,
          target_audience: difficulty_level === 'beginner' ? 'Beginners' : 
                         difficulty_level === 'intermediate' ? 'Intermediate users' : 'Advanced users',
          industry_focus: 'General',
          skill_level_required: difficulty_level,
          completion_criteria: [
            'Complete all videos in sequence',
            'Practice with provided examples',
            'Build at least one automation'
          ],
          certification_available: false
        };

        // Save the generated path
        const insertPathQuery = `
          INSERT INTO learning_paths (
            path_name, tool, difficulty_level, description, estimated_duration,
            video_order, prerequisites, learning_objectives, target_audience,
            industry_focus, skill_level_required, completion_criteria,
            certification_available
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
          ON CONFLICT (path_name, tool, difficulty_level) DO UPDATE SET
            video_order = EXCLUDED.video_order,
            estimated_duration = EXCLUDED.estimated_duration,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const pathValues = [
          pathData.path_name, pathData.tool, pathData.difficulty_level,
          pathData.description, pathData.estimated_duration, pathData.video_order,
          pathData.prerequisites, pathData.learning_objectives, pathData.target_audience,
          pathData.industry_focus, pathData.skill_level_required, pathData.completion_criteria,
          pathData.certification_available
        ];

        const pathResult = await query(insertPathQuery, pathValues);
        generatedPaths.push(pathResult.rows[0]);
      }
    }

    res.json({
      success: true,
      generated_paths: generatedPaths,
      count: generatedPaths.length,
      message: `Generated ${generatedPaths.length} learning paths for ${tool} ${difficulty_level}`
    });

  } catch (error) {
    console.error('❌ Error generating learning paths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate learning paths'
    });
  }
});

// Get recommended next videos based on current video
router.get('/recommendations/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 5 } = req.query;

    // Get current video details
    const currentVideoQuery = `
      SELECT * FROM scraped_videos WHERE video_id = $1
    `;
    const currentVideoResult = await query(currentVideoQuery, [videoId]);
    
    if (currentVideoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const currentVideo = currentVideoResult.rows[0];

    // Get recommendations based on multiple criteria
    const recommendationsQuery = `
      SELECT 
        v.*,
        CASE 
          WHEN v.tool = $2 AND v.difficulty_level = $3 THEN 100
          WHEN v.tool = $2 THEN 80
          WHEN v.difficulty_level = $3 THEN 60
          ELSE 40
        END as relevance_score
      FROM scraped_videos v
      WHERE v.video_id != $1 
      AND v.quality_score >= 60
      AND (
        v.tool = $2 OR 
        v.difficulty_level = $3 OR
        v.tutorial_type = $4 OR
        v.use_case = $5 OR
        v.industry = $6
      )
      ORDER BY relevance_score DESC, v.quality_score DESC, v.view_count DESC
      LIMIT $7
    `;

    const recommendationsResult = await query(recommendationsQuery, [
      videoId,
      currentVideo.tool,
      currentVideo.difficulty_level,
      currentVideo.tutorial_type,
      currentVideo.use_case,
      currentVideo.industry,
      parseInt(limit)
    ]);

    res.json({
      success: true,
      current_video: currentVideo,
      recommendations: recommendationsResult.rows,
      count: recommendationsResult.rows.length
    });

  } catch (error) {
    console.error('❌ Error getting video recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get video recommendations'
    });
  }
});

module.exports = router;
