const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomersModel = new Schema({
    name:{
        type: String,
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        type: String,
    },
});

module.exports = mongoose.model('Customers', CustomersModel);