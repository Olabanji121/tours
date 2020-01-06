const fs = require('fs');
const Tour = require('../models/TourModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Invaild  file format! Only image and video allowed'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

//  when there is a mix of uploads with different fields i.e names
exports.uploadTourImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// single upload
// upload.single('image', 5)
// multiple upload with the same name
// upload.array('image', 5)

exports.resizeTourImages = async (req, res, next) => {
  // console.log(req.files);
  try {
    if (!req.files.imageCover || !req.files.images) return next();
    // 1) cover Image

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
    // req.body.imageCover = imageCoverFilename;

    // 2) images
    req.body.images =[]
    await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename)
    })

    );

    // console.log(req.body);
    
    next();
  } catch (err) {
    console.log(err);
  }
}; 

// route handlers

// top 5 tourd middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTourByID = factory.getOne(Tour, { path: 'reviews' });
exports.createTours = factory.createOne(Tour);
exports.updateTourById = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },

      {
        $group: {
          // _id: '$ratingsAverage',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },

      {
        $sort: { avgPrice: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },

      {
        $sort: { numTourStarts: -1 }
      }
      // {
      //   $limit: 12
      // }
    ]);

    res.status(200).json({
      status: 'success',

      data: {
        plan
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      return res.status(400).json({
        msg: 'Please Provide latitude and longitude in the format lat, lng'
      });
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.getDistances = async (req, res) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      return res.status(400).json({
        msg: 'Please Provide latitude and longitude in the format lat, lng'
      });
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

// /tours-within/233/center/6.470394, 3.572384/unit/mi

// exports.getAllTours = async (req, res) => {
// try {
// Build the query

// // 1A] FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];

// excludedFields.forEach(el => delete queryObj[el]);
// // console.log(req.query, queryObj);

// // 1B] ADVANCE FILTERING
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`)
// // console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));
//2] SORTING
// if (req.query.sort){
//   const sortBy = req.query.sort.split(',').join(' ');
//   // console.log(sortBy);

//     query = query.sort(sortBy);
//     // sort('price ratingsAverage)
// }else{
//   query =query.sort('-createdAt')
// }
// 3] FIELDS LIMITING
// if(req.query.fields){
//   const fields = req.query.fields.split(',').join(' ');

//     query = query.select(fields)
// }else{
//   query = query.select('-__v')
// }

// 4] Pagination

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page -1) * limit;

// query = query.skip(skip).limit(limit)

// if (req.query.page){
//   const numTours = await Tour.countDocuments();
//   if(skip >= numTours) throw new Error('This page does not exists')
// }
// Execute Query
// const tours = await query;
// const features = new APIFeatures(Tour.find(), req.query)
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();

// const tours = await features.query;

//  send response
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       requestAt: req.requestTime,
//       data: {
//         tours
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };

// exports.createTours = async (req, res) => {
//   // console.log(req.body);

//   try {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   } catch (err) {
//     // console.error(err.message);
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };

// exports.getTourByID = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     res.status(200).json({
//       status: 'success',

//       data: {
//         tour
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };

// exports.updateTourById = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     // tour.save()
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//    const tour =  await Tour.findByIdAndDelete(req.params.id);
//     if(!tour){
//         return res.status(200).json({msg:'NO tour with this ID'})
//     }

//    res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'failed',
//       message: err.message
//     });
//   }
// };
