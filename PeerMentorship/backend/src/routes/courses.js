const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/jwtAuth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await query(`
      SELECT id, name, department, description, tags, created_at, updated_at
      FROM courses
      ORDER BY name ASC
    `);

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      error: 'Failed to get courses',
      message: error.message
    });
  }
});

// Create new course (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, department, description, tags } = req.body;

    const courseData = await query(`
      INSERT INTO courses (name, department, description, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, department, description, tags, created_at, updated_at
    `, [name, department, description || '', tags || []]);

    res.status(201).json({
      message: 'Course created successfully',
      course: courseData[0]
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Failed to create course',
      message: error.message
    });
  }
});

// Update course (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, description, tags } = req.body;

    const updatedCourses = await query(`
      UPDATE courses 
      SET 
        name = COALESCE($1, name),
        department = COALESCE($2, department),
        description = COALESCE($3, description),
        tags = COALESCE($4, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, department, description, tags, id]);

    if (updatedCourses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ 
      message: 'Course updated successfully',
      course: updatedCourses[0]
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      error: 'Failed to update course',
      message: error.message
    });
  }
});

// Delete course (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCourses = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    
    if (deletedCourses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Failed to delete course',
      message: error.message
    });
  }
});

module.exports = router;