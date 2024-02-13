// Search.js
import React, { useState } from 'react';
import searchArtists from './SpotifyService';
import fallbackImage from './assets/fallbackimg.jpg';

const Search = () => {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);

  const search = async (e) => {
    e.preventDefault();
    const results = await searchArtists(query);
    setArtists(results);
  };

  return (
    <div>
      <form onSubmit={search} className='SearchBar'>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Search</button>
      </form>
      {artists.map(artist => (
        <div key={artist.id} className='ArtistBox'>
            <div className='ArtistBoxHeader'>
                <h2 className='ArtistBoxName'>{artist.name}</h2>
                <h2 className='ArtistBoxPopularity'>Popularity: {artist.popularity}</h2>
            </div>
            <img 
                
                src={artist.images[0]?.url || fallbackImage} 
            
                alt={artist.name} 
                
                className='ArtistBoxImg' 
                
                onError={(e)=>{e.target.onerror = null; e.target.src=fallbackImage}}/>
        
        </div>
      ))}
    </div>
  );
};

export default Search;