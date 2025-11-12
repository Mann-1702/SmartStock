// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('./models/UserModel');
const authRoutes = require('./routes/authRoute');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

// Session Creation
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartstock')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        const email = profile.emails[0].value;
        const role = email.endsWith('@smartstock.com') ? 'manager' : 'employee';
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          role,
          storeId: 'store001',
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize / Deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then(user => done(null, user))
);

// Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartStock Backend API' });
});

module.exports = app;
