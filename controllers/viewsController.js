const Tour = require('../models/TourModel');

exports.getOverview = async (req, res) => {
  try {
    // 1) get tour dta from collection
    const tours = await Tour.find();
    // 2) Build template check overview.pug

    // 3)Render that template using tour data from step 1
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};
   
    
exports.getTour = async(req, res) => {
try {
    // 1) get tour data, from the requested tour(including reviews and guides)

const tour = await Tour.findOne({slug:req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user '
})
// 2) Build template check tour.pug
// 3)Render template using data from 1)


  res.status(200).render('tour', {
    // title: 'The Forest Hiker Tour',
    title: tour.name,
    tour
  });
} catch (err) {
    res.status(500).json({
        status: 'error',
        msg: err.message
      });
}
};
