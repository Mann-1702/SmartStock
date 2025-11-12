const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');

// Connect to MongoDB before running tests
beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartstock';
  await mongoose.connect(mongoURI); //, { useNewUrlParser: true, useUnifiedTopology: true }

});

// Clean up data before each test
beforeEach(async () => {
  await Product.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('GET /api/products/:id', () => {
  let product;

  beforeEach(async () => {
    await Product.deleteMany();
    product = await Product.create({
      name: 'Test Product',
      description: 'A test product',
      price: 100,
      category: 'Electronics',
      stock: 10,
    });
  });

  // Test 1: Successfully get a single product
  it('should return a single product by ID', async () => {
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Product');
  });

  // Test 2: Product not found
  it('should return 404 if product does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Product not found');
  });

  // Test 3: Invalid ObjectId format
  it('should return 500 for invalid ObjectId', async () => {
    const res = await request(app).get('/api/products/invalid-id');
    expect(res.statusCode).toBe(500);
  });
});
