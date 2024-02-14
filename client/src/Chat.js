import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const Chat = ({ setOpenChatCheck, artist, sId}) => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const socket = useRef();

  useEffect(() => {
    socket.current = io('ws://localhost:3001');
    
    socket.current.on('connect', () => {
      console.log('Socket connection established');
      // Emit the 'join room' event when the socket connection is established
      socket.current.emit('join room', artist); // Emitting with the artist's name
    });

    socket.current.on('chat message', (data) => {
      const newMessage = { ...data, id: generateUniqueId() };
      console.log('New message received in Chat:', newMessage);
      setChat((oldChat) => [...oldChat, newMessage]); // Update chat state with the new message
    });

    return () => {
      socket.current.disconnect();
      console.log('Socket connection disconnected');
    };
  }, [artist]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      const newMessage = { artist: artist, message: message, id: generateUniqueId() };
      //setChat((oldChat) => [...oldChat, newMessage]); // Update local state with sent message
      socket.current.emit('chat message', { sId: sId, artist: artist, message: message });
      console.log(`Sent message to ${artist}: ${message}`);
      setMessage(''); // Clear message input after sending
    }
  };

  const closeChat = () => {
    socket.current.disconnect();
    setOpenChatCheck(false);
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9); // Example of generating a random ID
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
      <ul>
        {chat.map((msg) => (
          <li className='message' key={msg.id}>{msg.artist} {msg.message}</li>
        ))}
      </ul>
      <button onClick={closeChat}>Close Chat</button>
    </div>
  );
};

export default Chat;
