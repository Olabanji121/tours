const express = require('express')
const viewController = require('../controllers/viewsController')
const authController = require('../controllers/authController')


const router = express.Router()


router.get('/login', viewController.getLoginForm)
router.get('/signup', viewController.getSignUpForm)
// view engine route
  router.use(authController.isLogin)

  router.get('/', viewController.getOverview)

  router.get('/tour/:slug', viewController.getTour)

   
module.exports = router; 