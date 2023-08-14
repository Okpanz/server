const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/jwt');
const RequestAppointment = require('../models/requestAppointment');

// Protect the route using the middleware
router.post('/request', protectRoute, async (req, res) => {
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
      username: req.user.username,
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

router.get('/all', protectRoute, async (req, res) => {
  try {
    // Retrieve all appointment requests from the database
    const appointmentRequests = await RequestAppointment.find({});

    // Return a JSON response with the list of all appointment requests
    res.status(200).json({
      message: 'All appointment requests retrieved successfully.',
      appointmentRequests: appointmentRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching appointment requests.' });
  }
});

// routes/appointment.js
// UPdate Status
router.put('/update/:id', protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    // Update the status of the specified appointment request
    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { status: status } },
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    const action = status === 'approved' ? 'approved' : 'rejected'; // Determine the action based on status
    
    // Update notifications
    updatedRequest.notifications.push({
      action: action,
      timestamp: new Date(),
    });
    await updatedRequest.save();

    res.status(200).json({
      message: `Appointment request ${action} successfully.`,
      updatedRequest: {
        _id: updatedRequest._id,
        user: updatedRequest.user,
        reason: updatedRequest.reason,
        urgency: updatedRequest.urgency,
        status: updatedRequest.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the appointment request status.' });
  }
});


router.put('/schedule/:id', protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { scheduledDate } = req.body;

    // Update the scheduledDate of the specified appointment request
    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { scheduledDate: scheduledDate } },
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    res.status(200).json({
      message: 'Counseling session scheduled successfully.',
      updatedRequest: {
        _id: updatedRequest._id,
        user: updatedRequest.user,
        reason: updatedRequest.reason,
        urgency: updatedRequest.urgency,
        status: updatedRequest.status,
        scheduledDate: updatedRequest.scheduledDate,
      },
    });
    // Inside the route to schedule an appointment
// After updating the scheduled date
updatedRequest.notifications.push({
  action: 'scheduled',
  timestamp: new Date(),
});
await updatedRequest.save();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while scheduling the counseling session.' });
  }
});

router.put('/edit-schedule/:id', protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { scheduledDate } = req.body;

    // Update the scheduled date of the specified appointment request
    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { scheduledDate: scheduledDate } },
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    res.status(200).json({
      message: 'Counseling session schedule updated successfully.',
      updatedRequest: {
        _id: updatedRequest._id,
        user: updatedRequest.user,
        reason: updatedRequest.reason,
        urgency: updatedRequest.urgency,
        status: updatedRequest.status,
        scheduledDate: updatedRequest.scheduledDate,
      },
    });
    // Inside the route to schedule an appointment
// After updating the scheduled date
updatedRequest.notifications.push({
  action: 'scheduled Changed',
  timestamp: new Date(),
});
await updatedRequest.save();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the counseling session schedule.' });
  }
});


router.get('/notifications', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    const appointmentRequests = await RequestAppointment.find({ user: userId });

    const notifications = appointmentRequests.reduce((acc, request) => {
      return acc.concat(request.notifications);
    }, []);

    res.status(200).json({
      message: 'Notifications retrieved successfully.',
      notifications: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching notifications.' });
  }
});

router.get('/notification-counts', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    const notificationCounts = {};

    // Retrieve notification counts for each user-specific item
    const notifications = await RequestAppointment.find({ user: userId });

    // Count the notifications for each type of action (e.g., 'approved', 'scheduled', etc.)
    notifications.forEach((notification) => {
      notification.notifications.forEach((notif) => {
        if (notif.action in notificationCounts) {
          notificationCounts[notif.action]++;
        } else {
          notificationCounts[notif.action] = 1;
        }
      });
    });

    res.status(200).json({ notificationCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching notification counts.' });
  }
});

module.exports = router;

