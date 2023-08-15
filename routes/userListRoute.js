const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const {adminProtect} = require('../middleware/jwt'); // Correct import

// Fetch all users (accessible only to admin)
router.get('/users',   async (req, res) => {
  try {
    const users = await User.find({}).select('_id username');
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
});

module.exports = router;
