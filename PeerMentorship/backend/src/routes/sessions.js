const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/jwtAuth');

const router = express.Router();

// Request a mentorship session
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { mentorId, courseId, description, preferredTime } = req.body;

    // Verify mentor exists and is approved
    const mentors = await query(
      'SELECT id, role, approved FROM users WHERE id = $1',
      [mentorId]
    );
    
    if (mentors.length === 0 || mentors[0].role !== 'mentor' || !mentors[0].approved) {
      return res.status(400).json({ error: 'Invalid or unapproved mentor' });
    }

    // Check if mentee already has an active session
    const activeSessions = await query(
      "SELECT id FROM sessions WHERE mentee_id = $1 AND status = 'active'",
      [req.user.uid]
    );

    if (activeSessions.length > 0) {
      return res.status(400).json({ error: 'You already have an active session. Please complete it before requesting a new one.' });
    }

    const sessionData = await query(`
      INSERT INTO sessions (mentee_id, mentor_id, course_id, description, preferred_time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, mentee_id, mentor_id, course_id, description, preferred_time, status, created_at, updated_at
    `, [
      req.user.uid,
      mentorId,
      courseId || null,
      description,
      preferredTime ? new Date(preferredTime) : null,
      'requested'
    ]);

    res.status(201).json({
      message: 'Session requested successfully',
      session: {
        id: sessionData[0].id,
        menteeId: sessionData[0].mentee_id,
        mentorId: sessionData[0].mentor_id,
        courseId: sessionData[0].course_id,
        description: sessionData[0].description,
        preferredTime: sessionData[0].preferred_time,
        status: sessionData[0].status,
        createdAt: sessionData[0].created_at,
        updatedAt: sessionData[0].updated_at
      }
    });
  } catch (error) {
    console.error('Request session error:', error);
    res.status(500).json({
      error: 'Failed to request session',
      message: error.message
    });
  }
});

