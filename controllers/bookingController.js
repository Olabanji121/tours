const Tour = require('../models/TourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = async (req, res, next) => {
  try {
    // 1  get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);
    // 2 create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourID
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourID,

      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          amount: tour.price * 100,
          currency: 'usd',
          quantity: 1
        }
      ]
    });
    // 3 create seesion as  response
    res.status(200).json({
      status: 'success',
      session
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message,
      stack: err.stack
    });
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  try {

    // this is not secure
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();

    await Booking.create({tour,user,price})

    res.redirect(req.originalUrl.split('?')[0])

  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message,
      stack: err.stack
    });
  }
};


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.UpdateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);