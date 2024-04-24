const Employees = require('../models/Employees');
const Accounts = require('../models/Accounts')

module.exports = checkAdmin = async (req, res, next) => {
    if(!req.session.name) {
        return res.redirect('/employees/login');
    }
    else {
        const account = await Accounts.findOne({ username: req.session.account });
        const employee = await Employees.findOne({ aid: account.aid });
        
        if(employee.level == 'admin') {
            next();
        }
        else {
            return res.redirect('/employees/');
        }
    }
    
}