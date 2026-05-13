const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

app.use(express.static('public'));

let spelare = [];

io.on('connection', (socket) => {
  console.log('Spelare ansluten:', socket.id);

  spelare.push(socket.id);
 if (spelare.length === 2) {
    io.emit('starta_spel');
    console.log('Båda spelare inne - spelet startar!');
  }
