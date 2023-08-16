const express = require('express');
const router = express.Router();
const { protectRoute, adminProtect } = require('../middleware/jwt');
const RequestAppointment = require('../models/requestAppointment');
const User = require('../models/userSchema');

// ... (other routes)

// ... (other imports and middleware)

router.post('/request', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains user information

    const { reason, urgency } = req.body;

    const appointmentRequest = new RequestAppointment({
      user: userId,
      reason: reason,
      urgency: urgency,
    });

    await appointmentRequest.save();

    const admin = await User.findOne({ isAdmin: true });

    if (admin) {
      const adminNotification = {
        action: 'new_appointment',
        message: `${userId} sent an appointment request.`,
        timestamp: new Date(),
      };

      admin.notifications.push(adminNotification);
      await admin.save();
    }

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
router.get('/all', protectRoute, adminProtect, async (req, res) => {
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
// ... (other routes)

router.put('/update/:id', protectRoute, adminProtect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    const action = status === 'approved' ? 'approved' : 'rejected';

    updatedRequest.notifications.push({
      action: action,
      timestamp: new Date(),
      message: `Your appointment request has been ${action}.`,
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

    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { scheduledDate: scheduledDate } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    updatedRequest.notifications.push({
      action: 'scheduled',
      timestamp: new Date().toISOString(),
      scheduledDate: scheduledDate,
      message: `Your counseling session has been scheduled for ${new Date(scheduledDate).toLocaleString()}`,
    });

    await updatedRequest.save();

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while scheduling the counseling session.' });
  }
});

router.put('/edit-schedule/:id', protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { scheduledDate } = req.body;

    const updatedRequest = await RequestAppointment.findByIdAndUpdate(
      requestId,
      { $set: { scheduledDate: scheduledDate } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    updatedRequest.notifications.push({
      action: 'scheduled Changed',
      timestamp: new Date().toISOString(),
      scheduledDate: scheduledDate,
      message: `Your counseling session schedule has changed to ${new Date(scheduledDate).toLocaleString()}`,
    });

    await updatedRequest.save();

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the counseling session schedule.' });
  }
});

router.post('/send-token/:id', protectRoute, adminProtect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { token } = req.body;

    const appointmentRequest = await RequestAppointment.findById(requestId);

    if (!appointmentRequest) {
      return res.status(404).json({ message: 'Appointment request not found.' });
    }

    appointmentRequest.counselingToken = token;

    appointmentRequest.notifications.push({
      action: 'counseling_token_sent',
      timestamp: new Date().toISOString(),
      token: token,
      message: `A counseling token has been sent for your appointment request. Token: ${token}`,
    });

    await appointmentRequest.save();

    res.status(200).json({
      message: 'Counseling token sent successfully.',
      updatedRequest: {
        _id: appointmentRequest._id,
        user: appointmentRequest.user,
        reason: appointmentRequest.reason,
        urgency: appointmentRequest.urgency,
        status: appointmentRequest.status,
        counselingToken: appointmentRequest.counselingToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while sending the counseling token.' });
  }
});

// ... (other routes)
// ... (other imports and middleware)

function getDetailedMessage(notification) {
  switch (notification.action) {
    case 'approved':
      return `Your appointment request has been approved. Scheduled date: ${notification.scheduledDate}`;
    case 'rejected':
      return 'Your appointment request has been rejected.';
    case 'scheduled':
      return `Your counseling session has been scheduled for ${notification.scheduledDate}`;
    case 'scheduled Changed':
      return `Your counseling scheduled has changed to ${notification.scheduledDate}`;
    case 'counseling_token_sent':
      return `A counseling token has been sent for your appointment request. Token: ${notification.token}`;
    default:
      return 'New notification received.';
  }
}

// ... (other routes)

router.get('/notifications', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    const appointmentRequests = await RequestAppointment.find({ user: userId });

    const notifications = appointmentRequests.reduce((acc, request) => {
      return acc.concat(request.notifications);
    }, []);

    const notificationsWithFormattedDetails = notifications.map((notification) => {
      const formattedTimestamp = new Date(notification.timestamp).toLocaleString();
      const scheduledDate = notification.scheduledDate
        ? new Date(notification.scheduledDate).toLocaleString()
        : '';

      const detailedMessage = getDetailedMessage(notification);

      return {
        ...notification,
        formattedTimestamp,
        scheduledDate,
        detailedMessage,
      };
    });

    res.status(200).json({
      message: 'Notifications retrieved successfully.',
      notifications: notificationsWithFormattedDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching notifications.' });
  }
});

// ... (other imports and middleware)

// ... (other routes)

// ... (other middleware and functions)

// Define a route to get all events in detail JSON for a particular user
router.get('/user-events/:userId', protectRoute, async (req, res) => {
  try {
    const userId = req.params.userId;

    const appointmentRequests = await RequestAppointment.find({ user: userId });

    const events = appointmentRequests.map((request) => {
      const formattedTimestamp = new Date(request.createdAt).toLocaleString();
      const eventDetails = {
        _id: request._id,
        action: 'appointment_request',
        timestamp: formattedTimestamp,
        details: {
          reason: request.reason,
          urgency: request.urgency,
          status: request.status,
          scheduledDate: request.scheduledDate,
          counselingToken: request.counselingToken,
        },
        notifications: request.notifications.map((notification) => ({
          action: notification.action,
          timestamp: new Date(notification.timestamp).toLocaleString(),
          message: notification.message,
        })),
      };

      return eventDetails;
    });

    res.status(200).json({
      message: 'User events retrieved successfully.',
      events: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching user events.' });
  }
});

// ... (other imports and middleware)

// ... (other routes)

// ... (other middleware and functions)

// Define a route to get all events in detail JSON for the authenticated user
router.get('/user-events', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    const appointmentRequests = await RequestAppointment.find({ user: userId });

    const events = appointmentRequests.map((request) => {
      const formattedTimestamp = new Date(request.createdAt).toLocaleString();
      const eventDetails = {
        _id: request._id,
        action: 'appointment_request',
        timestamp: formattedTimestamp,
        details: {
          reason: request.reason,
          urgency: request.urgency,
          status: request.status,
          scheduledDate: request.scheduledDate,
          counselingToken: request.counselingToken,
        },
        notifications: request.notifications.map((notification) => ({
          action: notification.action,
          timestamp: new Date(notification.timestamp).toLocaleString(),
          message: notification.message,
          token: notification.token, // Include the token sent by the admin
        })),
        fullDetails: request, // Include the full details of the appointment request
      };

      return eventDetails;
    });

    res.status(200).json({
      message: 'User events retrieved successfully.',
      events: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching user events.' });
  }
});

// ... (other routes)

module.exports = router;
