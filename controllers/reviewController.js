const Review = require('../models/ReviewModel');
const factory = require('./handlerFactory');



exports.setTOurUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next()
};

exports.checkOwner= async(req, res, next)=>{

  try {
    const review = await Review.findById(req.params.id)
    if(!review){
      return res
      .status(404)
      .json({ msg: "No Review with this ID" });
    }
    console.log(review.user._id);
    
    if(review.user._id.toString() !== req.user.id){
      return res
          .status(401)
          .json({ msg: "Access Denied you do not own this Review" });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,

    });
  }
  next()
}
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review, {path: 'tour',  select: ' name'})
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);



 
// exports.getAllReviews = async (req, res) => {
//   try {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };
//     const reviews = await Review.find(filter);
//     res.status(200).json({
//       status: 'success',
//       results: reviews.length,
//       data: {
//         reviews
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       msg: err.message
//     });
//   }
// };

// exports.createReview = async(req,res)=>{
//   try {
//     // allow nested route
//     if(!req.body.tour) req.body.tour = req.params.tourId;
//     if(!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body)
//     res.status(201).json({
//       status: 'success',
//       data: {
//         review: newReview
//       }
//     });
//   } catch (err) {
//     res.status(401).json({
//       status: 'error',
//       msg: err.message
//     });
//   }
// }