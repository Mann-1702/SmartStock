const express = require('express');
const AutoOrder = require('../models/AutoOrder');
const Product = require('../models/Product');

const router = express.Router();

// GET all auto-orders
router.get('/', async (req, res) => {
  try {
    const autoOrders = await AutoOrder.find()
      .populate('productId')
      .sort({ orderDate: -1 });
    res.json(autoOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET auto-orders by status
router.get('/status/:status', async (req, res) => {
  try {
    const autoOrders = await AutoOrder.find({ status: req.params.status })
      .populate('productId')
      .sort({ orderDate: -1 });
    res.json(autoOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET auto-order by ID
router.get('/:id', async (req, res) => {
  try {
    const autoOrder = await AutoOrder.findById(req.params.id).populate('productId');
    if (!autoOrder) {
      return res.status(404).json({ message: 'Auto-order not found' });
    }
    res.json(autoOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new auto-order
router.post('/', async (req, res) => {
  const autoOrder = new AutoOrder({
    productId: req.body.productId,
    productName: req.body.productName,
    orderedQuantity: req.body.orderedQuantity,
    currentStock: req.body.currentStock,
    threshold: req.body.threshold,
    status: 'pending',
    notes: req.body.notes || ''
  });

  try {
    const newAutoOrder = await autoOrder.save();
    const populatedAutoOrder = await newAutoOrder.populate('productId');
    res.status(201).json(populatedAutoOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update auto-order status
router.put('/:id/status', async (req, res) => {
  try {
    const autoOrder = await AutoOrder.findById(req.params.id);
    if (!autoOrder) {
      return res.status(404).json({ message: 'Auto-order not found' });
    }

    const oldStatus = autoOrder.status;
    const newStatus = req.body.status;

    // Update auto-order fields
    if (newStatus) {
      autoOrder.status = newStatus;
    }
    if (req.body.vendorOrderId) {
      autoOrder.vendorOrderId = req.body.vendorOrderId;
    }
    if (req.body.notes) {
      autoOrder.notes = req.body.notes;
    }

    // ✅ NEW: Update product stock when status changes to 'received'
    if (newStatus === 'received' && oldStatus !== 'received') {
      const product = await Product.findById(autoOrder.productId);
      if (product) {
        product.stock += autoOrder.orderedQuantity;
        await product.save();
        console.log(`✅ Stock updated for ${product.name}: +${autoOrder.orderedQuantity} units (new stock: ${product.stock})`);
      } else {
        console.warn(`⚠️ Product not found for auto-order ${autoOrder._id}`);
      }
    }

    const updatedAutoOrder = await autoOrder.save();
    const populatedAutoOrder = await updatedAutoOrder.populate('productId');
    res.json(populatedAutoOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET auto-order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await AutoOrder.countDocuments();
    const pending = await AutoOrder.countDocuments({ status: 'pending' });
    const ordered = await AutoOrder.countDocuments({ status: 'ordered' });
    const received = await AutoOrder.countDocuments({ status: 'received' });
    const cancelled = await AutoOrder.countDocuments({ status: 'cancelled' });

    const totalQuantityOrdered = await AutoOrder.aggregate([
      { $group: { _id: null, total: { $sum: '$orderedQuantity' } } }
    ]);

    res.json({
      total,
      pending,
      ordered,
      received,
      cancelled,
      totalQuantityOrdered: totalQuantityOrdered[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST scan and create auto-orders for low-stock items
router.post('/scan-low-stock', async (req, res) => {
  try {
    const products = await Product.find();
    const createdOrders = [];
    const skippedProducts = [];

    for (const product of products) {
      // Check if stock is below threshold
      if (product.stock < product.threshold) {
        // Check if auto-order already exists
        const existingAutoOrder = await AutoOrder.findOne({
          productId: product._id,
          status: { $in: ['pending', 'ordered'] }
        });

        if (!existingAutoOrder) {
          const orderedQuantity = product.threshold * 2;
          const autoOrder = new AutoOrder({
            productId: product._id,
            productName: product.name,
            orderedQuantity: orderedQuantity,
            currentStock: product.stock,
            threshold: product.threshold,
            status: 'ordered'
          });

          await autoOrder.save();
          createdOrders.push({
            productName: product.name,
            currentStock: product.stock,
            threshold: product.threshold,
            orderedQuantity: orderedQuantity
          });
        } else {
          skippedProducts.push({
            productName: product.name,
            reason: 'Auto-order already exists'
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Scanned ${products.length} products`,
      createdOrders: createdOrders.length,
      skippedProducts: skippedProducts.length,
      details: {
        created: createdOrders,
        skipped: skippedProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST update all pending/ordered auto-orders to use new quantity formula (threshold * 2)
router.post('/update-quantities', async (req, res) => {
  try {
    const autoOrders = await AutoOrder.find({
      status: { $in: ['pending', 'ordered'] }
    }).populate('productId');

    const updated = [];
    const skipped = [];

    for (const autoOrder of autoOrders) {
      if (!autoOrder.productId) {
        skipped.push({
          productName: autoOrder.productName,
          reason: 'Product not found'
        });
        continue;
      }

      const product = autoOrder.productId;
      const newQuantity = product.threshold * 2;
      const oldQuantity = autoOrder.orderedQuantity;

      if (newQuantity !== oldQuantity) {
        autoOrder.orderedQuantity = newQuantity;
        autoOrder.threshold = product.threshold; // Update threshold too
        await autoOrder.save();

        updated.push({
          productName: product.name,
          oldQuantity: oldQuantity,
          newQuantity: newQuantity,
          threshold: product.threshold
        });
      } else {
        skipped.push({
          productName: product.name,
          reason: 'Already using correct quantity'
        });
      }
    }

    res.json({
      success: true,
      message: `Updated ${updated.length} auto-orders`,
      updated: updated.length,
      skipped: skipped.length,
      details: {
        updated: updated,
        skipped: skipped
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE auto-order
router.delete('/:id', async (req, res) => {
  try {
    const autoOrder = await AutoOrder.findByIdAndDelete(req.params.id);
    if (!autoOrder) {
      return res.status(404).json({ message: 'Auto-order not found' });
    }
    res.json({ message: 'Auto-order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TEST ENDPOINT - Send test email for debugging
router.post('/test/send-email', async (req, res) => {
  try {
    const { recipientEmail, recipientName } = req.body;

    if (!recipientEmail || !recipientName) {
      return res.status(400).json({ 
        message: 'Missing required fields: recipientEmail, recipientName' 
      });
    }

    const { sendAutoOrderNotification } = require('../services/emailService');
    
    const testAutoOrderData = {
      productName: 'Test Product',
      orderedQuantity: 50,
      currentStock: 5,
      threshold: 20
    };

    const emailResult = await sendAutoOrderNotification(
      recipientEmail,
      recipientName,
      testAutoOrderData
    );

    res.json({
      success: true,
      message: 'Test email endpoint called',
      emailResult: emailResult
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
