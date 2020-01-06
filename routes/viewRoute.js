const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/me', authController.protect, viewController.getAccount);
router.get('/login', authController.isLogin, viewController.getLoginForm);
router.get('/signup', authController.isLogin, viewController.getSignUpForm);
router.get('/', authController.isLogin, viewController.getOverview);
router.get('/tour/:slug', authController.isLogin, viewController.getTour);
// router.get('/tour/:id', authController.isLogin, viewController.getAccount);
router.get(
  '/manage',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.getManageTour
);
router.get(
  '/update/:slug',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.updateTour
);

// to submit updated user data without api
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = router;
