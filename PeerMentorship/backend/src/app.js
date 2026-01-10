const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
// const authRoutes = require('./routes/auth'); // Legacy Firebase auth
const authNewRoutes = require('./routes/authNew'); // New JWT auth
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const questionRoutes = require('./routes/questions');
const sessionRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const matchingRoutes = require('./routes/matching'); // New matching system
const studentRoutes = require('./routes/students');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded from other origins
}));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000 // limit each IP to 1000 requests per windowMs
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authNewRoutes); // New JWT auth (primary)
// app.use('/api/auth/legacy', authRoutes); // Legacy Firebase auth (for migration)
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/matching', matchingRoutes); // New matching system
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Neon PostgreSQL',
    auth: 'JWT'
  });
});

// Database status check
app.get('/api/status', async (req, res) => {
  try {
    const { query } = require('./config/database');
    await query('SELECT 1 as test');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;