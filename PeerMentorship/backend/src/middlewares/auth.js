const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user role from Firestore
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.userRole = userRole;
      req.userData = userData;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = { authenticateToken, requireRole };