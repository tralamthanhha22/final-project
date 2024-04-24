const accountController=require('../controllers/EmployeesController')
const mongoose = require('mongoose');
const Account = require('../models/Accounts');
const sampleAccount = require('./sampleAccount');

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
  await Account.deleteMany({});
});

test('adds a account to the database', async () => {
  const newAccount = new Account(sampleAccount);
  await newAccount.save();

  const accounts = await Account.find({});
  expect(accounts.length).toBe(1);
  expect(accounts[0].name).toBe(sampleAccount.name);
  expect(accounts[0].price).toBe(sampleAccount.price);
});

jest.mock('../controllers/EmployeesController'); // Replace with the actual path to your logout function
const employee = require('../controllers/EmployeesController'); // Import the mocked logout function
const logout=employee.logout
test('log out testing',async()=>{
    const mockSession = {}; // Mock session object (replace with your actual implementation)
    logout.mockReturnValueOnce(Promise.resolve(mockSession)); // Simulate successful logout with session
    logout(); // Call the logout function

    // Assert that session data is cleared (adapt based on your session implementation)
    expect(mockSession).toEqual({}); 
})
