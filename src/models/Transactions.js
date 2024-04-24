const mongoose=require('mongoose')
const Schema=mongoose.Schema

const TransactionModel=new Schema({
    trans_id:{
        type:String,
        required:true
    },
    //list product
    details: [{
        id: String,
        name: String,
        price: String,
        image: String,
        quantity: Number
    }],
    //phone number 
    phone:{
        type:String,
        required:true
    },
    aid: {
        type: String
    },
    total:{
        type:Number,
    },
    //money customer give
    money_give:{
        type:Number,
    },
}, {
    timestamps: true
});

module.exports=mongoose.model('Transactions',TransactionModel)