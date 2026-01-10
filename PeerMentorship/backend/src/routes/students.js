const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, search } = req.query;

    let whereClause = "WHERE u.role = 'mentee'";
    let params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (
        u.first_name ILIKE $${paramCount} OR 
        u.last_name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const students = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.profile,
        u.created_at,
        COUNT(DISTINCT s.id) as total_sessions
      FROM users u
      LEFT JOIN sessions s ON u.id = s.mentee_id
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...params, limit, offset]);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `, params);

    res.json({
      students,
      pagination: {
        total: parseInt(countResult[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult[0].total)
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      error: 'Failed to get students',
      message: error.message
    });
  }
});

module.exports = router;
