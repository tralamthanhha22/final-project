const express=require('express')
const router=express.Router()
const upload=require('../middlewares/multer')
const EmployeesController=require('../controllers/EmployeesController')

//account
router.get('/login',EmployeesController.getLogin)
router.post('/login', EmployeesController.login)
router.get('/',EmployeesController.getHome)
router.get('/log-in-new/:id',EmployeesController.getLoginNew)
router.post('/log-in-new',EmployeesController.postLoginNew)
router.get('/expire-login',EmployeesController.getExpireLogin)

router.get('/change-password',EmployeesController.getChangePasswords)
router.post('/change-password',EmployeesController.postChangePasswords)
router.get('/update-account', EmployeesController.getUpdateAccount)
router.post('/update-account',upload.single('avatar'),EmployeesController.updateAccount)
router.get('/account-detail', EmployeesController.getAccountDetail)
router.get('/logout', EmployeesController.logout)


// employees
router.post('/add-employee',upload.single('avatar'),EmployeesController.addNewEmployee)
router.get('/employee-list', EmployeesController.getEmployeeList)
router.get('/employee-detail/:id', EmployeesController.getEmployeeDetail)
router.post('/change-status/:id', EmployeesController.changeStatusAccount)
router.post('/resend-link/:id', EmployeesController.resendLinkActivate)

module.exports=router