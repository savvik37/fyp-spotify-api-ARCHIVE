import React, { useState } from 'react';
import Search from './Search';
import Login from './Login';
import Chat from './Chat';
import './App.css';

import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [artistName, setArtistName] = useState('');
  const [auth, setAuth] = useState(false);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [openChatCheck, setOpenChatCheck] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [searchState, setSearchState] = useState('');
  const [username, setUsername] = useState('');

  const handleNewMessage = (message) => {
    console.log('new message received in app:', message);
    setLatestMessage(message);
  };

  const handleArtistClick = (name) => {
    setArtistName(name);
  };

  const openChat = (artist) => {
    console.log(`Opening chat for ${artist}`);
    setCurrentArtist(artist);
    setOpenChatCheck(true);
  };

  const handleLogin = (username) => {
    setUsername(username);
    console.log('Logged in as:', username)
    setAuth(true);
    //saving user login status - this doesnt work 0_o
    localStorage.setItem('auth', true);
  };

  return (
    <div className='App'>

      {auth === false && <Login onLogin={handleLogin} socket={socket}/>}

      {!username == '' && <p>user: <b>{username}</b></p>}

      {!openChatCheck && <h1 className="mainH1">AudioSync</h1>}
      <div>
        {latestMessage && (
        <div className="LatestMessage">
          Latest Message: {latestMessage.artist}: {latestMessage.message}
        </div>
      )}
        {currentArtist && openChatCheck && <Chat artist={currentArtist} setOpenChatCheck={setOpenChatCheck} onNewMessage={handleNewMessage} username={username}/>}
        {auth && !openChatCheck && <Search openChat={openChat} handleArtistClick={handleArtistClick} setSearchState={setSearchState} searchState={searchState}/>}
      </div>
    </div>
  );
}

export default App;