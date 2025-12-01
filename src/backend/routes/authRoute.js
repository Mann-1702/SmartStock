const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google callback - issue JWT and redirect to frontend with token
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:4200/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET || 'jwtsecret', { expiresIn: '1h' });
    // Redirect to frontend; frontend should capture token and store it (e.g., localStorage)
    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
  }
);

// Logout route: accept token and add to blacklist
router.get('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.query.token;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (token) {
      const decoded = jwt.decode(token);
      const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600 * 1000);
      await Token.create({ token, expiresAt });
    }
    // Redirect to login page on frontend
    res.redirect('http://localhost:4200/login');
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get logged-in user via token
router.get('/user', verifyToken, async (req, res) => {
  // If verifyToken passed, req.user is a full user document
  // Return safe user details for frontend
    const { _id, googleId, name, email, role, storeId } = req.user;
    // Provide a displayName fallback if name is missing (but prefer DB name)
    const finalDisplayName = (name && name.trim()) ? name : (displayName || (email ? email.split('@')[0] : 'User'));
    const response = { _id, googleId, name, displayName: finalDisplayName, email, role, storeId };
    console.log('[authRoute] /user response:', response);
    res.json(response);
});

module.exports = router;