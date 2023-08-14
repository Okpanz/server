const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwt');
const RequestAppointment = require('../models/requestAppointment');
const User = require('../models/userSchema');

// Create a new appointment request
router.post('/request-appointment', authMiddleware, async (req, res) => {
  const { reason, urgency } = req.body;

  try {
    const user = req.user; // Authenticated user from the middleware

    const newRequest = new RequestAppointment({
      user: user._id,
      reason,
      urgency,
    });

    await newRequest.save();
    res.json({ message: 'Appointment request created successfully' });
  } catch (error) {
    console.error('Error creating appointment request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all appointment requests with additional user information
router.get('/appointment-requests', authMiddleware, async (req, res) => {
  try {
    const user = req.user; // Authenticated user from the middleware

    const requests = await RequestAppointment.find({ user: user._id })
      .populate('user', 'username')
      .select('reason status urgency');

    res.json({ appointmentRequests: requests });
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
