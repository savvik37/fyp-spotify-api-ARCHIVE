const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.0.0.1:3000", "http://192.168.0.82:3000"], // Allow only origin http://localhost:3000
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = 3001;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (artist) => {
     socket.join(artist);
    io.to(artist).emit('user joined', socket.id);
  });

  socket.on('leave room', (artist) => {
    socket.leave(artist);
  });

  socket.on('chat message', ({ artist, message }) => {
    console.log(`Received message from ${socket.id.slice(0,5)}: ${message}`);
    io.to(artist).emit('chat message', { id: socket.id, message });
    console.log(`${socket.id} sent message to room ${artist}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
    console.log('listening on ' + port);
});