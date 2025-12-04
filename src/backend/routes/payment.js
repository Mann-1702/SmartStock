const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/UserModel');

console.log('Payment routes loaded');

// Dummy payment processing with basic validation
const processPayment = (paymentDetails) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const card = (paymentDetails.cardNumber || '').toString().replace(/\s+/g, '');
      const expiry = paymentDetails.expiryDate || '';
      const cvc = (paymentDetails.cvc || '').toString();

      // basic validations
      if (!/^\d{16}$/.test(card)) {
        return reject({ success: false, message: 'Invalid card number. Must be 16 digits.' });
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        return reject({ success: false, message: 'Invalid expiry date. Use MM/YY.' });
      }
      if (!/^\d{3}$/.test(cvc)) {
        return reject({ success: false, message: 'Invalid CVC. Must be 3 digits.' });
      }

      // simulate success
      resolve({ success: true, transactionId: 'txn_' + Math.random().toString(36).substr(2, 9) });
    }, 1000);
  });
};

router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  // In a real application, you would create a payment intent with a payment provider like Stripe
  // and return the client secret to the frontend.
  // For this dummy implementation, we'll just return a success message.
  res.json({ success: true, clientSecret: 'dummy_client_secret' });
});

router.post('/confirm-payment', authMiddleware, async (req, res) => {
  console.log('confirm-payment called, headers:', Object.keys(req.headers).length ? { auth: req.headers.authorization } : {}, 'body keys:', Object.keys(req.body || {}));
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paymentResult = await processPayment(req.body);

    if (paymentResult.success) {
      // Apply changes depending on payment type
      const type = req.body.type || 'premium';
      if (type === 'addons') {
        // Add default 100 SKUs as an example for add-ons (could be passed in request)
        const addCount = parseInt(req.body.addCount, 10) || 100;
        user.skuCount = (user.skuCount || 0) + addCount;
        await user.save();
        res.json({ success: true, message: `Payment successful! ${addCount} SKUs added to your account.` });
      } else {
        user.plan = 'premium';
        await user.save();
        res.json({ success: true, message: 'Payment successful! Your plan has been upgraded to Premium.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Payment failed.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
