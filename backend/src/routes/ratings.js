const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Helper function to update mentor rating stats
const updateMentorRatingStats = async (mentorId) => {
  try {
    const ratingsResult = await query(
      'SELECT rating FROM ratings WHERE mentor_id = $1',
      [mentorId]
    );

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let totalRatings = ratingsResult.length;

    ratingsResult.forEach(row => {
      const rating = row.rating;
      ratingCounts[rating]++;
      totalRating += rating;
    });

    const averageRating = totalRatings > 0 ? parseFloat((totalRating / totalRatings).toFixed(1)) : 0;

    // Update mentor's profile with new stats
    await query(`
      UPDATE users 
      SET profile = COALESCE(profile, '{}') || $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [
      JSON.stringify({
        averageRating,
        totalRatings,
        ratingDistribution: ratingCounts
      }),
      mentorId
    ]);

    return { averageRating, totalRatings, ratingDistribution: ratingCounts };
  } catch (error) {
    console.error('Error updating mentor rating stats:', error);
    throw error;
  }
};

// Submit a rating
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sessionId, mentorId, rating, feedback } = req.body;

    // Verify session exists and user was the mentee
    const sessionResult = await query(
      'SELECT mentee_id, mentor_id, status FROM sessions WHERE id = $1',
      [sessionId]
    );
    
    if (sessionResult.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessionResult[0];
    
    if (sessionData.mentee_id !== req.user.uid) {
      return res.status(403).json({ error: 'Only mentees can rate sessions' });
    }

    if (sessionData.status !== 'completed') {
      return res.status(400).json({ error: 'Session must be completed to rate' });
    }

    if (sessionData.mentor_id !== mentorId) {
      return res.status(400).json({ error: 'Mentor ID does not match session' });
    }

    // Check if rating already exists
    const existingRatingResult = await query(
      'SELECT id FROM ratings WHERE session_id = $1 AND mentee_id = $2',
      [sessionId, req.user.uid]
    );

    if (existingRatingResult.length > 0) {
      return res.status(400).json({ error: 'Rating already submitted for this session' });
    }

    // Insert the rating
    const ratingResult = await query(`
      INSERT INTO ratings (session_id, mentee_id, mentor_id, rating, feedback)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, session_id, mentee_id, mentor_id, rating, feedback, created_at
    `, [
      sessionId,
      req.user.uid,
      mentorId,
      Math.max(1, Math.min(5, parseInt(rating))), // Ensure rating is between 1-5
      feedback || ''
    ]);

    const newRating = ratingResult[0];

    // Auto-update mentor's average rating and stats
    const updatedStats = await updateMentorRatingStats(mentorId);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('mentor-rating-updated', {
        mentorId,
        newRating: updatedStats.averageRating,
        totalRatings: updatedStats.totalRatings,
        ratingDistribution: updatedStats.ratingDistribution
      });
    }

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: {
        id: newRating.id,
        sessionId: newRating.session_id,
        menteeId: newRating.mentee_id,
        mentorId: newRating.mentor_id,
        rating: newRating.rating,
        feedback: newRating.feedback,
        createdAt: newRating.created_at
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      error: 'Failed to submit rating',
      message: error.message
    });
  }
});

// Get ratings for a mentor
router.get('/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Verify mentor exists
    const mentorResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [mentorId]
    );
    
    if (mentorResult.length === 0 || mentorResult[0].role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const ratingsResult = await query(`
      SELECT 
        r.id,
        r.session_id,
        r.mentee_id,
        r.mentor_id,
        r.rating,
        r.feedback,
        r.created_at,
        u.first_name,
        u.last_name
      FROM ratings r
      JOIN users u ON r.mentee_id = u.id
      WHERE r.mentor_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [mentorId, parseInt(limit), parseInt(offset)]);

    const ratings = ratingsResult.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      menteeId: row.mentee_id,
      mentorId: row.mentor_id,
      rating: row.rating,
      feedback: row.feedback,
      createdAt: row.created_at,
      menteeFirstName: row.first_name,
      menteeLastName: row.last_name
    }));

    // Calculate average rating
    let totalRating = 0;
    ratings.forEach(rating => {
      totalRating += rating.rating;
    });
    const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : 0;

    // Get total count of ratings
    const totalCountResult = await query(
      'SELECT COUNT(*) as count FROM ratings WHERE mentor_id = $1',
      [mentorId]
    );

    res.json({
      ratings,
      averageRating: parseFloat(averageRating),
      totalRatings: parseInt(totalCountResult[0].count),
      hasMore: ratingsResult.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      error: 'Failed to get ratings',
      message: error.message
    });
  }
});

// Get rating statistics for a mentor
router.get('/:mentorId/stats', async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Verify mentor exists
    const mentorResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [mentorId]
    );
    
    if (mentorResult.length === 0 || mentorResult[0].role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const ratingsResult = await query(
      'SELECT rating FROM ratings WHERE mentor_id = $1',
      [mentorId]
    );

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    ratingsResult.forEach(row => {
      const rating = row.rating;
      ratingCounts[rating]++;
      totalRating += rating;
    });

    const totalRatings = ratingsResult.length;
    const averageRating = totalRatings > 0 ? (totalRating / totalRatings).toFixed(1) : 0;

    res.json({
      averageRating: parseFloat(averageRating),
      totalRatings,
      ratingDistribution: ratingCounts
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({
      error: 'Failed to get rating statistics',
      message: error.message
    });
  }
});

module.exports = router;