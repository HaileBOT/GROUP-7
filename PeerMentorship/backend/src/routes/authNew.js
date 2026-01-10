const express = require('express');
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { authenticateToken, generateToken } = require('../middlewares/jwtAuth');
const logDebug = require('../utils/logger');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'mentee' } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate Addis Ababa University email
    if (!email.toLowerCase().endsWith('@aau.edu.et')) {
      return res.status(400).json({ 
        error: 'Please use your Addis Ababa University email address ending with @aau.edu.et' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUsers = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, approved, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, approved, created_at`,
      [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        role === 'mentee', // Auto-approve mentees, mentors need manual approval
        false // Email verification can be implemented later
      ]
    );

    const user = newUsers[0];

    // If user is a mentor, notify admins
    logDebug(`Registration success. Role: ${role}`);
    if (role === 'mentor') {
      logDebug('User is mentor, fetching admins...');
      const admins = await query("SELECT id FROM users WHERE role = 'admin'");
      logDebug(`Found ${admins.length} admins`);
      
      for (const admin of admins) {
        logDebug(`Notifying admin ${admin.id}`);
        try {
          await query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              admin.id,
              'admin_alert',
              'New Mentor Application',
              `${firstName} ${lastName} has applied to be a mentor.`,
              { mentorId: user.id }
            ]
          );
          logDebug('Notification inserted');
        } catch (err) {
          logDebug(`Notification failed: ${err.message}`);
        }
      }
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        approved: user.approved,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate Addis Ababa University email
    if (!email.toLowerCase().endsWith('@aau.edu.et')) {
      return res.status(400).json({ 
        error: 'Please use your Addis Ababa University email address ending with @aau.edu.et' 
      });
    }

    // Get user from database
    const users = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, approved, profile FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        approved: user.approved,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        uid: req.user.uid, // For compatibility
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        approved: req.user.approved,
        profile: req.user.profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, profile } = req.body;
    const userId = req.user.id;

    const updatedUsers = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           profile = COALESCE($3, profile),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, approved, profile`,
      [firstName, lastName, profile ? JSON.stringify(profile) : null, userId]
    );

    if (updatedUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = updatedUsers[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        approved: user.approved,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current password hash
    const users = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
});

module.exports = router;