import axios from 'axios'; //axios import for http requests
import { clientPriv, clientSecretPriv } from './privTokens.js'; //importing client id and secret from privTokens.js - for security

const client_id = clientPriv; //initialising client id
const client_secret = clientSecretPriv; //initialising client secret
let token = ''; //initialising token

//async function to get token
const getToken = async () => { 
    const result = await axios('https://accounts.spotify.com/api/token', { //POST request to Spotify API
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret), //base64 encoding: client id and secret
      },
      data: 'grant_type=client_credentials',
      method: 'POST'
    });
  
    token = result.data.access_token; //setting token to access token from result
};
  
  //async function to search for artists
  const searchArtists = async (artistId) => { 
    if (!token) await getToken(); //if not token present, call getToken
  
    const result = await axios(`https://api.spotify.com/v1/search?q=${artistId}&type=artist`, { //GET request to Spotify API
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token } //including token in headers
    });
  
    return result.data.artists.items; //returning artists from result
  };

  //async function to search for albums
  const searchAlbums = async (artistId) => {
    if (!token) await getToken(); //if token not present, call getToken
  
    const result = await axios(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token } //including token in headers
    });
  
    console.log(result.data); //logging result data
    return result.data.items.slice(0, 6); //returning first 6 albums
  };
  
  export { searchArtists, searchAlbums }; //exporting searchArtists and searchAlbums functions