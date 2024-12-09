//importing required modules
const express = require('express'); //express.js for building the server
const cors = require('cors'); //CORS for handling cross-origin sharing
const http = require('http'); //http for creating the server
const socketIo = require('socket.io'); //socket.io for real-time communication
const bcrypt = require('bcrypt'); //bcrypt for hashing passwords
const jwt = require('jsonwebtoken'); //jsonwebtoken for generating tokens

//loading environment variables - never used
require('dotenv').config()

//setting up mongodb client
const MongoClient = require('mongodb').MongoClient; //mongodb client for connecting to mongodb
const uri = "mongodb+srv://up2019511:UfDhTrFIpaYNwdZH@cluster0.gw2oqlq.mongodb.net/spotifySearchDb?retryWrites=true&w=majority"; //mongodb connection string - mongodb atlas
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); //creating a new mongodb client

//connecting to mongodb
client.connect(err => {
  if (err) throw err; //throw error if error present
  console.log("Connected to MongoDB server"); //logging succesful connection
  //client.close(); // use when need to close connection
});

//connecting mongodb collections
const db = client.db("spotifySearchDb"); //connecting to the database "spotifySearchDb"
const chats = db.collection("chats"); //connecting the "chats" collection
const messages = db.collection("messages"); //connecting the "messages" collection
const users = db.collection("users"); //connecting the "users" collection

//setting up middleware and express app
const app = express(); //creatring an express app
app.use(express.json()); //using express.json middleware for json parsing
app.use(cors({
  origin: ["http://localhost:3000", "http://192.0.0.1:3000", "http://192.168.0.82:3000"], //allowing cors for respective origins
  credentials: true //allowing credentials
}));

//setting up http server and socket.io
const server = http.createServer(app); //creating a http server using express app
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.0.0.1:3000", "http://192.168.0.82:3000"], //allowing cors for respective origins
    methods: ["GET", "POST"], //allowing get and post methods
    credentials: true
  }
});

const port = 3001; //initialising port

//register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body; //extracting username and password from request body

  //check if the username is already taken
  const existingUser = await users.findOne({ username }); //searching for user with given username
  if (existingUser) {
    // if user with given username exists, return a status 400 - "username is already taken"
    return res.status(400).json({ message: 'Username is already taken' });
  }

  //hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  //save the new user to user collection in mongodb
  const user = { username, password: hashedPassword };
  await users.insertOne(user);

  res.sendStatus(201); //status 201 - "user created"
});

//create a map to store socket IDs and usernames
const socketToUsername = new Map();

//authentication endpoint
app.post('/auth', async (req, res) => {
  const { username, password } = req.body; //extracting username and password from request body
  const user = await users.findOne({ username }); //searching for user with given username

  //check if the user exists and password matches
  if (!user) {
    //if user does not exist, return status 400 - "invalid username or password"
      return res.status(400).json({ message: 'Invalid username or password' });
  }
  const passwordMatch = await bcrypt.compare(password, user.password); //comparing the password with the hashed password
  if (!passwordMatch) {
    //if passwords do not match, return status 400 - "invalid username or password"
      return res.status(400).json({ message: 'Invalid username or password' });
  }

  //generate a jwt token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); //singing a jwt with the user id and secret, expiration set to 1 hour

  console.log(`User ${username} logged in`); //log the user login

  res.json({ accessToken: token }); //sending jwt token as response
});

