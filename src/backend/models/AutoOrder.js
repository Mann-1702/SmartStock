const mongoose = require('mongoose');

const autoOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  orderedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'ordered', 'received', 'cancelled'],
    default: 'pending'
  },
  vendorOrderId: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  managerEmail: {
    type: String,
    required: false
  },
  managerName: {
    type: String,
    required: false
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationDate: {
    type: Date,
    required: false
  }
});

module.exports = mongoose.model('AutoOrder', autoOrderSchema);
