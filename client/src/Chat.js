import React, { useEffect, useState, useRef } from 'react'; //importing react and hooks from react lib
import io from 'socket.io-client'; //socket.io import

const Chat = ({ setOpenChatCheck, artist, sId, username}) => { //chat component with props
  const [message, setMessage] = useState(''); //message state
  const [chat, setChat] = useState([]); //chat state
  const [usr, setUsername] = useState(''); //username state - !! debugging: had a real pickle with this one !!
  const socket = useRef(); //socket ref
  const localTheme = useRef(); //localtheme ref for user-relative styling - !! debugging: worked temporarily but broke it in the end !!
  
  useEffect(() => { //using useEffect hook - re-renders the component when dependencies change
    console.log('useEffect triggered');
    socket.current = io('ws://192.168.0.82:3001'); //setting socket value to the server address

    //fetch chat history
    console.log('Fetching messages');
    fetch(`http://192.168.0.82:3001/messages/${artist}`) //sending a GET request to the server, 
      .then(response => { //declaring callback for when response is received
        console.log('Raw response:', response); //logging response - debugging
        response.clone().text().then(text => console.log('Response body:', text)); //log the response body - more debugging
        return response.json(); //returning the response as JSON object - returning a promise
      })
      .then(data => { //callback for when json data is received
        console.log('Parsed data:', data); //logging data received
        const messages = data.map(item => ({ text: item.text, sender: item.sender })); //mapping data to a messages array
        setChat(messages); //setting chat state to messages array
        console.log('Fetched messages:', messages); //logging fetched messages
      })
      .catch(err => console.error(err)); //catching and logging any errors - callback
    
    socket.current.on('connect', () => { //event listener for connect event
      console.log('Socket connection established'); //logging succesful connection
      console.log('Local socket id:', socket.current.id); //log the local socket id
      localTheme.current = socket.current.id.slice(0, 5);//update localTheme here
      socket.current.emit('join room', artist); //emitting join room event with artist name

      socket.current.emit('login', username); //emitting login evetn with username

      //log the username of the user who has just joined
      socket.current.on('user joined', (username) => {
        setUsername(username); //updating "usr" state with the username
      });
    });

    socket.current.on('chat message', (data) => { //event listener for chat message event
      console.log('Incoming message data:', data); //log entire data object - debugging
      console.log('Incoming message text:', data.message); //log message text - debugging
      console.log('Incoming message sender:', username); //log the sender - debugging
    
      const newMessage = { text: data.message, sender: data.username, userSent: username === username }; //new message object - not fixed username situation
      console.log('New message received in Chat:', newMessage, 'from ', socket.current.id); //log the new message - debugging
      setChat((oldChat) => [...oldChat, newMessage]); //update chat state with new message
    });

    return () => { //cleanup when component unmounts
      socket.current.disconnect(); //disconnect socket
      console.log('Socket connection disconnected'); //log disconnection
    };
  }, [artist, sId, username]);

  //send message function - takes event object as parameter
  const sendMessage = (e) => {
    e.preventDefault(); //preventing default submit
    if (message) {
      socket.current.emit('chat message', { sender: username, artist: artist, message: message }); //emitting chat message event with message object.
      console.log(`message sent from ${username} to ${artist}: ${message}`); //log the message sent - debugging
      console.log(`Sent message to ${artist}: ${message}`); //log the message sent - debugging
      setMessage(''); //reset message state to empty
    }
  };

  const closeChat = () => { //close chat function
    socket.current.disconnect(); //disconnecting from socket
    setOpenChatCheck(false); //setting open chat check state to false
  };

  //chat component jsx
  return (
    <div>

      {console.log('Current chat state:', chat)}
      
      <div className='messageSender'>
        <form onSubmit={sendMessage}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
           placeholder="Type a message..."
          />
         <button type="submit">Send</button>
        </form>
        
      </div>

      <div className='ArtistChatBox'>
        <h2>{artist}</h2>
        <button onClick={closeChat}>Close Chat</button>
      </div>
      
      <div className='MessageBox'>
        {chat.map((chat, index) => (
          <div key={index}>
            <p className={chat.sender === sId ? 'user-message' : 'message'}>{chat.sender}: {chat.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;