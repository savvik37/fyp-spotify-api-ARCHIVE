import axios from 'axios';
import { clientPriv, clientSecretPriv } from './privTokens.js';

const client_id = clientPriv;
const client_secret = clientSecretPriv;
let token = '';

const getToken = async () => {
    const result = await axios('https://accounts.spotify.com/api/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
      },
      data: 'grant_type=client_credentials',
      method: 'POST'
    });
  
    token = result.data.access_token;
};

  const searchArtists = async (artistId) => {
    if (!token) await getToken();
  
    const result = await axios(`https://api.spotify.com/v1/search?q=${artistId}&type=artist`, {
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token }
    });
  
    return result.data.artists.items;
  };

  const searchAlbums = async (artistId) => {
    if (!token) await getToken();
  
    const result = await axios(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token }
    });
  
    console.log(result.data); // Add this line
    return result.data.items.slice(0, 6);
  };
  
  export { searchArtists, searchAlbums };