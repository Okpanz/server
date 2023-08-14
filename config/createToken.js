const jwt = require('jsonwebtoken');
const secretKey = '1314nfgwsf454'; // Replace with your actual secret key

// Function to generate a JWT token
function generateToken(user) {
  console.log("Secret is", process.env.JWT_SECRET_KEY); // Add this line to log the secret key
  return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '30d' });
}

module.exports = generateToken;
