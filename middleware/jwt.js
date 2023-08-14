const jwt = require('jsonwebtoken');
const secretKey = '1314nfgwsf454';

const protectRoute = (req, res, next) => {
  const token = req.headers.authorization || '';

  console.log('Received token:', token); // Log the token

  if (!token) {
    return res.status(401).json({ error: 'Auth token not provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      req.user = {
        userId: decoded.userId,
      };
      console.log('Token verified:', decoded);
      next();
    }
  });
};

module.exports = protectRoute;
