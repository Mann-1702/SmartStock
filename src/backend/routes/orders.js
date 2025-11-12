const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  const order = new Order({
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    products: req.body.products,
    totalAmount: req.body.totalAmount,
    status: req.body.status
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST checkout cart - create order from cart items
router.post('/checkout', async (req, res) => {
  try {
    const { customerName, customerEmail, cartItems } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        message: 'Missing required fields: customerName, customerEmail, and cartItems array' 
      });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order with cart items
    const order = new Order({
      customerName,
      customerEmail,
      products: cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      status: 'pending'
    });

    const newOrder = await order.save();
    const populatedOrder = await newOrder.populate('products.productId');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