// Accept a session request (mentor only)
router.post('/:id/accept', authenticateToken, requireRole(['mentor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledTime } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ error: 'Scheduled time is required' });
    }

    const sessions = await query('SELECT mentee_id, mentor_id, status FROM sessions WHERE id = $1', [id]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessions[0];
    
    // Only the assigned mentor can accept
    if (sessionData.mentor_id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to accept this session' });
    }

    if (sessionData.status !== 'requested') {
      return res.status(400).json({ error: 'Session is not in requested status' });
    }

    // Check if mentor already has an active session
    const mentorActiveSessions = await query(
      "SELECT id FROM sessions WHERE mentor_id = $1 AND status = 'active'",
      [req.user.uid]
    );

    if (mentorActiveSessions.length > 0) {
      return res.status(400).json({ error: 'You already have an active session. Please complete it before accepting a new one.' });
    }

    // Check if mentee already has an active session
    const menteeActiveSessions = await query(
      "SELECT id FROM sessions WHERE mentee_id = $1 AND status = 'active'",
      [sessionData.mentee_id]
    );

    if (menteeActiveSessions.length > 0) {
      return res.status(400).json({ error: 'The student already has an active session.' });
    }

    await query(`
      UPDATE sessions 
      SET status = 'active', 
          scheduled_time = $1, 
          started_at = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [new Date(scheduledTime), id]);

    // Create notification for mentee
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      sessionData.mentee_id,
      'Session Scheduled',
      `Your mentor has scheduled the session for ${new Date(scheduledTime).toLocaleString()}. Please be active at that time.`,
      'session_scheduled',
      id
    ]);

    res.json({ message: 'Session accepted and scheduled successfully' });
  } catch (error) {
    console.error('Accept session error:', error);
    res.status(500).json({
      error: 'Failed to accept session',
      message: error.message
    });
  }
});

// End a session
router.post('/:id/end', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;

    const sessions = await query(
      'SELECT mentee_id, mentor_id, status, started_at, course_id FROM sessions WHERE id = $1',
      [id]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessions[0];
    
    // Only mentee can end the session
    if (sessionData.mentee_id !== req.user.uid) {
      return res.status(403).json({ error: 'Only the student can end the session' });
    }

    if (sessionData.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // Calculate duration in minutes
    const duration = sessionData.started_at ? 
      Math.floor((new Date() - new Date(sessionData.started_at)) / 1000 / 60) : 0;

    // Update session
    await query(`
      UPDATE sessions 
      SET status = 'completed', 
          ended_at = CURRENT_TIMESTAMP,
          summary = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [summary || '', id]);

    // Create log entry
    await query(`
      INSERT INTO logs (session_id, mentee_id, mentor_id, course_id, duration, date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [
      id,
      sessionData.mentee_id,
      sessionData.mentor_id,
      sessionData.course_id,
      duration
    ]);

    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error.message
    });
  }
});

// Get active sessions for user
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const sessions = await query(`
      SELECT 
        s.id,
        s.mentee_id,
        s.mentor_id,
        s.course_id,
        s.description,
        s.preferred_time,
        s.scheduled_time,
        s.started_at,
        s.status,
        s.duration,
        s.created_at,
        s.updated_at,
        c.name as course_name,
        mentee.first_name as mentee_first_name,
        mentee.last_name as mentee_last_name,
        mentee.profile as mentee_profile,
        mentor.first_name as mentor_first_name,
        mentor.last_name as mentor_last_name,
        mentor.profile as mentor_profile
      FROM sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users mentee ON s.mentee_id = mentee.id
      LEFT JOIN users mentor ON s.mentor_id = mentor.id
      WHERE (s.mentee_id = $1 OR s.mentor_id = $1) AND s.status = 'active'
      ORDER BY s.started_at DESC
    `, [userId]);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      menteeId: session.mentee_id,
      mentorId: session.mentor_id,
      courseId: session.course_id,
      courseName: session.course_name,
      description: session.description,
      preferredTime: session.preferred_time,
      scheduledTime: session.scheduled_time,
      startedAt: session.started_at,
      status: session.status,
      duration: session.duration,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      userRole: session.mentee_id === userId ? 'mentee' : 'mentor',
      otherUser: session.mentee_id === userId ? 
        `${session.mentor_first_name} ${session.mentor_last_name}` :
        `${session.mentee_first_name} ${session.mentee_last_name}`,
      menteeProfile: session.mentee_profile,
      mentorProfile: session.mentor_profile,
      menteeName: `${session.mentee_first_name} ${session.mentee_last_name}`,
      mentorName: `${session.mentor_first_name} ${session.mentor_last_name}`
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      error: 'Failed to get active sessions',
      message: error.message
    });
  }
});

// Get session logs for user
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 10, offset = 0 } = req.query;
    
    const sessions = await query(`
      SELECT 
        s.id,
        s.mentee_id,
        s.mentor_id,
        s.course_id,
        s.description,
        s.started_at,
        s.ended_at,
        s.summary,
        s.status,
        s.created_at,
        c.name as course_name,
        mentee.first_name as mentee_first_name,
        mentee.last_name as mentee_last_name,
        mentor.first_name as mentor_first_name,
        mentor.last_name as mentor_last_name,
        l.duration
      FROM sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users mentee ON s.mentee_id = mentee.id
      LEFT JOIN users mentor ON s.mentor_id = mentor.id
      LEFT JOIN logs l ON s.id = l.session_id
      WHERE (s.mentee_id = $1 OR s.mentor_id = $1) AND s.status = 'completed'
      ORDER BY s.ended_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      menteeId: session.mentee_id,
      mentorId: session.mentor_id,
      courseId: session.course_id,
      courseName: session.course_name,
      description: session.description,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      summary: session.summary,
      status: session.status,
      createdAt: session.created_at,
      duration: session.duration,
      userRole: session.mentee_id === userId ? 'mentee' : 'mentor',
      otherUser: session.mentee_id === userId ? 
        `${session.mentor_first_name} ${session.mentor_last_name}` :
        `${session.mentee_first_name} ${session.mentee_last_name}`
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Get session logs error:', error);
    res.status(500).json({
      error: 'Failed to get session logs',
      message: error.message
    });
  }
});

// Get pending session requests for mentor
router.get('/pending', authenticateToken, requireRole(['mentor']), async (req, res) => {
  try {
    const mentorId = req.user.uid;
    
    const sessions = await query(`
      SELECT 
        s.id,
        s.mentee_id,
        s.course_id,
        s.description,
        s.preferred_time,
        s.status,
        s.created_at,
        c.name as course_name,
        mentee.first_name as mentee_first_name,
        mentee.last_name as mentee_last_name
      FROM sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users mentee ON s.mentee_id = mentee.id
      WHERE s.mentor_id = $1 AND s.status = 'requested'
      ORDER BY s.created_at DESC
    `, [mentorId]);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      menteeId: session.mentee_id,
      courseId: session.course_id,
      courseName: session.course_name,
      description: session.description,
      preferredTime: session.preferred_time,
      status: session.status,
      createdAt: session.created_at,
      menteeName: `${session.mentee_first_name} ${session.mentee_last_name}`
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Get pending sessions error:', error);
    res.status(500).json({
      error: 'Failed to get pending sessions',
      message: error.message
    });
  }
});

module.exports = router;