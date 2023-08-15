const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/jwt');
const User = require('../models/userSchema');
const RequestAppointment = require('../models/requestAppointment');

router.post('/send-notification', adminProtect, async (req, res) => {
  try {
    const adminId = req.user._id;

    const admin = await User.findById(adminId).select('username');

    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    const notificationMessage = `${admin.username} sent an appointment request.`;

    const notification = {
      action: 'request_created',
      message: notificationMessage,
      timestamp: new Date(),
    };

    admin.notifications.push(notification); // <-- Error occurs here
    await admin.save();

    res.status(200).json({
      message: 'Notification sent to admin successfully.',
      notification: notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while sending admin notification.' });
  }
});

module.exports = router;
