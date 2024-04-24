const express=require('express')
const router=express.Router()
const TransactionsController=require('../controllers/TransactionsController')

router.get('/order-list', TransactionsController.getOrderList)
router.get('/order-detail/:id',TransactionsController.getOrderDetail)

// Create Order
router.get('/create-order', TransactionsController.getCreateOrders)
router.post('/create-order',TransactionsController.postCreateOrders)

//Reports and analysis
router.get('/report-and-analysis',TransactionsController.getReport)
router.get('/report-and-analysis/products-buy-rates',TransactionsController.getProductsBuyRates)

module.exports=router