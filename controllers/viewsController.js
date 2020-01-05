const Tour = require('../models/TourModel');
const User = require('../models/userModel');

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

exports.getTour = async (req, res) => {
  try {
    // 1) get tour data, from the requested tour(including reviews and guides)

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user '
    });
    // 2) Build template check tour.pug
    // 3)Render template using data from 1)
    if (!tour) {
      return res.status(404).render('error', {
        title: 'Something went Wrong!',
        msg: 'There is no Tour with this Name'
      });
    }

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

exports.getLoginForm = async (req, res) => {
  try {
    res.status(200).render('login', {
      title: 'Login into Your Account'
    });
  } catch (err) {
    res.status(404).render('error', {
      title: 'Something went Wrong!',
      msg: err.message
    });
  }
};

exports.getSignUpForm = async (req, res) => {
  try {
    res.status(200).render('signup', {
      title: 'SignUp for an  Account'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.updateUserData = async (req, res, next) => {
  // console.log('update user', req.body);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      { new: true, runValidators: true }
    );

    res.status(200).render('account', {
      title: 'Your Account',
      user: updatedUser
    });

  } catch (err) {
    res.status(400).render('error', {
      title: 'Something went Wrong!',
      msg: err.message
    });     
  } 
};
