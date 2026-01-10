const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/jwtAuth');

const router = express.Router();

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: user-id-timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload profile photo
router.post('/:id/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  console.log('Upload request received for user:', req.params.id);
  try {
    const { id } = req.params;
    
    if (req.user.uid !== id && req.user.role !== 'admin') {
      console.log('Unauthorized upload attempt');
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);
    console.log('File saved locally at:', req.file.path);

    // Construct public URL
    // Assuming server runs on port 5001 or configured API URL
    const baseUrl = process.env.API_URL || 'http://localhost:5001';
    const photoURL = `${baseUrl}/uploads/${req.file.filename}`;
    console.log('Photo URL:', photoURL);

    // Update user profile in DB
    const userResult = await query('SELECT profile FROM users WHERE id = $1', [id]);
    const currentProfile = userResult[0]?.profile || {};
    
    const newProfile = {
      ...currentProfile,
      photoURL: photoURL
    };

    await query('UPDATE users SET profile = $1 WHERE id = $2', [newProfile, id]);
    console.log('Database updated.');

    res.json({ photoURL });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({
      error: 'Failed to upload photo',
      message: error.message
    });
  }
});

// Delete profile photo
router.delete('/:id/photo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    // Get current profile to find the file path
    const userResult = await query('SELECT profile FROM users WHERE id = $1', [id]);
    const currentProfile = userResult[0]?.profile || {};
    
    if (currentProfile.photoURL) {
      // Try to extract filename from URL and delete file
      try {
        const filename = currentProfile.photoURL.split('/').pop();
        if (filename) {
          const filePath = path.join(__dirname, '../../uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted local file:', filePath);
          }
        }
      } catch (err) {
        console.warn('Error deleting local file:', err);
        // Continue even if file deletion fails
      }
    }

    const newProfile = {
      ...currentProfile,
      photoURL: null
    };

    await query('UPDATE users SET profile = $1 WHERE id = $2', [newProfile, id]);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      error: 'Failed to delete photo',
      message: error.message
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(
      'SELECT id, first_name, last_name, role, approved, profile FROM users WHERE id = $1',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      approved: user.approved,
      profile: user.profile || {}
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, profile } = req.body;
    
    // Users can only update their own profile or admins can update any
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    await query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          profile = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [firstName, lastName, profile, id]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const { course, tag } = req.query;
    
    let sql = `
      SELECT id, first_name, last_name, role, approved, profile 
      FROM users 
      WHERE role = 'mentor' AND approved = true
    `;
    const params = [];

    // Note: Complex filtering on JSONB arrays in SQL can be tricky.
    // For simplicity, we'll fetch all mentors and filter in memory if needed,
    // or use basic JSONB operators.
    
    const mentors = await query(sql, params);
    
    const formattedMentors = mentors.map(m => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      role: m.role,
      approved: m.approved,
      profile: m.profile || {}
    }));

    // Filter in memory for now to support the existing API behavior
    const filteredMentors = formattedMentors.filter(mentor => {
      if (course && !mentor.profile.courses?.includes(course)) return false;
      if (tag && !mentor.profile.skills?.includes(tag)) return false;
      return true;
    });

    res.json(filteredMentors);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      error: 'Failed to get mentors',
      message: error.message
    });
  }
});

// Apply to become a mentor
router.post('/mentors/apply', authenticateToken, async (req, res) => {
  try {
    const { skills, courses, bio, availability } = req.body;

    const newProfile = {
      skills: skills || [],
      courses: courses || [],
      bio: bio || '',
      availability: availability || []
    };

    // We need to merge with existing profile to not lose other data if any
    // But for application, we might want to set these specific fields.
    
    await query(`
      UPDATE users 
      SET role = 'mentor',
          approved = false,
          profile = profile || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(newProfile), req.user.uid]);

    res.json({ message: 'Mentor application submitted successfully' });
  } catch (error) {
    console.error('Mentor application error:', error);
    res.status(500).json({
      error: 'Failed to submit mentor application',
      message: error.message
    });
  }
});

module.exports = router;