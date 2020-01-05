const express = require('express');
const {
  aliasTopTours,
  getTourStats,
  getAllTours,
  createTours,
  getTourByID,
  updateTourById,
  deleteTour,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImage,
  resizeTourImages
} = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRouter');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Post /tour/2345/reviews
// GET /tour/43455/reviews
// GET /tour/45566/reviews/9456576
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkID)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTours);

router
  .route('/:id')
  .get(getTourByID)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImage,  
    resizeTourImages,
    updateTourById
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
