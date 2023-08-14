const express = require('express');
const router = express.Router();
const protect = require('../middleware/jwt');
const RequestAppointment = require('../models/requestAppointment');

// Protect the route using the middleware
router.post('/request', protect, async (req, res) => {
  try {
    // Extract user information from the authenticated request
    const userId = req.user._id; // Assuming req.user contains user information

    // Extract other necessary information from the request body
    const { reason, urgency } = req.body;

    // Create a new appointment request using the RequestAppointment model
    const appointmentRequest = new RequestAppointment({
      user: userId,
      reason: reason,
      urgency: urgency,
    });

    // Save the appointment request to the database
    await appointmentRequest.save();

    // Return a JSON response with the created appointment request details
    res.status(201).json({
      message: 'Appointment request submitted successfully.',
      appointmentRequest: {
        _id: appointmentRequest._id,
        user: appointmentRequest.user,
        reason: appointmentRequest.reason,
        urgency: appointmentRequest.urgency,
        status: appointmentRequest.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while submitting the appointment request.' });
  }
});

module.exports = router;
