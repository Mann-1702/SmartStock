const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('./models/UserModel');
const authRoutes = require('./routes/authRoute');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200', // Angular app origin
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
// Cleaned up: removed deprecated options
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartstock')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Improtant Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

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

//Auth Routes
app.use('/auth', authRoutes);
console.log('Auth routes mounted at /auth');

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartStock Backend API' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
