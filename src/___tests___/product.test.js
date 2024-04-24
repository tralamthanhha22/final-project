const productController=require('../controllers/ProductsController')
const mongoose = require('mongoose');
const Product = require('../models/Products');
const sampleProduct = require('./sampleProduct');

// Connect to MongoDB (replace with your connection string)

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/account', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close connection after tests
afterAll(async () => {
  await mongoose.disconnect();
});

// Clear existing data before each test
beforeEach(async () => {
  await Product.deleteMany({});
});

test('adds a product to the database', async () => {
  const newProduct = new Product(sampleProduct);
  await newProduct.save();

  const products = await Product.find({});
  expect(products.length).toBe(1);
  expect(products[0].name).toBe(sampleProduct.name);
  expect(products[0].price).toBe(sampleProduct.price);
});
