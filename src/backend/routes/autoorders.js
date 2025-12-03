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

    if (req.body.status) {
      autoOrder.status = req.body.status;
    }
    if (req.body.vendorOrderId) {
      autoOrder.vendorOrderId = req.body.vendorOrderId;
    }
    if (req.body.notes) {
      autoOrder.notes = req.body.notes;
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

module.exports = router;
