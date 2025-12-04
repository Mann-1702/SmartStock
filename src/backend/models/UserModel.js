const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: String,
  email: String,
  role: { type: String, enum: ['manager', 'employee'], default: 'employee' },
  storeId: { type: String, required: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  skuCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
