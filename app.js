const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRouter');
const bookRouter = require('./routes/bookRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const viewRoute = require('./routes/viewRoute');
const cookieParser = require('cookie-parser')
const compression = require('compression')

const app = express();

// setting up view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

// severing static file
app.use(express.static(path.join(__dirname, 'public')));


// app.use(express.static(`${__dirname}/public`));

//  1 GOLBAL MIDDLEWARE

// set  security HTTP headers
app.use(helmet());

// morgan middleware for logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API rate limiter middleware to limit req from one Ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// body parser middleware, reading data from body into req.body 
app.use(express.json({ extended: false, limit: '10kb' }));
// for form encoded with url
app.use(express.urlencoded({extended:true,limit: '10kb'}))
// cookie parser reads data from cookies
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attack
app.use(xss());

//  Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression())

// test middle ware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies); 

  next();
});


// mount routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter); 
app.use('/api/v1/bookings', bookRouter); 
//  mount view route 
app.use('/', viewRoute)
// error handling middleware
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);
module.exports = app;
