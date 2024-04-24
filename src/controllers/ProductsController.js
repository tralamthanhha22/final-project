const Products = require('../models/Products')
var Accounts = require('../models/Accounts.js')
const Employees = require('../models/Employees')
const Transactions = require('../models/Transactions')
const fs = require('fs-extra');

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

const ProductsController = {
    getProductList: async (req, res) => {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if (!user.verified) {
                return res.redirect('/employees/change-password');
            }
            Products.find({})
                .then((products) => {
                    const productData = products.map(product => product.toObject());
                    return res.render('products/product-list', { products: productData, count: productData.length, employee: user })
                })
                .catch((err) => {
                    return res.render('error');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },

    //ADD PRODUCT
    getAddProduct: async (req, res, next) => {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if (user.level == 'admin') {
                return res.render('products/add-product', { employee: user });
            }
            return res.render('employees/home', { employee: user });
        } else {
            return res.redirect('/employees/login');
        }
    },

    postAddProduct: (req, res, next) => {
        const files = req.files
        const { pro_name, category, description, amount, import_price, retail_price } = req.body
        let imgList = []

        Products.findOne({ pro_name: pro_name }).then(product => {
            if (product) {
                return res.send(`Product ${product.pro_name} exists`)
            }
            else {
                if (files.length == 0) {
                    return res.redirect('/products/add-product');
                }

                files.forEach(file => {
                    let path = `/image/product/${category}/${file.filename}`;
                    imgList.push(path);
                })

                var newProduct = {
                    pid: Date.now(), // use timestamp for pID
                    pro_name: pro_name,
                    category: category,
                    description: description || '',
                    import_price: import_price,
                    retail_price: retail_price,
                    amount: amount,
                    images: imgList,
                }

                new Products(newProduct).save()
                    .then((product) => {
                        return res.redirect('/products/product-list')
                    })
                    .catch((err) => {
                        return res.redirect('/products/add-product')
                    });
            }
        }).catch(next)
    },

    //EDIT PRODUCT
    getEditProduct: async (req, res, next) => {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if (user.level != 'admin') {
                return res.render('employees/home', { employee: user });
            }
            const id = req.params.id;

            Products.findOne({ pid: id }).then(product => {
                if (!product) {
                    return res.redirect('/products/product-list')
                }
                else {
                    const data = {
                        pro_name: product.pro_name,
                        description: product.description,
                        category: product.category,
                        retail_price: product.retail_price,
                        import_price: product.import_price,
                        amount: product.amount,
                        status: product.status,
                        images: product.images
                    };
                    return res.render('products/edit-product', { product: data, employee: user });
                }
            })
        } else {
            return res.redirect('/employees/login');
        }
    },

    postEditProduct: (req, res, next) => {
        const id = req.params.id;
        const files = req.files
        const { pid, pro_name, category, description, import_price, retail_price, amount, old_images } = req.body
        let imgList = []

        Products.findOne({ pid: id })
            .then((product) => {
                product.pro_name = pro_name
                product.description = description
                product.category = category
                product.retail_price = retail_price
                product.import_price = import_price
                product.amount = amount
                if (files.length > 0) {
                    files.forEach(file => {
                        let path = `/image/product/${category}/${file.filename}`;
                        imgList.push(path);
                    })
                    let oldpath = `./src/public${old_images}`
                    fs.unlink(oldpath)
                    product.images = imgList
                } else {
                    product.images = old_images
                }
                product.save()
                return res.redirect('/products/product-list')
            })
            .catch(() => {
                return res.redirect(`/products/edit-product/${pid}`)
            })
    },

    //DELETE PRODUCT
    deleteProduct: async (req, res, next) => {
        try {
          const id = req.params.id;
      
          // Check if the product is associated with any transaction
          const transactions = await Transactions.find({ "details.id": id });
          if (transactions.length > 0) {
            return res.render('products/product-list', { message: 'Cannot delete the product as it is associated with a transaction.' });
          }
      
          // Find and delete the product
          const deletedProduct = await Products.findOneAndDelete({ pid: id });
          if (!deletedProduct) {
            return res.redirect('/products/product-list');
          }
      
          // Delete associated images
          if (deletedProduct.images && deletedProduct.images.length > 0) {
            const imageDeletionPromises = deletedProduct.images.map((imagePath) => {
              const fullPath = `./src/public${imagePath}`;
              return fs.promises.unlink(fullPath);
            });
            await Promise.all(imageDeletionPromises);
          }
      
          // Redirect to the product list with a success message
          return res.render('products/product-list', { message: 'Product deleted successfully.' });
        } catch (err) {
          console.error(err);
          return res.redirect('/products/product-list');
        }
      }
}
module.exports = ProductsController