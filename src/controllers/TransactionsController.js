const Transactions = require('../models/Transactions')
const Product = require('../models/Products')
var Accounts = require('../models/Accounts.js')
const Employees = require('../models/Employees')
const Customers = require('../models/Customers')

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


const TransactionsController = {
    // Get Create Order page
    getCreateOrders: async function (req, res, next) {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Product.find({})
                .then((products) => {
                    const productData = products.map(product => product.toObject());
                    Customers.find({})
                        .then((customers) => {
                            // Render the view after obtaining both productData and customerData
                            res.render('transactions/create-order', { products: productData, count: productData.length, customers: customers, employee: user });
                        })
                        .catch((err) => {
                            console.error(err);
                            res.render('error');
                        });
                })
                .catch((err) => {
                    console.error(err);
                    res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },

    postCreateOrders: async (req, res) => {
        const account = await Accounts.findOne({ username: req.session.account });
        const cartItems = req.body['cart-items']
        const totalAmount = req.body['total-amount']
        const { phone, name, address, money_give } = req.body

        if (!cartItems) {
            return res.status(404).send('Cart not found');
        }
        const transactionDetails = JSON.parse(cartItems);

        // Iterate over the cart items
        for (const item of transactionDetails) {
            const productId = item.id;
            const quantity = item.quantity;

            // Retrieve the product from the Products collection
            const product = await Product.findOne({pid: productId});
            if (!product) {
                // Handle the case where the product is not found
                return res.status(404).send('Product not found');
            }

            // Check if the available quantity is sufficient for the order
            if (product.amount < quantity) {
                // Handle the case where the available quantity is insufficient
                return res.status(400).send('Insufficient quantity');
            }

            // Subtract the ordered quantity from the available quantity
            product.amount -= quantity;

            // Save the updated product
            await product.save();
        }


        const new_transaction = new Transactions({
            trans_id: Date.now(), // use timestamp for pID
            details: JSON.parse(cartItems),
            phone: phone,
            aid: account.aid,
            total: parseFloat(totalAmount),
            money_give: parseFloat(money_give),
        });
        new_transaction.save()
        if (name && address) {
            const new_customer = new Customers({
                name: name,
                phone: phone,
                address: address
            })
            new_customer.save()
        }
        return res.redirect('/transactions/create-order')
    },

    // Get Order Detail page
    getOrderDetail: async (req, res, next) => {
        const user = await getUserDetails(req);
        const id = req.params.id;

        if (user && req.session.account) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Transactions.findOne({ trans_id: id })
                .then((transaction) => {
                    Customers.findOne({ phone: transaction.phone }).then((customer) => {
                        res.render('transactions/order-detail', { transaction: transaction.toObject(), customer: customer.toObject(), id, employee: user });
                    })
                })
                .catch((err) => {
                    return res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },
    // Get Order List Page
    getOrderList: async (req, res, next) => {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Transactions.find({})
                .then((transactions) => {
                    const transactionData = transactions.map(transaction => transaction.toObject());
                    res.render('transactions/order-list', { transaction: transactionData, employee: user });
                })
                .catch((err) => {
                    return res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },

    getProductsBuyRates:async function(req,res,next){
        const user = await getUserDetails(req);
        const proNameBuy=[]
        let result={}
        var resultArr=[]

        if (req.session.account && user) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Transactions.find({}).then((orders)=>{
                const orderData = orders.map(order => order.toObject());
                orderData.forEach(orderFunc)
                function orderFunc(order){
                    const pronames=order.details.map(product => product.name)
                    pronames.forEach(proNameFunc)
                    function proNameFunc(proname){
                        proNameBuy.push(proname.replace(/\[|\]/g, ""))
                        var month=order.createdAt.getMonth()+1
                        result={
                            "createdAt":order.createdAt.getDate()+'/'+month+'/'+order.createdAt.getFullYear(),
                            "proname":proname.replace(/\[|\]/g, "")
                        }
                        resultArr.push(result)
                    }
                }
                const frequenciesDate = {};
                resultArr.forEach(item => {
                const productName = item.proname;
                const createdAt = item.createdAt;

                if (frequenciesDate[createdAt]) {
                    if (frequenciesDate[createdAt][productName]) {
                    frequenciesDate[createdAt][productName]++;
                    } else {
                    frequenciesDate[createdAt][productName] = 1;
                    }
                } else {
                    frequenciesDate[createdAt] = { [productName]: 1 };
                }
                });

                const frequencies = {};
                resultArr.forEach(item => {
                const productName = item.proname;
                if (frequencies[productName]) {
                    frequencies[productName]++;
                } else {
                    frequencies[productName] = 1;
                }
                });
                var freqDates=Object.values(frequenciesDate)
                var freq_proname_dates_keys=[]
                var freq_proname_dates_values=[]
                freqDates.forEach(freqDatefunc)
                function freqDatefunc(freqDate){
                    freq_proname_dates_keys.push(Object.keys(freqDate)+'/~o')
                    freq_proname_dates_values.push(Object.values(freqDate)+'/~o')
                }
                return res.render('reports/products-buy-rates',{
                    freqValues:Object.values(frequencies),
                    freqKeys:Object.keys(frequencies),
                    freqByDateKeys:Object.keys(frequenciesDate),
                    freqPronameDatesKeys:freq_proname_dates_keys,
                    freqPronameDatesValues:freq_proname_dates_values,
                    employee: user,
                })
            })
        }else {
            return res.redirect('/employees/login');
        }  
    },

    getReport:async function(req,res,next){
        const user = await getUserDetails(req);
        const products = await Product.find({});
        const productData = products.map(product => product.toObject());
        
        if (req.session.account && user) {
            if(!user.verified){
                return res.redirect('/employees/change-password');
            }
            Transactions.find({})
            .then((transactions) => {
                const transactionsData = transactions.map(transaction => {
                    const transactionData = transaction.toObject();
                    let totalProduct = 0;
                    
                    transactionData.details.forEach(detail => {
                      totalProduct += detail.quantity;
                    });
                    return { ...transactionData, totalProduct };
                  });
                
                return res.render('report-and-analysis',{
                    transactions:transactionsData,
                    employee: user,
                    products: productData
                })
            })
        } else {
            return res.redirect('/employees/login');
        }  
    }
}
module.exports = TransactionsController