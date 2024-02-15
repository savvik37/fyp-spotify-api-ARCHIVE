# fyp-spotify-api
Basic exercise for Spotify API w/ the help of copilot. I am new to react as of this md file and using this to get good.

## What is this?
This is a simple group chat app which allows you to join group chats dedicated to music artists, specifically ones from Spotify. The Spotify API is used to search and list artists, as well as their respective profile pictures and their last handful of releases.

Once you have searched an artist, simply click on their artist box to open the group chat.

## How to run the app
1. Start server.js in the client/src folder with node: node server.js
2. From client folder start the React App using yarn start or npm start
3. App should be running on port 3000

## More notes
- This app does not save messages at the moment, once page is refreshed they disappear.
- If search box is empty the React crashes.