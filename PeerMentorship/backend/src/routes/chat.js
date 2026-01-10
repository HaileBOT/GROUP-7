const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middlewares/jwtAuth');

const router = express.Router();

// Send a message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    // Verify user is part of the session
    const sessions = await query(
      'SELECT mentee_id, mentor_id, status FROM sessions WHERE id = $1',
      [sessionId]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessions[0];
    
    if (sessionData.mentee_id !== req.user.uid && sessionData.mentor_id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to send message in this session' });
    }

    if (sessionData.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    const messageData = await query(`
      INSERT INTO messages (session_id, sender_id, text)
      VALUES ($1, $2, $3)
      RETURNING id, session_id, sender_id, text, timestamp, created_at
    `, [sessionId, req.user.uid, text]);

    const message = messageData[0];

    // Emit message to session room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(sessionId).emit('receive-message', {
        id: message.id,
        sessionId: message.session_id,
        senderId: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        createdAt: message.created_at
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: {
        id: message.id,
        sessionId: message.session_id,
        senderId: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        createdAt: message.created_at
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Get messages for a session
router.get('/messages/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is part of the session
    const sessions = await query(
      'SELECT mentee_id, mentor_id FROM sessions WHERE id = $1',
      [sessionId]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessions[0];
    
    if (sessionData.mentee_id !== req.user.uid && sessionData.mentor_id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to view messages in this session' });
    }

    let queryText = `
      SELECT 
        m.id,
        m.session_id,
        m.sender_id,
        m.text,
        m.timestamp,
        m.created_at,
        u.first_name,
        u.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.session_id = $1
    `;
    let params = [sessionId];

    if (before) {
      queryText += ' AND m.timestamp < $2';
      params.push(new Date(before));
    }

    queryText += ` ORDER BY m.timestamp DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const messages = await query(queryText, params);

    // Reverse to get chronological order
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      senderId: msg.sender_id,
      text: msg.text,
      timestamp: msg.timestamp,
      createdAt: msg.created_at,
      senderFirstName: msg.first_name,
      senderLastName: msg.last_name
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to get messages',
      message: error.message
    });
  }
});

// Mark messages as read
router.post('/messages/:sessionId/read', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify user is part of the session
    const sessions = await query(
      'SELECT mentee_id, mentor_id FROM sessions WHERE id = $1',
      [sessionId]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessions[0];
    
    if (sessionData.mentee_id !== req.user.uid && sessionData.mentor_id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // For now, just return success - read receipts can be implemented later
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: error.message
    });
  }
});

module.exports = router;