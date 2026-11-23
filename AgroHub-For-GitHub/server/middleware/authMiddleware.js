const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes:
 * Verifies JWT token from 'Authorization: Bearer <token>' header
 * Attaches the authenticated user object to req.user (excluding password)
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header format "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrohub_development_secret_key_2026');

      // Fetch user from database and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'User belonging to this token no longer exists.',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized: Invalid or expired token.',
      });
    }
  } else {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized: No token provided in Authorization header.',
    });
  }
};

/**
 * Role-based authorization middleware:
 * Ensures only users with the 'farmer' role can proceed
 */
const farmerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next();
  } else {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied: This action is restricted to registered Farmers only.',
    });
  }
};

/**
 * Role-based authorization middleware:
 * Ensures only users with the 'admin' role can proceed
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied: Administrator privileges required.',
    });
  }
};

module.exports = { protect, farmerOnly, adminOnly };
