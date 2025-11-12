const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');
const app = express();

app.use(express.json());
app.use('/api/products', productRoutes);

// Connect only when not testing
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://localhost:27017/smartstock', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;