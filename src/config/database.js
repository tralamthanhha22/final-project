const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/account', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connect Database success.')
    } catch (error) {
        console.log('Fail to connect Database.')
    }
};
module.exports = { connect };