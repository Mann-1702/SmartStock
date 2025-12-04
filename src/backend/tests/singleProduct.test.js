const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');

// Test Suite
describe('GET /api/products/:id', () => {
  // Tests run with shared setup from tests/setup.js
  let product;

  // Test product
  beforeEach(async () => {
    console.log("[singleProduct] Creating test product...");
    product = await Product.create({
      name: 'Ramsung',
      description: 'Telvision with PS5',
      price: 1000,
      category: 'Electronics',
      stock: 10,
    });
  });

  // Test: 1 - Get existing product
  it('should return a single product by ID', async () => {
    console.log("[singleProduct] Test 1: Fetching existing product...");
    const res = await request(app).get(`/api/products/${product._id}`);
    console.log("Response:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Ramsung');
  });

  // Test: 2 - Get non-existing product
  it('should return 404 if product does not exist', async () => {
    console.log("[singleProduct] Test 2: Fetching NON-EXISTING product...");
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/products/${fakeId}`);
    console.log("Response:", res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Product not found');
  });

  // Test: 3 - Invalid ObjectId
  it('should return 500 for invalid ObjectId', async () => {
    console.log("[singleProduct] Test 3: Fetching INVALID ID...");
    const res = await request(app).get('/api/products/invalid-id');
    console.log("Response:", res.body);

    expect(res.statusCode).toBe(500);
  });
});
