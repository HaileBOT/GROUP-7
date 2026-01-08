const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Get recommended mentors based on question tags
router.post('/mentors', authenticateToken, async (req, res) => {
  try {
    const { tags, courseId } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags are required for mentor matching' });
    }

    // Find mentors with matching skills
    const mentors = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.skills,
        u.bio,
        u.profile,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status = 'completed'
      WHERE u.role = 'mentor' 
        AND u.approved = true
        AND (
          u.skills && $1::text[] OR  -- Skills overlap with tags
          EXISTS (
            SELECT 1 FROM sessions s2 
            JOIN questions q ON s2.course_id = q.course_id 
            WHERE s2.mentor_id = u.id 
              AND q.tags && $1::text[]
          )
        )
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.skills, u.bio, u.profile, u.created_at
      ORDER BY 
        -- Prioritize by skill match count
        (SELECT COUNT(*) FROM unnest(u.skills) skill WHERE skill = ANY($1::text[])) DESC,
        average_rating DESC,
        total_sessions DESC
      LIMIT 10
    `, [tags]);

    // Calculate match scores
    const mentorsWithScores = mentors.map(mentor => {
      const skillMatches = mentor.skills ? mentor.skills.filter(skill => tags.includes(skill)).length : 0;
      const matchScore = Math.min(100, (skillMatches / tags.length) * 100);
      
      return {
        ...mentor,
        matchScore: Math.round(matchScore),
        skillMatches: skillMatches,
        averageRating: parseFloat(mentor.average_rating) || 0,
        totalRatings: parseInt(mentor.total_ratings) || 0,
        totalSessions: parseInt(mentor.total_sessions) || 0
      };
    });

    res.json({
      mentors: mentorsWithScores,
      matchingTags: tags,
      totalFound: mentorsWithScores.length
    });

  } catch (error) {
    console.error('Mentor matching error:', error);
    res.status(500).json({
      error: 'Failed to find matching mentors',
      message: error.message
    });
  }
});

// Get all available mentors (for general browsing)
router.get('/mentors/all', async (req, res) => {
  try {
    const { skills, sortBy = 'rating', limit = 20, offset = 0 } = req.query;

    let whereClause = 'WHERE u.role = \'mentor\' AND u.approved = true';
    let params = [];

    // Filter by skills if provided
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      whereClause += ' AND u.skills && $1::text[]';
      params.push(skillsArray);
    }

    // Determine sort order
    let orderBy = 'average_rating DESC, total_sessions DESC';
    if (sortBy === 'sessions') {
      orderBy = 'total_sessions DESC, average_rating DESC';
    } else if (sortBy === 'newest') {
      orderBy = 'u.created_at DESC';
    } else if (sortBy === 'name') {
      orderBy = 'u.first_name ASC, u.last_name ASC';
    }

    const mentors = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.skills,
        u.bio,
        u.profile,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status IN ('completed', 'active')
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.skills, u.bio, u.profile, u.created_at
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      ${whereClause}
    `, params);

    const mentorsFormatted = mentors.map(mentor => ({
      ...mentor,
      averageRating: parseFloat(mentor.average_rating) || 0,
      totalRatings: parseInt(mentor.total_ratings) || 0,
      totalSessions: parseInt(mentor.total_sessions) || 0,
      activeSessions: parseInt(mentor.active_sessions) || 0,
      isAvailable: parseInt(mentor.active_sessions) < 3 // Limit concurrent sessions
    }));

    res.json({
      mentors: mentorsFormatted,
      pagination: {
        total: parseInt(countResult[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult[0].total)
      }
    });

  } catch (error) {
    console.error('Get all mentors error:', error);
    res.status(500).json({
      error: 'Failed to get mentors',
      message: error.message
    });
  }
});

// Get mentor details by ID
router.get('/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mentors = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.skills,
        u.bio,
        u.profile,
        u.availability,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status IN ('completed', 'active')
      WHERE u.id = $1 AND u.role = 'mentor' AND u.approved = true
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.skills, u.bio, u.profile, u.availability, u.created_at
    `, [id]);

    if (mentors.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const mentor = mentors[0];

    // Get recent ratings with feedback
    const recentRatings = await query(`
      SELECT r.rating, r.feedback, r.created_at, u.first_name
      FROM ratings r
      JOIN users u ON r.mentee_id = u.id
      WHERE r.mentor_id = $1 AND r.feedback IS NOT NULL AND r.feedback != ''
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [id]);

    res.json({
      mentor: {
        ...mentor,
        averageRating: parseFloat(mentor.average_rating) || 0,
        totalRatings: parseInt(mentor.total_ratings) || 0,
        totalSessions: parseInt(mentor.total_sessions) || 0,
        activeSessions: parseInt(mentor.active_sessions) || 0,
        isAvailable: parseInt(mentor.active_sessions) < 3
      },
      recentRatings
    });

  } catch (error) {
    console.error('Get mentor details error:', error);
    res.status(500).json({
      error: 'Failed to get mentor details',
      message: error.message
    });
  }
});

// Update mentor profile (skills, bio, availability)
router.put('/mentors/profile', authenticateToken, async (req, res) => {
  try {
    const { skills, bio, availability } = req.body;
    const userId = req.user.id;

    // Verify user is a mentor
    const users = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0 || users[0].role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can update mentor profile' });
    }

    const updatedUsers = await query(`
      UPDATE users 
      SET 
        skills = COALESCE($1, skills),
        bio = COALESCE($2, bio),
        availability = COALESCE($3, availability),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, first_name, last_name, skills, bio, availability
    `, [
      skills || null,
      bio,
      availability ? JSON.stringify(availability) : null,
      userId
    ]);

    res.json({
      message: 'Mentor profile updated successfully',
      mentor: updatedUsers[0]
    });

  } catch (error) {
    console.error('Update mentor profile error:', error);
    res.status(500).json({
      error: 'Failed to update mentor profile',
      message: error.message
    });
  }
});

module.exports = router;