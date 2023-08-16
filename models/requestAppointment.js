const mongoose = require('mongoose');

const requestAppointmentSchema = new mongoose.Schema(
  {
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
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    scheduledDate: {
      type: String,
    },
    counselingToken: { // Add this field for the counseling token
      type: String,
    },
    notifications: [
      {
        action: {
          type: String,
          required: true,
        },
        timestamp: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const RequestAppointment = mongoose.model('RequestAppointment', requestAppointmentSchema);

module.exports = RequestAppointment;
