// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns 200 and sets session cookie if credentials are valid.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 4 }).withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const result = await req.db
        .request()
        .input('email', email)
        .query('SELECT id, senha_hash FROM funcionarios WHERE email = @email');
      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = result.recordset[0];
      const match = await bcrypt.compare(password, user.senha_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Store minimal user data in session
      req.session.userId = user.id;
      req.session.role = 'funcionario'; // could be extended
      return res.json({ message: 'Logged in' });
    } catch (err) {
      req.log.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out' });
  });
});

/**
 * GET /api/auth/me – check session status
 */
router.get('/me', (req, res) => {
  if (req.session.userId) {
    return res.json({ authenticated: true, userId: req.session.userId, role: req.session.role });
  }
  return res.json({ authenticated: false });
});

module.exports = router;
