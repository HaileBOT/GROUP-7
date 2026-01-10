const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get counts
    const mentorCount = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['mentor']);
    const menteeCount = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['mentee']);
    const pendingCount = await query('SELECT COUNT(*) FROM users WHERE role = $1 AND approved = $2', ['mentor', false]);
    const sessionCount = await query('SELECT COUNT(*) FROM sessions');

    res.json({
      mentors: parseInt(mentorCount[0].count),
      mentees: parseInt(menteeCount[0].count),
      pendingMentors: parseInt(pendingCount[0].count),
      sessions: parseInt(sessionCount[0].count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get pending mentor applications
router.get('/mentors/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingMentors = await query(
      `SELECT id, first_name, last_name, email, profile, created_at 
       FROM users 
       WHERE role = $1 AND approved = $2 
       ORDER BY created_at DESC`,
      ['mentor', false]
    );
    res.json(pendingMentors);
  } catch (error) {
    console.error('Pending mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch pending mentors' });
  }
});

// Approve/Reject mentor
router.post('/mentors/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false

    // Check if user exists and is a mentor
    const user = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user[0].role !== 'mentor') {
      return res.status(400).json({ error: 'User is not a mentor' });
    }

    if (approved) {
      await query(
        'UPDATE users SET approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      res.json({ message: 'Mentor approved successfully' });
    } else {
      // If rejected, delete the user so they are removed from the pending list
      await query('DELETE FROM users WHERE id = $1', [id]);
      res.json({ message: 'Mentor rejected and removed' });
    }

  } catch (error) {
    console.error('Approve mentor error:', error);
    res.status(500).json({ error: 'Failed to update mentor status' });
  }
});

module.exports = router;
