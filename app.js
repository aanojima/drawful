var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');
var session = require('express-session');
var idGenerator = require('./id-generator');
var Game = require('./game').Game;
var Player = require('./player').Player;

var routes = require('./routes/index');
var users = require('./routes/users');
var whiteboard = require('./routes/whiteboard');

var app = express();

// IO
var connect = require('connect');
var sessionStore = new connect.middleware.session.MemoryStore();
var SessionSockets = require('session.socket.io');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: '1234567890QWERTY', store : sessionStore, resave : false, saveUninitialized : false }));

app.use('/', routes);
app.use('/users', users);
// TODO change routing for whiteboard
app.use('/whiteboard', whiteboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

// Server Socket - DO I NEED SESSIONS?
app.games = {};
var sessionIO = new SessionSockets(io, sessionStore, cookieParser);
sessionIO.on('connection', function(err, socket, session){

  // Runtime Debug Information
  console.log("Socket User Connected");
  
  // Session variable safety check
  if (!session){
    socket.disconnect();
    return;
  }

  socket.on('create-game', function(data){
    if (session.type){
      socket.emit("connection-error", "Connection has already been intialized");
      return;
    }
    // game creates a new room
    session.type = "game";
    var gameId = idGenerator.generateId();
    socket.join(gameId);
    session.game_id = gameId;
    var game = Game(gameId,socket,1);
    games[gameId] = game;
  });

  socket.on('add-player', function(data){
    if (session.type){
      socket.emit('connection-error', "Connection has already been initialized");
      return;
    }
    // add new player
    if (!data.gameId || !games.hasOwnProperty(data.gameId)){
      socket.emit('game-error', "Invalid game id");
    }
    if (!data.username || data.username == ""){
      socket.emit('game-error', "Username cannot be blank");
      return;
    }
    // check if username already exists
    var gameId = data.gameId;
    var username = data.username;
    var game = games[gameId];
    if (games[gameId].hasPlayer(username)){
      socket.emit('game-error', "Username already taken");
    }
    session.type = "player";
    session.username = username;
    socket.join(gameId);
    var player = Player(gameId,socket,username);
    game.addPlayer(player);
  });

});

// Run Everything
app.listen(8000, function(){
  console.log("listening on port 8000");
});