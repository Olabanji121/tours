const express = require('express')
const viewController = require('../controllers/viewsController')

const router = express.Router()


// view engine route
  router.get('/', viewController.getOverview)

  router.get('/tour/:slug', viewController.getTour)
  
module.exports = router