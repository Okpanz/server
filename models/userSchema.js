const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  hashed_matric_number: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
required:false
  },
  activeChats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the other user in the chat
    },
  ],
  chatMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage', // Reference to the chat messages
    },],
  notifications: [
    {
      action: String,
      message: String,
      timestamp: Date,
    },
  ]
});



const User = mongoose.model('User', userSchema);

module.exports = User;
