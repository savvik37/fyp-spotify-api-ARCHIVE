// Search.js
import React, { useState, useEffect } from 'react';
import {searchArtists, searchAlbums} from './SpotifyService';
import fallbackImage from './assets/fallbackimg.jpg';

const Search = ({openChat, setSearchState, searchState }) => {
  const [query, setQuery] = useState(searchState || '');
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    setQuery(searchState);
  }, [searchState]);

  const search = async () => {
    setSearchState(query);
    const artistResults = await searchArtists(query);
    const artistsWithAlbums = await Promise.all(artistResults.map(async artist => {
      const albumResults = await searchAlbums(artist.id);
      return { ...artist, albums: albumResults };
    }));
    setArtists(artistsWithAlbums);
  };

  useEffect(() => {
    if (searchState) {
      search();
    }
  }, [searchState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    search();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='SearchBar'>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Search</button>
      </form>
        <div className='MainContainer'>
        {artists.map(artist => (
        <div key={artist.id} className='ArtistBox' onClick={() => openChat(artist.name)}>
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