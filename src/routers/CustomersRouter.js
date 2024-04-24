const express=require('express')
const router=express.Router()
const CustomersController=require('../controllers/CustomersController')

//Get Customer List Page 
router.get('/customer-list', CustomersController.getCustomerList)
//Get Customer Detail Page
router.get('/customer-detail/:id', CustomersController.getCustomerDetail)

module.exports=router