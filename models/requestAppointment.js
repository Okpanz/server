const mongoose = require('mongoose');

const requestAppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  reason: { type: String, required: true },
  urgency: { type: Number, required: true, min: 1, max: 10 },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
});

const RequestAppointment = mongoose.model('RequestAppointment', requestAppointmentSchema);

module.exports = RequestAppointment;
