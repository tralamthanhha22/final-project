const Customers=require('../models/Customers')
const Employees = require('../models/Employees')
var Accounts = require('../models/Accounts.js')
const Transactions = require('../models/Transactions')

// Common function to fetch user details
const getUserDetails = async (req) => {
    try {
        if (!req.session.account) {
            return null;
        }

        const account = await Accounts.findOne({ username: req.session.account });
        const employee = await Employees.findOne({ aid: account.aid });

        if (!account || !employee) {
            return null;
        }

        return {
            fullname: account.fullname,
            username: account.username,
            email: account.email,
            password: account.password,
            avatar: employee.avatar,
            level: employee.level,
            createAt: employee.createAt || account.createdAt,
            address: employee.address,
            phone: employee.phone,
            verified: account.verified,
        };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

const CustomersController={
    getCustomerList: async (req,res,next)=>{
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Customers.find({})
                .then((customers) => {
                    const customersData = customers.map(customer => customer.toObject());
                    res.render('customers/customer-list', { customers: customersData, employee: user });
                })
                .catch((err) => {
                    return res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },

    getCustomerDetail: async (req, res, next) => {
        const user = await getUserDetails(req);
        const id = req.params.id;
    
        if (user && req.session.account) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Customers.findOne({ phone: id })
                .then((customer) => {
                    // Retrieve the customer's purchase history from the Transaction model
                    Transactions.find({ phone: id })
                        .then((transactions) => {
                            let totalAllTransactions = 0;
                            const transactionsData = transactions.map(transaction => {
                                const transactionData = transaction.toObject();
                                let totalProduct = 0;
                                
                                transactionData.details.forEach(detail => {
                                  totalProduct += detail.quantity;
                                });
                                totalAllTransactions += transaction.total;
                                return { ...transactionData, totalProduct };
                              });
                              
                              res.render('customers/customer-detail', { customer: customer.toObject(), id, employee: user, transactionsData, totalAllTransactions });
                            })
                        .catch((err) => {
                            console.error(err);
                            return res.render('error');
                        });
                })
                .catch((err) => {
                    console.error(err);
                    return res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    }
}
module.exports=CustomersController