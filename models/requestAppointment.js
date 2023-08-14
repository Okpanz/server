const mongoose = require('mongoose');

const requestAppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  scheduledDate: {
    type: Date, // You can adjust the type to match your needs
  },
  notifications: [
    {
      action: String,
      timestamp: Date,
    }
  ]
});

const RequestAppointment = mongoose.model('RequestAppointment', requestAppointmentSchema);

module.exports = RequestAppointment;
