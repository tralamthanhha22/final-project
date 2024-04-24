const Employees = require('../models/Employees')
const Transactions = require('../models/Transactions')
const bcrypt = require('bcrypt')
const saltRounds = 10
var Accounts = require('../models/Accounts.js')
const nodemailer = require('nodemailer')

// Send email to new user
function sendEmail(sender, receiver, aid) {
    const expirationTime = new Date(new Date().getTime() + 1 * 60 * 1000); // Calculate expiration time (1 minute)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tralamtralam12345@gmail.com',
            pass: 'ddzw fmfx wmur tlxy',
        },
    });

    // Create the URL with a unique timestamp parameter
    const url = `http://localhost:8080/employees/log-in-new/${aid}?expires=${expirationTime.getTime()}`;

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: 'New Employee Login',
        text: `Dear Employee,\n\nWelcome to our company! Click the link below to set up your account and log in.\n\n${url}\n\nBest regards,\nThe Company Team`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

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
            status: account.status
        };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

const EmployeesController = {
    //HOME PAGE
    getHome: async (req, res) => {
        const user = await getUserDetails(req);

        if (req.session.account && user) {
            if (user.verified) {
                return res.render('employees/home', { employee: user });
            }
            return res.redirect('/employees/change-password');
        } else {
            return res.redirect('/employees/login');
        }
    },

    //LOGOUT
    logout: (req, res) => {
        req.session.destroy();
        return res.redirect('/employees/login')
    },

    //LOGIN
    getLogin: (req, res, next) => {
        if (req.session.account) {
            return res.redirect('/')
        }
        return res.render('employees/login', { layout: 'main' })
    },

    login: (req, res, next) => {
        const { username, password } = req.body
        Accounts.findOne({ username: username })
            .then(user => {
                if (!user) {
                    req.flash('error', 'Incorrect username');
                    return res.redirect('/employees/login');
                }

                if (user.verified == false) {
                    req.flash('error', 'Account need to activate. Please activate your account!');
                    return res.redirect('/employees/login');
                }

                if (user.status === 'Inactive') {
                    req.flash('error', 'Account is inactive. Please contact Admin for login!');
                    return res.redirect('/employees/login');
                }

                bcrypt.compare(password, user.password)
                    .then(result => {
                        if (result) {
                            req.session.account = user.username;
                            return res.redirect('/');
                        }
                        req.flash('error', 'Incorrect password');
                        return res.redirect('/employees/login');
                    })
                    .catch(error => {
                        console.error(error);
                        req.flash('error', 'An error occurred');
                        return res.redirect('/employees/login');
                    });
            });
    },

    //CREATE NEW EMPLOYEE
    addNewEmployee: (req, res, next) => {
        if (!req.session.account) {
            return res.redirect('/employees/login')
        }

        const { fullname, email } = req.body
        let parts = email.split('@')
        let password = parts[0] || ''
        let username = parts[0] || ''
        const aid = Date.now()

        Accounts.findOne({ email: email }).then(account => {
            if (account) {
                console.log(`Account ${account.username} exists.`)
                return res.redirect('/employees/employee-list')
            }
            else {
                bcrypt.hash(password, saltRounds)
                    .then(function (hash) {
                        let newAccount = new Accounts({
                            aid: aid,
                            email: email,
                            fullname: fullname,
                            username: username,
                            password: hash,
                        });
                        newAccount.save()

                        let newEmployee = new Employees({
                            aid: aid,
                            level: 'employee',
                        })
                        newEmployee.save()
                        //send email for new employee
                        sendEmail('tralamtralam12345@gmail.com', email, aid)
                        return res.redirect('/employees/employee-list')
                    })
                    .catch(function (err) {
                        console.error(err);
                        return res.redirect('/employees/employee-list', { err });
                    });
            }
        }).catch(next)
    },

    getExpireLogin: async (req, res, next) => {
        if (req.session.account) {
            return res.redirect('/')
        } else {
            return res.render('employees/expire-login', {layout: 'main'});
        }
    },

    getLoginNew: (req, res) => {
        if (req.session.account) {
            return res.redirect('/')
        }
        const id = req.params.id
        // Get the expires query parameter from the URL
        const expires = req.query.expires;
        // Check if the link has expired
        const currentTime = new Date().getTime();
        if (currentTime > expires) {
            // Link has expired
            return res.redirect('/employees/expire-login');
        }
        Accounts.findOne({ aid: id }).then(account => {
            //if account is not in DB
            if (!account) {
                return res.redirect('/employees/login')
            }
            const data = {
                id: account.aid,
                email: account.email
            }
            return res.render('employees/login-new', { data: data, layout: 'main' })
        })
    },

    postLoginNew: (req, res) => {
        const id = req.body._id

        Accounts.findOne({ aid: id }).then(account => {
            if (account) {
                req.session.account = account.username
                req.session.password = account.password
                Accounts(account).save()
                return res.redirect(`/employees/change-password`)
            }
            else {
                console.log('Employee ' + id + ' is not exist')
                return res.redirect('/employees/login')
            }
        })
    },

    //CHANGE PASSWORD 
    getChangePasswords: async (req, res) => {
        const user = await getUserDetails(req);
        if (user) {
            return res.render('employees/change-password', { employee: user });
        } else {
            return res.redirect('/employees/login');
        }
    },

    postChangePasswords: (req, res, next) => {
        const new_password = req.body.new_password;

        Accounts.findOne({ username: req.session.account })
            .then(account => {
                if (account.status == 'New Employee') {
                    bcrypt.hash(new_password, saltRounds)
                        .then(function (hash) {
                            account.password = hash;
                            account.status = 'Active'
                            account.verified = true
                            return account.save();
                        })
                        .then(() => {
                            req.session.destroy();
                            return res.redirect('/employees/login')
                        })
                        .catch(error => {
                            console.error(error);
                            req.flash('error', 'An error occurred while changing password');
                            return res.redirect('/employees/change-password');
                        });
                }
                else {
                    const current_password = req.body.current_password;
                    bcrypt.compare(current_password, account.password)
                        .then(result => {
                            if (!result) {
                                req.flash('error', 'Invalid current password');
                                return res.redirect('/employees/change-password');
                            }

                            bcrypt.hash(new_password, saltRounds)
                                .then(function (hash) {
                                    account.password = hash;
                                    return account.save();
                                })
                                .then(() => {
                                    return res.redirect('/employees/account-detail');
                                })
                                .catch(error => {
                                    console.error(error);
                                    req.flash('error', 'An error occurred while changing password');
                                    return res.redirect('/employees/change-password');
                                });
                        })
                        .catch(error => {
                            console.error(error);
                            req.flash('error', 'An error occurred while changing password');
                            return res.redirect('/employees/change-password');
                        });
                }
            })
            .catch(next);
    },

    //UPDATE ACCOUNT
    getUpdateAccount: async (req, res) => {
        const user = await getUserDetails(req);
        if (user) {
            if (!user.verified) {
                return res.redirect('/employees/change-password');
            }
            return res.render('employees/update-account', { employee: user });
        } else {
            return res.redirect('/employees/login');
        }
    },

    updateAccount: (req, res) => {
        const { fullname, phone, address } = req.body
        const file = req.file

        Accounts.findOne({ username: req.session.account })
            .then(account => {
                account.fullname = fullname
                account.save()

                Employees.findOne({ aid: account.aid }).then(employee => {
                    employee.phone = phone
                    employee.address = address
                    if (file) {
                        let avatarPath = '/image/avatars/' + file.filename
                        employee.avatar = avatarPath
                    }
                    employee.save()
                    return res.redirect('/employees/account-detail')
                })
            })
    },

    //EMPLOYEE LIST
    getEmployeeList: async (req, res, next) => {
        const user = await getUserDetails(req);
        if (req.session.account && user) {
            if (user.level == 'admin') {
                Accounts.find({})
                    .then((account) => {
                        const accountData = account.map(a => a.toObject());
                        return res.render('employees/employee-list', { employees: accountData, count: accountData.length, employee: user })
                    })
            } else {
                return res.redirect('/employees/');
            }
        } else {
            return res.redirect('/employees/login');
        }
    },

    //EMPLOYEE DETAIL
    getEmployeeDetail: async (req, res, next) => {
        const user = await getUserDetails(req);
        const id = req.params.id;

        if (req.session.account && user) {
            if (user.level == 'admin') {
                const account = await Accounts.findOne({ aid: id });
                const employee = await Employees.findOne({ aid: id });

                if (!account || !employee) {
                    return null;
                }

                const data = {
                    fullname: account.fullname,
                    username: account.username,
                    email: account.email,
                    avatar: employee.avatar,
                    level: employee.level,
                    createAt: employee.createAt || account.createdAt,
                    address: employee.address,
                    phone: employee.phone,
                    status: account.status
                };

                const transactions = await Transactions.find({ aid: id });
                const transactionData = transactions.map(transaction => transaction.toObject());
                return res.render('employees/employee-detail', { employee: user, data, transactionData });
            }
            else {
                return res.render('employees/home', { employee: user });
            }

        } else {
            return res.redirect('/employees/login');
        }
    },

    //ACCOUNT DETAIL
    getAccountDetail: async (req, res, next) => {
        const user = await getUserDetails(req);

        if (user) {
            if (!user.verified) {
                return res.redirect('/employees/change-password');
            }
            return res.render('employees/account-detail', { employee: user });
        } else {
            return res.redirect('/employees/login');
        }
    },

    //CHANGE STATUS: LOCK/UNLOCK ACCOUNT
    changeStatusAccount: (req, res, next) => {
        if (req.session.account) {
            const id = req.params.id;
            Accounts.findOne({ aid: id })
                .then(account => {
                    if (account.status === 'Active') {
                        account.status = 'Inactive';
                    } else if (account.status === 'Inactive') {
                        account.status = 'Active';
                    }
                    return account.save(); 
                })
                .then(() => {
                    // Add a return statement to prevent further execution
                    return res.render('employees/employee-list');
                })
                .catch(error => {
                    // Handle any errors that occurred during the process
                    console.error(error);
                    return res.redirect('/employees/login');
                });
        } else {
            return res.redirect('/employees/login');
        }
    },

    resendLinkActivate: (req, res, next) => {
        if(req.session.account){
            const id = req.params.id;
            Accounts.findOne({aid: id})
            .then(account => {
                sendEmail('tralamtralam12345@gmail.com', account.email, id)
                return res.redirect('/employees/employee-list')
            })
        }
        else {
            return res.redirect('/employees/login');
        }
    }
}
module.exports = EmployeesController