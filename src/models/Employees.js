const mongoose=require('mongoose')
const Schema=mongoose.Schema

const EmployeeModel=new Schema({
    //account id
    aid: {
        type: String,
        unique: true,
        required: true
    },
    // role: admin, employee
    level:{
        type:String,
        required:true,
    },
    avatar: {
        type: String,
        default:'https://i.stack.imgur.com/l60Hf.png',
    },
    phone:{
        type:String
    },
    address:{
        type:String
    }
}, {
    timestamps: true
});
module.exports=mongoose.model('Employees',EmployeeModel)