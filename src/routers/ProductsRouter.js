const express=require('express')
const router=express.Router()
const upload=require('../middlewares/multer')
const ProductsController=require('../controllers/ProductsController')

router.get('/product-list', ProductsController.getProductList)
// add product
router.get('/add-product',ProductsController.getAddProduct)
router.post('/add-product',upload.array('product_image',15),ProductsController.postAddProduct)
// edit product
router.get('/edit-product/:id', ProductsController.getEditProduct)
router.post('/edit-product/:id', upload.array('product_image',15), ProductsController.postEditProduct)
//delete a product
router.delete('/delete-product/:id', ProductsController.deleteProduct)

module.exports=router