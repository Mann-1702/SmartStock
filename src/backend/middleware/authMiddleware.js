const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const User = require('../models/UserModel');

module.exports = async function verifyToken(req, res, next) {
  try {
    // Accept token from Authorization header (Bearer), or `token` query param
    const authHeader = req.headers.authorization || req.query.token;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Check blacklist
    const blacklisted = await Token.findOne({ token });
    if (blacklisted) return res.status(401).json({ error: 'Token invalidated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');

    // Load full user from DB
    const user = await User.findById(payload.id).select('-__v');
    console.log('[authMiddleware] token payload:', { id: payload.id, exp: payload.exp });
    console.log('[authMiddleware] loaded user:', user ? { id: user._id, name: user.name, email: user.email } : null);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
