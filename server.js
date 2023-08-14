const express = require('express');
const app = express();
require('dotenv').config();
const authRoute = require('./controllers/authController')
const port = process.env.PORT ; // Use port from environment variable or default to 3000
const mongoDB = require('./config/db')
const cors = require('cors')
const {protectRoute} = require('./middleware/jwt')
const requestAppointment = require('./routes/requestAppointment')
mongoDB()
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())



app.use('/auth', authRoute)
app.use('/api', requestAppointment)
// Route handling
app.get('/protected', protectRoute, (req, res) => {
  const user = req.user; // Access user data from req.user
  res.status(200).json({ message: 'Access granted', user: user });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
