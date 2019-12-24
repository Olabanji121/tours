const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Post /tour/2345/reviews
// GET /tour/43455/reviews
// GET /tour/45566/reviews/9456576

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTOurUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)

  .patch(
    authController.restrictTo('user', 'admin'),reviewController.checkOwner,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),reviewController.checkOwner,
    reviewController.deleteReview
  );

module.exports = router;
