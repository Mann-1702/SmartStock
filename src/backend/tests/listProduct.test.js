const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');

// Test Suite
describe('GET /api/products', () => {

  // Connect before tests
  beforeAll(async () => {
    console.log("[listProduct] Connecting to MongoDB...");
    await mongoose.connect('mongodb://127.0.0.1:27017/smartstock');
  });

  // Clean data
  beforeEach(async () => {
    console.log("[listProduct] Clearing Product collection...");
    await Product.deleteMany({});
  });

  // Disconnect
  afterAll(async () => {
    console.log("[listProduct] Closing MongoDB...");
    await mongoose.connection.close();
  });

  // Test: 1 - No products
  it('should return an empty array when no products exist', async () => {
    console.log("[listProduct] Test 1: Fetching empty list...");
    const res = await request(app).get('/api/products');
    console.log("Response:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  // Test: 2 - With products
  it('should return all products when products exist', async () => {
    console.log("[listProduct] Test 2: Inserting sample products...");
    await Product.insertMany([
      { name: 'Item A', description: 'Desc A', price: 10, category: 'Category A', stock: 5 },
      { name: 'Item B', description: 'Desc B', price: 20, category: 'Category B', stock: 8 }
    ]);

    console.log("[listProduct] Fetching all products...");
    const res = await request(app).get('/api/products');
    console.log("Response:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // Test: 3 - Simulate DB error
  it('should handle server errors gracefully', async () => {
    console.log("[listProduct] Test 3: Simulating DB failure...");
    
    jest.spyOn(Product, 'find').mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const res = await request(app).get('/api/products');
    console.log("Response:", res.body);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Database failure');
  });
});
