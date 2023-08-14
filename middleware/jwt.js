const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userSchema');

const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log('Decoded hashed matric number:', decoded.hashed_matric_number);

      const user = await User.findOne({ hashed_matric_number: decoded.hashed_matric_number }).select('-password');

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

module.exports = { protectRoute };