//socket.io connection event
io.on('connection', (socket) => {
  console.log('a user connected with socket ID ' + socket.id); //logging the socked id of the connected user

   //listen for the 'login' event
   socket.on('login', (username) => {
    console.log(`User ${username} logged in`); //logging that user has logged in

    //update the socketToUsername map
    socketToUsername.set(socket.id, username); //mapping the socket id to the username in map

    //log the socketToUsername map
    console.log('socketToUsername map:', socketToUsername); //logging current state of socketToUsername map
  });

  //socket.io disconnect event
  socket.on('disconnect', () => {
    console.log('user disconnected'); //logging when user disconnects

    //remove the socket ID from the socketToUsername map upon disconnect
    socketToUsername.delete(socket.id);
  });

  console.log('a user connected with socket ID', socket.id); //logging the socket id of connected user
  console.log('socketToUsername map:', socketToUsername); //logging the current state of socketToUsername map

  //join room socket.io event
  socket.on('join room', async (artist) => { //make the callback async
    socket.join(artist); //joining room with artist name
    const usernameFromServer = socketToUsername.get(socket.id); //retriving username from map using socket id
    io.to(artist).emit('user joined', usernameFromServer); //emitting user joined event to the room

    try {
      //use await to wait for the findOne method to finish - searching chat collection for chat with artist name
      const chat = await chats.findOne({ name: artist });

      //if the chat doesn't exist, insert a new one
      if (!chat) {
        const res = await chats.insertOne({ name: artist }); //if no chat exists, insert a new chat with artist name
        console.log("Chat created for artist: " + artist, res.ops[0]); //logging the creating of the new chat
      } else {
        console.log("Chat already exists for artist: " + artist, chat); //if chat is found, logging that it already exists
      }
    } catch (err) {
      console.error(err); //logging error if one occurs
    }
  });

  socket.on('leave room', (artist) => {
    socket.leave(artist); //leaving the room with artist name
  });

  //chat message event listener
  socket.on('chat message', ({ artist, message }) => {
    //get the username from the map using the socket ID
    const usernameFromServer = socketToUsername.get(socket.id); //retrieving the username associated with socket id from map
    
    console.log(`Received message from ${usernameFromServer}: ${message}`); //logging received message from user
    io.to(artist).emit('chat message', { username: usernameFromServer, message }); //emitting chat message to the room - message and message sender are sent with event
    console.log(`Sent message from ${usernameFromServer} to ${artist}: ${message}`); //logging the message sent and user that sent it

    console.log('Username:', usernameFromServer); //logging usernamke of sender - !! debugging: had an issue with username not being sent !!

    //saving messages to mongodb with usernames
    messages.insertOne({ chat: artist, sender: usernameFromServer, text: message}, (err, res) => { //inserting message to messages collection along with username and artist name(respective chat)
      if (err) throw err; //throw an err upon error
      console.log("Message sent: ", res.ops[0]); //logging message sent - debugging
    });
  });

  //disconnect event listener
  socket.on('disconnect', () => {
    console.log('user disconnected'); //loging the user disconnect
    //remove user from map
    socketToUsername.delete(socket.id); //removing the user from the map upon disconnect
  });
});

//get chat history endpoint
app.get('/chat-history/:artist', async (req, res) => { 
  const artist = req.params.artist; //retrieving artist name from request parameters
  try {
    const chatHistory = await messages.find({ chat: artist }).toArray(); //searching messages collection for artist name
    console.log('Chat history:', chatHistory); //log chat history
    res.json(chatHistory); //sending chat history as a json response
  } catch (err) { //catching errors in db operation
    console.error(err);
    res.status(500).send('Error retrieving chat history');
  }
});

//setting up get endpoints for messages
app.get('/messages/:artist', async (req, res) => {
  const artist = req.params.artist; //retrieving artist name from request parameters
  try {
    const artistMessages = await messages.find({ chat: artist }).toArray(); //searching messages collection for artist name
    console.log(`Messages for ${artist}:`, artistMessages); //logging messages for artist
    res.json(artistMessages); //sending messages for artist as a json response
  } catch (err) { //cathcing errors in db operation
    console.error(err);
    res.status(500).send('Error retrieving messages for artist');
  }
});

//setting up all messages endpoint - !! debugging: added this endpoint to check all messages in db !!
app.get('/all-messages', async (req, res) => {
  try {
    const allMessages = await messages.find().toArray(); //searching messages collection for all messages
    console.log('All messages:', allMessages); //logging all messages
    res.json(allMessages); //sending all messages as a json response
  } catch (err) { //catching errors in db operation
    console.error(err);
    res.status(500).send('Error retrieving all messages');
  }
});

//server listening on port initialised prior
server.listen(port, () => {
  console.log('listening on ' + port);
});