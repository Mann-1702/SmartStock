const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    res.redirect(`http://localhost:4200/dashboard?user=${req.user._id}`);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

router.get('/user', (req, res) => {
  if (req.user) res.send(req.user);
  else res.status(401).send({ error: 'Not logged in' });
});

module.exports = router;