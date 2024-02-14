// App.js
import React, { useState } from 'react'; // Import useState
import Search from './Search';
import Chat from './Chat';
import './App.css';

function App() {
  const [artistName, setArtistName] = useState('');
  const [currentArtist, setCurrentArtist] = useState(null);
  const [openChatCheck, setOpenChatCheck] = useState(false);

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
        {currentArtist && openChatCheck && <Chat artist={currentArtist} setOpenChatCheck={setOpenChatCheck} />}
        {!openChatCheck && <Search openChat={openChat} handleArtistClick={handleArtistClick} />}
      </div>
    </div>
  );
}

export default App;