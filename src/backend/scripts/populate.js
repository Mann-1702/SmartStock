const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartstock', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const populateDatabase = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Sample products
    const products = [
      {
        name: 'Laptop',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        category: 'Electronics',
        stock: 50
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver',
        price: 29.99,
        category: 'Accessories',
        stock: 200
      },
      {
        name: 'Office Chair',
        description: 'Comfortable ergonomic office chair',
        price: 199.99,
        category: 'Furniture',
        stock: 30
      },
      {
        name: 'Monitor 24"',
        description: '24-inch Full HD monitor',
        price: 149.99,
        category: 'Electronics',
        stock: 75
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Products inserted:', createdProducts.length);

    // Sample orders
    const orders = [
      {
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        products: [
          {
            productId: createdProducts[0]._id,
            quantity: 1,
            price: 1299.99
          },
          {
            productId: createdProducts[1]._id,
            quantity: 2,
            price: 29.99
          }
        ],
        totalAmount: 1359.97,
        status: 'pending'
      },
      {
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        products: [
          {
            productId: createdProducts[2]._id,
            quantity: 1,
            price: 199.99
          },
          {
            productId: createdProducts[3]._id,
            quantity: 1,
            price: 149.99
          }
        ],
        totalAmount: 349.98,
        status: 'processing'
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log('Orders inserted:', createdOrders.length);

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.connection.close();
  }
};

populateDatabase();
