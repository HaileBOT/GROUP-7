const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Get recommended mentors based on question tags
router.post('/mentors', authenticateToken, async (req, res) => {
  try {
    const { tags, courseId } = req.body;

    // If courseId is provided, prioritize mentors who teach that course
    let whereClause = "WHERE u.role = 'mentor' AND u.approved = true";
    let params = [];
    
    if (courseId) {
      whereClause += ` AND (u.profile->'courses')::jsonb ? $1`;
      params.push(courseId);
    }

    const mentors = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.profile,
        u.bio,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status = 'completed'
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile, u.bio, u.created_at
      ORDER BY average_rating DESC, total_sessions DESC
      LIMIT 10
    `, params);

    const mentorsFormatted = mentors.map(mentor => ({
      ...mentor,
      averageRating: parseFloat(mentor.average_rating) || 0,
      totalRatings: parseInt(mentor.total_ratings) || 0,
      totalSessions: parseInt(mentor.total_sessions) || 0
    }));

    res.json({
      mentors: mentorsFormatted,
      matchingTags: tags || [],
      totalFound: mentorsFormatted.length
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
    const { courses, sortBy = 'rating', limit = 20, offset = 0 } = req.query;

    let whereClause = 'WHERE u.role = \'mentor\' AND u.approved = true';
    let params = [];

    // Filter by courses if provided
    if (courses) {
      const coursesArray = Array.isArray(courses) ? courses : courses.split(',');
      whereClause += ` AND (u.profile->'courses')::jsonb ?| $${params.length + 1}`;
      params.push(coursesArray);
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
        u.profile,
        u.bio,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status IN ('completed', 'active')
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile, u.bio, u.created_at
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
      isAvailable: parseInt(mentor.active_sessions) < 3
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
        u.profile,
        u.bio,
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_sessions
      FROM users u
      LEFT JOIN ratings r ON u.id = r.mentor_id
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status IN ('completed', 'active')
      WHERE u.id = $1 AND u.role = 'mentor' AND u.approved = true
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile, u.bio, u.created_at
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

module.exports = router;
