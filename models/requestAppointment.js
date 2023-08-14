// models/requestAppointment.js
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
});

const RequestAppointment = mongoose.model('RequestAppointment', requestAppointmentSchema);

module.exports = RequestAppointment;
