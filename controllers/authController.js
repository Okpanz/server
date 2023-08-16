const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const secretKey = '1314nfgwsf454'; // Replace with your actual secret key
 const generateToken = require('../config/createToken')
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { matric_number, username, password } = req.body;

    const user = await User.findOne({username})
    // check if username exists
    if(user) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash the matric_number (optional)
    const hashedMatricNumber = await bcrypt.hash(matric_number, 10);

    // Create a new user
    const newUser = new User({
      hashed_matric_number: hashedMatricNumber,
      username: username,
      password: hashedPassword,
      isAdmin: false, // Set isAdmin to false by default
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred' })
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If login is successful, generate a JWT token using the generateToken function
    const token = generateToken({
      userId: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    res.status(200).json({

      message: 'Login successful',
      token: token,
      username: user.username,
      isAdmin : user.isAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// ...


module.exports = router;
