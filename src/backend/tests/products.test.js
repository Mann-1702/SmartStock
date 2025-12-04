const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

describe('Product API Tests', () => {
  let authToken;
  let testUser;

  // Reset and create test user before each test (since setup.js clears all data)
  beforeEach(async () => {
    // Create a test user and generate auth token
    testUser = await User.create({
      googleId: 'test-google-id',
      name: 'Test User',
      email: 'test@smartstock.com',
      role: 'manager',
      storeId: 'store001',
      plan: 'premium',
      skuCount: 0
    });

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'jwtsecret');
  });

  // GET /api/products - List all products
  describe('GET /api/products', () => {
    it('should return an empty array when no products exist', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return all products when products exist', async () => {
      await Product.insertMany([
        { name: 'Product 1', description: 'Desc 1', price: 10, category: 'Cat A', stock: 5, threshold: 10 },
        { name: 'Product 2', description: 'Desc 2', price: 20, category: 'Cat B', stock: 8, threshold: 5 }
      ]);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('price');
    });
  });

  // GET /api/products/:id - Get single product
  describe('GET /api/products/:id', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'Electronics',
        stock: 10,
        threshold: 5
      });
    });

    it('should return a product by valid ID', async () => {
      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test Product');
      expect(res.body).toHaveProperty('price', 100);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 500 for invalid product ID format', async () => {
      const res = await request(app).get('/api/products/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  // POST /api/products - Create product
  describe('POST /api/products', () => {
    it('should create a new product with valid data and auth', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 50,
        category: 'Food',
        stock: 20,
        threshold: 10,
        soldLastMonth: 0
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'New Product');
      expect(res.body).toHaveProperty('_id');

      // Verify product was saved in database
      const savedProduct = await Product.findOne({ name: 'New Product' });
      expect(savedProduct).not.toBeNull();

      // Verify SKU count increased
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.skuCount).toBe(1);
    });

    it('should fail without authentication', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 50,
        category: 'Food',
        stock: 20,
        threshold: 10
      };

      const res = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(res.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const invalidProduct = {
        name: 'New Product'
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct);

      expect(res.status).toBe(400);
    });
  });

  // PUT /api/products/:id - Update product
  describe('PUT /api/products/:id', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Original Product',
        description: 'Original Description',
        price: 100,
        category: 'Electronics',
        stock: 10,
        threshold: 5
      });
    });

    it('should update a product with valid data', async () => {
      const updates = {
        name: 'Updated Product',
        price: 150,
        stock: 15
      };

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Product');
      expect(res.body).toHaveProperty('price', 150);
      expect(res.body).toHaveProperty('stock', 15);
    });

    it('should return 404 when updating non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should partially update product fields', async () => {
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ stock: 25 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stock', 25);
      expect(res.body).toHaveProperty('name', 'Original Product'); // unchanged
    });
  });

  // DELETE /api/products/:id - Delete product
  describe('DELETE /api/products/:id', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Product to Delete',
        description: 'Will be deleted',
        price: 100,
        category: 'Electronics',
        stock: 10,
        threshold: 5
      });
    });

    it('should delete a product by ID', async () => {
      const res = await request(app)
        .delete(`/api/products/${product._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');

      // Verify product was deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 when deleting non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/products/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // Business Logic Tests
  describe('Product Business Logic', () => {
    it('should track low stock products (stock < threshold)', async () => {
      const lowStockProduct = await Product.create({
        name: 'Low Stock Item',
        description: 'Running low',
        price: 10,
        category: 'Food',
        stock: 5,
        threshold: 10
      });

      expect(lowStockProduct.stock).toBeLessThan(lowStockProduct.threshold);
    });

    it('should handle products with expiry dates', async () => {
      const expiryDateString = '2025-12-31';
      const product = await Product.create({
        name: 'Perishable Item',
        description: 'Has expiry',
        price: 10,
        category: 'Food',
        stock: 5,
        threshold: 10,
        expiryDate: expiryDateString
      });

      expect(product.expiryDate).toBeDefined();
      expect(product.expiryDate).toBeTruthy();
    });

    it('should track soldLastMonth for inventory forecasting', async () => {
      const product = await Product.create({
        name: 'Popular Item',
        description: 'Sells well',
        price: 10,
        category: 'Food',
        stock: 100,
        threshold: 20,
        soldLastMonth: 50
      });

      expect(product.soldLastMonth).toBe(50);
    });
  });
});
