const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/chatMessage');
const { protectRoute } = require('../middleware/jwt'); // Correct import

// POST route to send a message
router.post('/send', protectRoute, async (req, res) => {
  const { sender, recipient, message } = req.body;

  try {
    const newMessage = new ChatMessage({
      user: sender,
      recipientUser: recipient,
      message,
    });

    await newMessage.save();

    // Emit the message to the recipient using Socket.io
    req.io.to(recipient).emit('receive_message', newMessage);

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'An error occurred while sending the message' });
  }
});

// GET route to get messages between two users
router.get('/:sender/:recipient', protectRoute, async (req, res) => {
  const { sender, recipient } = req.params;

  try {
    const messages = await ChatMessage.find({
      $or: [
        { user: sender, recipientUser: recipient },
        { user: recipient, recipientUser: sender },
      ],
    }).sort({ timestamp: 'asc' });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'An error occurred while fetching messages' });
  }
});

module.exports = router;
