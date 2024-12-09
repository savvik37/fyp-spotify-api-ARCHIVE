import React, { useState, useEffect } from 'react';
import {searchArtists, searchAlbums} from './SpotifyService'; //importing searchArtists and searchAlbums functions from SpotifyService
import fallbackImage from './assets/fallbackimg.jpg'; //importing fallback image if no image is found

const Search = ({openChat, setSearchState, searchState }) => {
  const [query, setQuery] = useState(searchState || ''); //query state - equal to searchState or empty string
  const [artists, setArtists] = useState([]); //artists state - empty array

  useEffect(() => {
    setQuery(searchState); //updating query with value of searchState
  }, [searchState]);

  const search = async () => { //async function to search for artists
    setSearchState(query); //setting searchState to query
    const artistResults = await searchArtists(query); //waiting for searchArtists to return results - results are stored in artistResults
    const artistsWithAlbums = await Promise.all(artistResults.map(async artist => { //waiting for all artists to have their albums fetched
      const albumResults = await searchAlbums(artist.id); //waiting for searchAlbums to return results - results are stored in albumResults
      return { ...artist, albums: albumResults }; //returning artist object with albums property
    }));
    setArtists(artistsWithAlbums); //updating artists state with artistsWithAlbums
  };

  useEffect(() => {
    if (searchState) {
      search(); //calling search function
    }
  }, [searchState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    search(); //calling search function
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