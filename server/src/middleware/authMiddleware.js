// src/middleware/authMiddleware.js
/**
 * Middleware to protect routes that require authentication.
 * It checks for a valid session (req.session.userId).
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
}

module.exports = { isAuthenticated };
