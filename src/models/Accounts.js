const mongoose=require('mongoose')
const Schema=mongoose.Schema

const AccountModel=new Schema({
    aid: {
        type: String,
        unique: true,
        required: true
    },
    username:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
    },
    fullname: {
        type: String,
        required: true
    },
    // inactive, active, new employee:default
    status:{
        type:String,
        default: 'New Employee'
    },
    verified:{
        type:Boolean,
        default:false,
    }
}, {
    timestamps: true
});
module.exports=mongoose.model('Accounts',AccountModel)