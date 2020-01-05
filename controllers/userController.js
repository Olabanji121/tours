const User = require('../models/userModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// file upload with multer

// to store to diskStorage
// const multerStorage = multer.diskStorage({
//   destination: (req,file, cb)=>{
//     cb(null,'public/img/users')
//   },
//   filename:(req, file, cb) =>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// });

// to store to memoryStorage

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new Error('Invaild  file format! Only image and video allowed'), false);
  }
}; 

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = async(req, res, next) => {
  
  try {
    if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 750)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

  next()
  } catch (err) {
    console.log(err);
    
  }
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj; 
};

exports.updateMe = async (req, res) => {
  // console.log(req.file);
  // console.log(req.body);

  try {
    // 1) create erroe if user post password data

    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        msg:
          'This route is not for password update please use /updateMypassword'
      });
    }
    // 2// fliter out fields not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) filterBody.photo = req.file.filename;
    //3 update user document

    const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      msg: err.message
    });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// do  not update passsword with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json({
//       status: 'success',
//       results: users.length,
//       data: {
//         users
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       msg: err.message
//     });
//   }
// };

// exports.getMe = async(req,res)=>{
//   try {
//     const user = await User.find(req.user._id);
//     res.status(200).json({
//       status: 'success',

//       data: {
//         user
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       msg: err.message
//     });
//   }
// }
