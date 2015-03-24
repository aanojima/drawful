exports.Player = function(gameId,playerSocket,username){
	// TODO
	// _socket.to(gameId).emit("", {});
	var self = {};

	var _gameId = gameId;
	var _socket = playerSocket;
	var _username = username;

	var _drawing = undefined;
	var _score = 0;

	// States
	_currentFake = undefined;
	_currentGuess = undefined;

	self.getId = function(){
		return _gameId;
	}

	self.getName = function(){
		return _username;
	}

	self.getScore = function(){
		return _score;
	}

	self.getDrawing = function(){
		return _drawing;
	}

	self.getFake = function(){
		return _currentFake;
	}

	self.getGuess = function(){
		return _currentGuess;
	}

	self.addPoints = function(points){
		_score += points;
	}

	self.sendWord = function(word){
		_socket.emit('drawing-word', { word : word });
	}

	self.waitForFakes = function(){
		_socket.emit('wait-for-fakes', {});
	}

	self.startFakeStage = function(){
		_socket.emit('start-fake-stage', {});
	}

	self.startGuessStage = function(options){
		_socket.emit('start-guess-stage', { options : options });
	}

	self.showResult = function(){
		_socket.emit('game-over-self-score', { username : _username, score : _score });
	}

	_socket.on('drawing-submitted', function(data){
		_drawing = data.image;
		_socket.emit('drawing-stored', {});
	});

	_socket.on('submit-fake', function(data){
		_currentFake = data.fake;
	});

	_socket.on('submit-guess', function(data){
		_currentGuess = data.guess;
	});

	_socket.on('add-points', function(data){
		// TODO
	});

	_socket.on('disconnect', function(info){
		_socket.to(_gameId).emit('player-disconnect');
	});

	// Initialized Setup
	// TODO - tell other players that this player


	return self;
}