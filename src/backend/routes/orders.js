const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AutoOrder = require('../models/AutoOrder');

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

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields if provided
    if (req.body.customerName != null) order.customerName = req.body.customerName;
    if (req.body.customerEmail != null) order.customerEmail = req.body.customerEmail;
    if (req.body.products != null) order.products = req.body.products;
    if (req.body.totalAmount != null) order.totalAmount = req.body.totalAmount;
    if (req.body.status != null) order.status = req.body.status;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST checkout cart - create order from cart items and update stock
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
    
    try {
      for (const item of cartItems) {
        const product = await Product.findByIdAndUpdate(
          item._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        // Check if stock is now below threshold and create auto-order
        if (product && product.stock < product.threshold) {
          const orderedQuantity = product.threshold - product.stock;
          
          // Check if there's already a pending auto-order for this product
          const existingAutoOrder = await AutoOrder.findOne({
            productId: product._id,
            status: 'pending'
          });

          if (!existingAutoOrder) {
            const autoOrder = new AutoOrder({
              productId: product._id,
              productName: product.name,
              orderedQuantity: orderedQuantity,
              currentStock: product.stock,
              threshold: product.threshold,
              status: 'ordered'
            });

            await autoOrder.save();
            console.log(`Auto-order created and placed with vendor for product: ${product.name}, Quantity: ${orderedQuantity}`);
          }
        }
      }
    } catch (stockError) {
      console.error('Error updating stock or creating auto-order:', stockError);
      // Log error but don't fail the order - stock update is secondary
    }
    
    const populatedOrder = await newOrder.populate('products.productId');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully and stock updated',
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
