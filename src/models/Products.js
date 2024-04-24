const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const ProductsModel = new Schema({
    //barcode: pid
    pid: {
        type: String,
        unique: true,
        required: true
    },
    pro_name: {
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    import_price: {
        type: Number,
        required: true
    },
    retail_price: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
    },
    amount:{
        type:Number,
        required: true,
    },
    slug: {
        type: String,
        slug: 'pro_name'
    },
    //new product, best selling, outdate, out of stock
    status:{
        type:String,
        default: 'New Product',
        required: true,
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('Products', ProductsModel);