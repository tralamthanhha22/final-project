const multer = require('multer');
const fs = require('fs-extra');
const { getMaxListeners } = require('../models/Employees');
const Accounts = require('../models/Accounts')
// Kho 
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let pro_name = req.body.pro_name;
        
        let dir = ``
        if (!pro_name) {
            dir = `./src/public/image/avatars`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        } else {
            let category = req.body.category
            dir = `./src/public/image/product/${category}`; //./src/public/uploads/products/Accessories
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        }
    },

    filename: function (req, file, cb) {
        let aid = req.session.account
        let pro_name = req.body.pro_name;

        let ext = file.originalname.substring(file.originalname.lastIndexOf('.')) // .png
        if (!pro_name) {
            cb(null, file.fieldname + '_' + aid + '_' + Date.now() + ext);
        }
        else {
            cb(null, file.fieldname + '_' + Date.now() + ext); // product-image_1839424203424.png
        }
    }
})

module.exports = upload = multer({
    storage: storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
})