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

    // Sample products for restaurants and shops with various stock levels and thresholds
    const products = [
      // Restaurant Ingredients & Food Items
      {
        name: 'Rice (1kg bag)',
        description: 'Premium basmati rice',
        price: 3.50,
        category: 'Grains',
        stock: 150,
        threshold: 50
      },
      {
        name: 'Cooking Oil (5L)',
        description: 'Vegetable cooking oil',
        price: 12.99,
        category: 'Oils',
        stock: 30,
        threshold: 20
      },
      {
        name: 'Chicken Breast (kg)',
        description: 'Fresh chicken breast',
        price: 8.99,
        category: 'Meat',
        stock: 25,
        threshold: 15
      },
      {
        name: 'Tomatoes (kg)',
        description: 'Fresh ripe tomatoes',
        price: 2.50,
        category: 'Vegetables',
        stock: 40,
        threshold: 20
      },
      {
        name: 'Onions (kg)',
        description: 'Fresh yellow onions',
        price: 1.80,
        category: 'Vegetables',
        stock: 8,
        threshold: 15
      },
      {
        name: 'Milk (1L)',
        description: 'Fresh whole milk',
        price: 2.20,
        category: 'Dairy',
        stock: 0,
        threshold: 30
      },
      {
        name: 'Eggs (dozen)',
        description: 'Farm fresh eggs',
        price: 4.50,
        category: 'Dairy',
        stock: 5,
        threshold: 20
      },
      {
        name: 'Bread Flour (10kg)',
        description: 'Premium bread flour',
        price: 18.99,
        category: 'Grains',
        stock: 60,
        threshold: 25
      },
      {
        name: 'Sugar (2kg)',
        description: 'White granulated sugar',
        price: 3.99,
        category: 'Baking',
        stock: 45,
        threshold: 20
      },
      {
        name: 'Salt (1kg)',
        description: 'Iodized table salt',
        price: 1.20,
        category: 'Spices',
        stock: 3,
        threshold: 10
      },
      // Shop/Grocery Items
      {
        name: 'Paper Towels (pack)',
        description: '6-roll paper towel pack',
        price: 8.99,
        category: 'Supplies',
        stock: 22,
        threshold: 15
      },
      {
        name: 'Dish Soap (500ml)',
        description: 'Concentrated dish soap',
        price: 3.49,
        category: 'Cleaning',
        stock: 18,
        threshold: 12
      },
      {
        name: 'Coffee Beans (500g)',
        description: 'Arabica coffee beans',
        price: 12.50,
        category: 'Beverages',
        stock: 35,
        threshold: 15
      },
      {
        name: 'Tea Bags (100 pack)',
        description: 'Black tea bags',
        price: 6.99,
        category: 'Beverages',
        stock: 28,
        threshold: 10
      },
      {
        name: 'Pasta (500g)',
        description: 'Italian spaghetti pasta',
        price: 2.99,
        category: 'Grains',
        stock: 2,
        threshold: 25
      },
      {
        name: 'Tomato Sauce (jar)',
        description: 'Homestyle tomato pasta sauce',
        price: 4.50,
        category: 'Condiments',
        stock: 42,
        threshold: 20
      },
      {
        name: 'Disposable Plates (50 pack)',
        description: 'Eco-friendly disposable plates',
        price: 7.99,
        category: 'Supplies',
        stock: 15,
        threshold: 10
      },
      {
        name: 'Napkins (200 pack)',
        description: 'White paper napkins',
        price: 5.50,
        category: 'Supplies',
        stock: 8,
        threshold: 12
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Products inserted:', createdProducts.length);

    // Sample orders with various statuses - Restaurant/Shop customers
    const orders = [
      {
        customerName: 'Sarah Martinez',
        customerEmail: 'sarah.martinez@email.com',
        products: [
          {
            productId: createdProducts[0]._id,  // Rice
            quantity: 10,
            price: 3.50
          },
          {
            productId: createdProducts[1]._id,  // Cooking Oil
            quantity: 3,
            price: 12.99
          }
        ],
        totalAmount: 73.97,
        status: 'pending'
      },
      {
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        products: [
          {
            productId: createdProducts[2]._id,  // Chicken Breast
            quantity: 5,
            price: 8.99
          },
          {
            productId: createdProducts[3]._id,  // Tomatoes
            quantity: 8,
            price: 2.50
          }
        ],
        totalAmount: 64.95,
        status: 'processing'
      },
      {
        customerName: 'Emily Johnson',
        customerEmail: 'emily.johnson@email.com',
        products: [
          {
            productId: createdProducts[12]._id,  // Coffee Beans
            quantity: 4,
            price: 12.50
          }
        ],
        totalAmount: 50.00,
        status: 'shipped'
      },
      {
        customerName: 'David Wilson',
        customerEmail: 'david.wilson@email.com',
        products: [
          {
            productId: createdProducts[7]._id,  // Bread Flour
            quantity: 2,
            price: 18.99
          },
          {
            productId: createdProducts[8]._id,  // Sugar
            quantity: 5,
            price: 3.99
          }
        ],
        totalAmount: 57.93,
        status: 'delivered'
      },
      {
        customerName: 'Lisa Anderson',
        customerEmail: 'lisa.anderson@email.com',
        products: [
          {
            productId: createdProducts[14]._id,  // Pasta
            quantity: 20,
            price: 2.99
          },
          {
            productId: createdProducts[15]._id,  // Tomato Sauce
            quantity: 15,
            price: 4.50
          }
        ],
        totalAmount: 127.30,
        status: 'pending'
      },
      {
        customerName: 'Robert Taylor',
        customerEmail: 'robert.taylor@email.com',
        products: [
          {
            productId: createdProducts[6]._id,   // Eggs
            quantity: 12,
            price: 4.50
          },
          {
            productId: createdProducts[10]._id,  // Paper Towels
            quantity: 6,
            price: 8.99
          }
        ],
        totalAmount: 107.94,
        status: 'processing'
      },
      {
        customerName: 'Jennifer Garcia',
        customerEmail: 'jennifer.garcia@email.com',
        products: [
          {
            productId: createdProducts[16]._id,  // Disposable Plates
            quantity: 8,
            price: 7.99
          },
          {
            productId: createdProducts[17]._id,  // Napkins
            quantity: 10,
            price: 5.50
          }
        ],
        totalAmount: 118.92,
        status: 'delivered'
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
