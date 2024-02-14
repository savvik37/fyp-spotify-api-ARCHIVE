import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

const Chat = ({ artist, setOpenChatCheck }) => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket = io('http://localhost:3001');
  
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join room', artist); // Join a room for this artist
    });

    socket.on('chat message', (msg) => {
      console.log(`Received message: ${msg.message}`);
      setChat((chat) => [...chat, msg]); // Use function form of setChat
    });

    // Retrieve messages for this artist
    socket.emit('get messages', artist, (messages) => {
      setChat(messages);
    });

    return () => {
      socket.emit('leave room', artist); // Leave the room when the component unmounts
      socket.disconnect();
    };
  }, [artist]); // Remove chat from the dependency array

  const chatCloseHandler = () => {
    setOpenChatCheck(false);
  };
  
  const submitMessage = (e) => {
    e.preventDefault();
    console.log(`Sending message: ${message}`);
    socket.emit('chat message', { artist, message }, (response) => {
    console.log('Server response:', response);
     }); // Include the artist in the message
    setMessage('');
  };

  return (
    <div>
      <form onSubmit={submitMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
      {chat.map((msg, index) => (
            <div key={index} className='MessageText'>{msg.message}</div>
        ))}
        <button onClick={chatCloseHandler}>Close Chat</button>
    </div>
  );
};

export default Chat;