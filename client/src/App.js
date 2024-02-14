// App.js
import React, { useState } from 'react'; // Import useState
import Search from './Search';
import Chat from './Chat';
import './App.css';

function App() {
  const [artistName, setArtistName] = useState('');
  const [currentArtist, setCurrentArtist] = useState(null);
  const [openChatCheck, setOpenChatCheck] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [searchState, setSearchState] = useState('');

  const handleNewMessage = (message) => {
    console.log('New message received in App:', message);
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

  return (
    <div className='App'>
      <div>
        {latestMessage && (
        <div className="LatestMessage">
          Latest Message: {latestMessage.artist}: {latestMessage.message}
        </div>
      )}
        {currentArtist && openChatCheck && <Chat artist={currentArtist} setOpenChatCheck={setOpenChatCheck} onNewMessage={handleNewMessage} />}
        {!openChatCheck && <Search openChat={openChat} handleArtistClick={handleArtistClick} setSearchState={setSearchState} searchState={searchState}/>}
      </div>
    </div>
  );
}

export default App;