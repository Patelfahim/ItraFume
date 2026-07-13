const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Verifies JWT (from httpOnly cookie or Authorization header) and attaches req.user
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired session. Please log in again.', 401));
  }

  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed. Please log in again.', 401));
  }

  req.user = currentUser;
  next();
});

// Restrict route to specific roles, e.g. restrictTo('admin')
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

// Optional auth: attaches req.user if token present/valid, but doesn't fail if absent
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.jwt) token = req.cookies.jwt;
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) req.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};
