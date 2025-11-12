const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');

describe('GET /api/products', () => {
  // Connect to MongoDB before running tests
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartstock';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  // Clean up data before each test
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test 1: No products exist
  it('should return an empty array when no products exist', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  // Test 2: Successfully get all products
  it('should return all products when products exist', async () => {
    await Product.insertMany([
      { name: 'Item A', description: 'Desc A', price: 10, category: 'Category A', stock: 5 },
      { name: 'Item B', description: 'Desc B', price: 20, category: 'Category B', stock: 8 }
    ]);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[1]).toHaveProperty('price');
  });
  
  // Test 3: Handle server errors
  it('should handle server errors gracefully', async () => {
    // Temporarily mock Product.find() to throw an error
    jest.spyOn(Product, 'find').mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Database failure');
  });
});