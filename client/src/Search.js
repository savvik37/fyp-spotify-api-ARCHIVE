// Search.js
import React, { useState } from 'react';
import {searchArtists, searchAlbums} from './SpotifyService';
import fallbackImage from './assets/fallbackimg.jpg';

const Search = () => {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);

  const search = async (e) => {
    e.preventDefault();
    const artistResults = await searchArtists(query);
    const artistsWithAlbums = await Promise.all(artistResults.map(async artist => {
      const albumResults = await searchAlbums(artist.id);
      return { ...artist, albums: albumResults };
    }));
    setArtists(artistsWithAlbums);
  };

  return (
    <div>
      <form onSubmit={search} className='SearchBar'>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Search</button>
      </form>
        <div className='MainContainer'>
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
                onError={(e)=>{e.target.onerror = null; e.target.src=fallbackImage}}
            />
            <div className='ArtistBoxAlbums'>
                {artist.albums.map(album => (
                  <div key={album.id} className='Album'>
                    <p className='ArtistBoxAlbumName'>{album.name}</p>
                    <img src={album.images[0]?.url || fallbackImage} alt={album.name} />
                  </div>
                ))}
            </div>
        </div>
      ))}
        </div>
    </div>
  );
};

export default Search;