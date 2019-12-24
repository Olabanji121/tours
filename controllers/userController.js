const User = require('../models/userModel');
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


exports.updateMe = async (req, res) => {
  try {
    // 1) create erroe if user post password data

    if (req.body.password ||req.body.passwordConfirm) {
      return res.status(400).json({
        msg:
          'This route is not for password update please use /updateMypassword'
      });
    }
    // 2// fliter out fields not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');
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
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};

exports.deleteMe = async(req, res)=>{
  try {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
  
}
 
exports.getMe = (req,res, next)=>{
  req.params.id  = req.user.id
  next()
}



exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
// do  not update passsword with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)


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