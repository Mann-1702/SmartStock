const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//Handle Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:4200/login', session: true }),
  (req, res) => {
    // Redirect to Angular dashboard after successful login
    res.redirect(`http://localhost:4200/dashboard?user=${req.user._id}`);
  }
);

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('http://localhost:4200/login');
  });
});

// Get logged-in user
router.get('/user', (req, res) => {
  if (req.user) res.send(req.user);
  else res.status(401).send({ error: 'Not logged in' });
});

module.exports = router;