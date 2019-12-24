const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')



const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:resetToken', authController.resetPassword)

// to protect all the route below  from line 18
router.use(authController.protect);

router.get('/me',  userController.getMe,userController.getUser)
router.patch('/updateMyPassword',   authController.updatePassword)
 
router.patch('/updateMe',  userController.updateMe)

router.delete('/deleteMe',  userController.deleteMe)

// to restrict the routes below to admin
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);




module.exports = router;