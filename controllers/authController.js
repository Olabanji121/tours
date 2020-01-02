const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),

    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
      // passwordchangedat: req.body.passwordchangedat,
      // role: req.body.role
    });

    // const payload ={
    //     user:{
    //         _id: newUser._id
    //     }
    // }
    // const token = signToken(newUser._id);
    // res.cookie('jwt', token, cookieOptions);
    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: {
    //     user: newUser
    //   }
    // });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) if email and password exist

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please input password and email' });
    }

    // 2) check if user exist  and password is correct

    const user = await User.findOne({ email }).select('+password');
    // console.log(user);
    // note if !user this next code wont run
    // const correct = await user.correctPassword(password, user.password)
    // const check = await bcrypt.compare(password, user.password)

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: 'incorrect email or password' });
    }
    // 3) if everything is ok send the token to client
    // const payload ={
    //     user:{
    //         _id: user._id
    //     }
    // }
    // const token = signToken(user._id);
    // // console.log(user._id);

    // res.status(200).json({
    //   status: 'success',
    //   token
    // });

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};


exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};


exports.protect = async (req, res, next) => {
  // 1) Get the token  and check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 2) verify  the token
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // req.user = decoded.user
    // req._id = decoded._id

    // 3) check if user exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res
        .status(401)
        .json({ msg: 'The User with this token no longer exists.' });
    }

    // 4) check if user changed passward after token was issued

    if (currentUser.changededPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        msg: 'The user recently changed paswword. Pleass login again'
      });
    }

    req.user = currentUser;
  } catch (err) {
    res.status(401).json({ msg: ` Token Error (${err.message}) ` });
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array[]
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: ` You do not have permission to perfrom this action ` });
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on posted email

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: 'No user with this email address' });
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });
    // 3) send it to the  user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a reset request with your new password to ${resetURL}.\nIf you didn't forget your password, please ignire this email!`;

    await sendEmail({
      email: user.email,
      subject: 'Your Password rest token (Valid for 10 mins)',
      message
    });

    return res.status(200).json({
      status: 'success',
      msg: `Token sent to ${user.email}`
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }

  next();
};
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    //2) if token has not expired and there is a user , set new password
    if (!user) {
      return res.status(400).json({ msg: 'Token is invaild or has Expired' });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) update changedPasswordAT property for the user
    //check usermodel pre save middleware
    //4) log the user in , send json web token to client
    // const token = signToken(user._id);
    // res.status(200).json({
    //   status: 'success',
    //   token
    // });
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) get user from db
    const user = await User.findById(req.user._id).select('+password');
    // 2) if posted password is correct;
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(401).json({ msg: 'your current password is wrong' });
    }

    // 3) if so update the password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) log user in and send Jwt
    // const token = signToken(user._id);
    // res.status(200).json({
    //   status: 'success',
    //   msg: 'password changed',
    //   token
    // });
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      msg: err.message
    });
  }
};

// only to show if the user is logged in or not
exports.isLogin = async (req, res, next) => {
  try {
    // 1) Get the token  and check if it there

    if (req.cookies.jwt) {
      // 2) verify  the token
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      // console.log(decoded);

      // req.user = decoded.user
      // req._id = decoded._id

      // 3) check if user exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // 4) check if user changed passward after token was issued

      if (currentUser.changededPasswordAfter(decoded.iat)) {
        return next();
      }
      // there is a login user and to make the users accessable to the template
      res.locals.user = currentUser;
      return next();
    }

    return next();

  } catch (err) {
    
    return next();
  }

  
};
