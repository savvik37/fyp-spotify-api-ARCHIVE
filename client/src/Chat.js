import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const Chat = ({ setOpenChatCheck, artist, sId}) => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const socket = useRef();
  const localTheme = useRef(); // Use useRef instead of useState

  useEffect(() => {
    socket.current = io('ws://192.168.0.82:3001');
    
    socket.current.on('connect', () => {
      console.log('Socket connection established');
      console.log('Local socket id:', socket.current.id); // Log the local socket id
      localTheme.current = socket.current.id; // Update localTheme here
      socket.current.emit('join room', artist);
    });

    socket.current.on('chat message', (data) => {
      console.log('Incoming message sId:', data.id);
      console.log('Current user sId:', data.id);
      const newMessage = { ...data, userSent: data.id === sId };
      console.log('New message received in Chat:', newMessage);
      setChat((oldChat) => [...oldChat, newMessage]);
    });

    return () => {
      socket.current.disconnect();
      console.log('Socket connection disconnected');
    };
  }, [artist, sId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.current.emit('chat message', { sId: socket.current.id, artist: artist, message: message });
      console.log(`message sent from ${socket.current.id} to ${artist}: ${message}`);
      console.log(`Sent message to ${artist}: ${message}`);
      setMessage('');
    }
  };

  const closeChat = () => {
    socket.current.disconnect();
    setOpenChatCheck(false);
  };

  return (
    <div>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message"
        />
        <button type="submit">Send</button>
      </form>
      <div className='MessageBox'>
        {chat.map((msg, index) => (
          <div key={index}>
            <p className="sender-id">Sender ID: {msg.id}</p>
            <p className={`message ${msg.id === localTheme.current ? 'user-message' : ''}`}>{msg.message}</p>
          </div>
        ))}
      </div>
      <button onClick={closeChat}>Close Chat</button>
    </div>
  );
};

export default Chat;