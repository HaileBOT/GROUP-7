const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import database and initialization
const { initializeDatabase } = require('./src/config/database');
const { initializeDatabase: initSchema } = require('./src/utils/initDatabase');

const app = require('./src/app');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    socket.to(data.sessionId).emit('receive-message', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.sessionId).emit('user-typing', data);
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.sessionId).emit('user-stop-typing', data);
  });

  // Emit rating update to all connected clients
  socket.on('rating-submitted', (data) => {
    socket.broadcast.emit('mentor-rating-updated', {
      mentorId: data.mentorId,
      newRating: data.newRating,
      totalRatings: data.totalRatings
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Peer Mentorship Platform...');
    
    // Initialize database connection
    console.log('📊 Connecting to Neon PostgreSQL...');
    await initializeDatabase();
    
    // Initialize database schema
    console.log('🔧 Setting up database schema...');
    await initSchema();

    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      console.log('✅ Server running successfully!');
      console.log(`🌐 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`📊 Database: Neon PostgreSQL`);
      console.log(`🔐 Auth: JWT`);
    });

    process.on('exit', (code) => {
      console.log(`Process exiting with code: ${code}`);
    });
    
    process.on('SIGINT', () => {
      console.log('Received SIGINT. Exiting...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();