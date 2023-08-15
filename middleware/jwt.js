const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userSchema');

const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log(decoded);
      console.log('Decoded hashed matric number:', decoded.userId);

      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        console.log('User not found for hashed matric number:', decoded.hashed_matric_number);
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token found' });
  }
});

const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
});

module.exports = { protectRoute, adminProtect };
