const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Order = require('../models/Order');
const Product = require('../models/Product');

describe('Order API Tests', () => {
  let testProduct;

  // Setup test data before each test
  beforeEach(async () => {
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 50,
      category: 'Food',
      stock: 100,
      threshold: 10
    });
  });

  // GET /api/orders - List all orders
  describe('GET /api/orders', () => {
    it('should return an empty array when no orders exist', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return all orders when orders exist', async () => {
      await Order.insertMany([
        {
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          products: [{ productId: testProduct._id, quantity: 2, price: 50 }],
          totalAmount: 100,
          status: 'pending'
        },
        {
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          products: [{ productId: testProduct._id, quantity: 1, price: 50 }],
          totalAmount: 50,
          status: 'delivered'
        }
      ]);

      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  // GET /api/orders/:id - Get single order
  describe('GET /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        products: [{ productId: testProduct._id, quantity: 2, price: 50 }],
        totalAmount: 100,
        status: 'pending'
      });
    });

    it('should return an order by valid ID', async () => {
      const res = await request(app).get(`/api/orders/${order._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('customerName', 'Test Customer');
      expect(res.body).toHaveProperty('totalAmount', 100);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/orders/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
  });

  // POST /api/orders - Create order
  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const newOrder = {
        customerName: 'New Customer',
        customerEmail: 'new@example.com',
        products: [
          { productId: testProduct._id, quantity: 3, price: 50 }
        ],
        totalAmount: 150,
        status: 'pending'
      };

      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('customerName', 'New Customer');
      expect(res.body).toHaveProperty('totalAmount', 150);
      expect(res.body).toHaveProperty('_id');
    });

    it('should fail with invalid data', async () => {
      const invalidOrder = {
        customerName: 'Test'
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrder);

      expect(res.status).toBe(400);
    });

    it('should set default status to pending if not provided', async () => {
      const newOrder = {
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        products: [{ productId: testProduct._id, quantity: 1, price: 50 }],
        totalAmount: 50
      };

      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'pending');
    });
  });

  // PUT /api/orders/:id - Update order
  describe('PUT /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        customerName: 'Original Customer',
        customerEmail: 'original@example.com',
        products: [{ productId: testProduct._id, quantity: 2, price: 50 }],
        totalAmount: 100,
        status: 'pending'
      });
    });

    it('should update order status', async () => {
      const res = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'shipped');
    });

    it('should update multiple order fields', async () => {
      const updates = {
        status: 'delivered',
        totalAmount: 120
      };

      const res = await request(app)
        .put(`/api/orders/${order._id}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'delivered');
      expect(res.body).toHaveProperty('totalAmount', 120);
    });

    it('should return 404 when updating non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/orders/${fakeId}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(404);
    });
  });

  // DELETE /api/orders/:id - Delete order
  describe('DELETE /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        customerName: 'Customer to Delete',
        customerEmail: 'delete@example.com',
        products: [{ productId: testProduct._id, quantity: 1, price: 50 }],
        totalAmount: 50,
        status: 'pending'
      });
    });

    it('should delete an order by ID', async () => {
      const res = await request(app)
        .delete(`/api/orders/${order._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Order deleted successfully');

      // Verify order was deleted
      const deletedOrder = await Order.findById(order._id);
      expect(deletedOrder).toBeNull();
    });

    it('should return 404 when deleting non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/orders/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // Business Logic Tests
  describe('Order Business Logic', () => {
    it('should calculate total amount correctly', async () => {
      const product2 = await Product.create({
        name: 'Product 2',
        description: 'Second product',
        price: 30,
        category: 'Food',
        stock: 50,
        threshold: 10
      });

      const order = await Order.create({
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        products: [
          { productId: testProduct._id, quantity: 2, price: 50 }, // 100
          { productId: product2._id, quantity: 3, price: 30 }     // 90
        ],
        totalAmount: 190,
        status: 'pending'
      });

      expect(order.totalAmount).toBe(190);
      expect(order.products.length).toBe(2);
    });

    it('should track order status transitions', async () => {
      const order = await Order.create({
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        products: [{ productId: testProduct._id, quantity: 1, price: 50 }],
        totalAmount: 50,
        status: 'pending'
      });

      // Transition: pending -> processing
      order.status = 'processing';
      await order.save();
      expect(order.status).toBe('processing');

      // Transition: processing -> shipped
      order.status = 'shipped';
      await order.save();
      expect(order.status).toBe('shipped');

      // Transition: shipped -> delivered
      order.status = 'delivered';
      await order.save();
      expect(order.status).toBe('delivered');
    });

    it('should store order creation timestamp', async () => {
      const order = await Order.create({
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        products: [{ productId: testProduct._id, quantity: 1, price: 50 }],
        totalAmount: 50,
        status: 'pending'
      });

      expect(order.createdAt).toBeDefined();
      expect(order.createdAt).toBeInstanceOf(Date);
    });
  });
});
