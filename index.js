MAXNBRPLAYERS = 50;
CANVASSIZE = {
	width:1000,
	height:500
};
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nbrConn = 0;
var pressed = {space: false, left: false, up: false, down: false, bottom: false};
var pixelSpeed = 5;
var nbrPlayers = 0;
var coords = [];
for (var i = 0; i < MAXNBRPLAYERS; i++) {
	xCoord = Math.floor(Math.random() * CANVASSIZE.width);
	yCoord = Math.floor(Math.random() * CANVASSIZE.height);
	coords.push({x: xCoord, y: yCoord});
}
var playerIsConnected = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	nbrConn++;
	msg = 'a user connected - there are now ' + nbrConn + ' users online';
	console.log(msg);
	
	socket.on('get canvassize', function() {
		io.emit('canvas size', CANVASSIZE, coords, nbrPlayers);

	});
	
  socket.on('disconnect', function(){
	  nbrConn--;
	  msg = 'a user disconnected - there are now ' + nbrConn + ' users online';
    console.log(msg);
	for (var i = 0; i < nbrPlayers; i++) {
		playerIsConnected[i] = false;
	}
	io.emit('check connection');
	console.log('checking connections...');
	
	setTimeout(function() { // wait three seconds before destroying disconnected player pieces
		for (var i = 0; i < nbrPlayers; i++) {
			if (!playerIsConnected[i]) {
				console.log('removing game piece nbr ' + i);
				coords[i].x = -100; // doesn't really destroy game piece, but moves it outside of canvas forever
			}
		}
	}, 3000);
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('control request', function() {
	  console.log('control request received');
	if (nbrPlayers < MAXNBRPLAYERS) {
		io.emit('request response', nbrPlayers);
		nbrPlayers++;
		playerIsConnected.push(true);
	}
	else {
		io.emit('request response', -1);
	}
  });
  
  socket.on('confirm connection', function(nbr) {
	  playerIsConnected[nbr] = true;
	  console.log('player ' + nbr + ' is still connected');
  });

  socket.on('button pressed', function(nbr, playerNbr){
	  console.log('button pressed by player ' + playerNbr);
	  key = 'space';
	  if (nbr == 37) {
		  key = 'left';
		  coords[playerNbr].x = Math.max(coords[playerNbr].x-pixelSpeed, 0);
	  }
	  if (nbr == 38) {
		  key = 'up';
		  coords[playerNbr].y = Math.max(coords[playerNbr].y-pixelSpeed, 0);
	  }
	  if (nbr == 39) {
		  key = 'right';
		  coords[playerNbr].x = Math.min(coords[playerNbr].x+pixelSpeed, CANVASSIZE.width);
	  }
	  if (nbr == 40) {
		  key = 'down';
		  coords[playerNbr].y = Math.min(coords[playerNbr].y+pixelSpeed, CANVASSIZE.height);
	  }
	  io.emit('new pos', coords);
  });

});

http.listen(5000, function(){
  console.log('listening on *:5000');
});