const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose'); // Import Mongoose

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true, useUnifiedTopology: true});

// Define Mongoose schema for messages
const messageSchema = new mongoose.Schema({
    artist: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

// Create Mongoose model for messages
const Message = mongoose.model('Message', messageSchema);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow only origin http://localhost:3000
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = 3001;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (artist) => {
    socket.join(artist);
  });

  socket.on('leave room', (artist) => {
    socket.leave(artist);
  });

  socket.on('chat message', async ({ artist, message }) => {
    console.log('chat message event handler called');
    console.log(`Received message from ${artist}: ${message}`);
    io.to(artist).emit('chat message', { artist, message });
    console.log(`Sent message to room ${artist}`);

    // Save the message to the database
    const newMessage = new Message({ artist, message });
    try {
      await newMessage.save();
      console.log('Message saved to database:', newMessage);
    } catch (err) {
      console.error('Error saving message to database:', err);
    }
  });

  socket.on('get messages', async (artist, callback) => {
    try {
      const messages = await Message.find({ artist });
      console.log('Retrieved messages from database:', messages);
      callback(messages);
    } catch (err) {
      console.error(err);
      callback([]);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
    console.log('listening on ' + port);
});