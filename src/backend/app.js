// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const User = require('./models/UserModel');
const authRoutes = require('./routes/authRoute');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const autoOrderRoutes = require('./routes/autoorders');
const paymentRoutes = require('./routes/payment');

dotenv.config();
const app = express();

// CORS CONFIG
// --------------------------------------------------------------------------------------
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true  // Allow all origins in production (served from same domain)
    : ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(passport.initialize());

// --------------------------------------------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --------------------------------------------------------------------------------------
// GOOGLE AUTH
// --------------------------------------------------------------------------------------
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

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then(user => done(null, user))
);

// --------------------------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------------------------
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/autoorders', autoOrderRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to SmartStock Backend API' });
});

// --------------------------------------------------------------------------------------
// SERVE ANGULAR FRONTEND
// --------------------------------------------------------------------------------------

const distPath = path.join(__dirname, 'dist');

// Check if dist folder exists
if (require('fs').existsSync(distPath)) {
  console.log('Serving Angular from:', distPath);
  app.use(express.static(distPath));
  
  // Handle Angular's routing (send index.html for unknown routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('Warning: dist folder not found at', distPath);
  // Fallback: try to serve from angular folder (backward compatibility)
  const angularFolder = path.join(__dirname, 'angular');
  if (require('fs').existsSync(angularFolder)) {
    const folders = require('fs').readdirSync(angularFolder);
    const angularAppFolder = folders.find(f => 
      require('fs').statSync(path.join(angularFolder, f)).isDirectory()
    );
    if (angularAppFolder) {
      const angularDistPath = path.join(angularFolder, angularAppFolder);
      console.log('Serving Angular from fallback path:', angularDistPath);
      app.use(express.static(angularDistPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(angularDistPath, 'index.html'));
      });
    }
  }
}
module.exports = app;
