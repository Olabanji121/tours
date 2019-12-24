const mongoose = require('mongoose');
const Tour = require('./TourModel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'please input a  review'],
      minlength: [5, 'A tour must have more or equal then 10 characters']
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    createdAt: {
      type: Date,
      default: Date.now()
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user']
    }
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// query  pre middleware
ReviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});


// create index to prvent dublicate reviews
ReviewSchema.index({tour: 1, user: 1}, { unique: true })
// Static method
ReviewSchema.statics.calAverageRatings = async function(tourId) {
  // this keyword point to the reviewModel
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats);
  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  }else{
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
  
};

// post Doc middleware does not get access to next
ReviewSchema.post('save', function() {
  // this keyword points to the current doc being save and the constructor key word stands fro the model that created the doc (review model)
  this.constructor.calAverageRatings(this.tour);
});


// to calculate review stats when updating and deleting review use query middleware but no access to doc
// findByIdAndUpdate same as findOneAndUpdate
// findByIdAndDelete same as findOneAndDelete 
ReviewSchema.pre(/^findOneAnd/, async function(next){
  this.review = await this.findOne()
  // console.log(this.review);
  next()
});

ReviewSchema.post(/^findOneAnd/, async function(){
  // this.review = await this.findOne() CANT WORK HERE BCOS QUERY ALREADY EXECUTED
  await this.review.constructor.calAverageRatings(this.review.tour)
  
})  
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

// Post /tour/2345/reviews
// GET /tour/43455/reviews
// GET /tour/45566/reviews/9456576
