const express = require('express');
const mongoose = require("mongoose")
const connectDB = require('./config/db')
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Import your models, middleware, and routes
const authRoute = require('./controllers/authController');
const requestAppointment = require('./routes/requestAppointment');
const adminNotification = require('./routes/adminNotificationRoute');
const userListRoute = require('./routes/userListRoute');
const chatRoute = require('./routes/chatRoute'); // Import the updated chatRoute

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

connectDB()
// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://counselling-frontend-tb9r.vercel.app',
    methods: ['GET', 'POST'],
  },
});

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Route handling
app.use('/auth', authRoute);
app.use('/api', requestAppointment);
app.use('/api/admin', adminNotification);
app.use('/api/admin', userListRoute);
app.use('/api/chat', chatRoute); // Use the updated chatRoute

// Start Socket.io connection



io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
