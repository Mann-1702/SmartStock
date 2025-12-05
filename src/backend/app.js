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

// --------------------------------------------------------------------------------------
// CORS CONFIG
// --------------------------------------------------------------------------------------
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? /\.azurewebsites\.net$/
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

// Example folder: backend/angular/smartstock
// You MUST replace <your-folder> with the actual name

const angularFolder = path.join(__dirname, 'angular');
const folders = require('fs').readdirSync(angularFolder);

// Find first directory inside backend/angular (the Angular build folder)
const angularAppFolder = folders.find(f => 
  require('fs').statSync(path.join(angularFolder, f)).isDirectory()
);

const angularDistPath = path.join(angularFolder, angularAppFolder);

console.log("Serving Angular from:", angularDistPath);

// Serve static files
app.use(express.static(angularDistPath));

// Handle Angular's routing (send index.html for unknown routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// --------------------------------------------------------------------------------------
module.exports = app;
