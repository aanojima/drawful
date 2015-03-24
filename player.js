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
	_currentGuess = undefined;
	_currentFake = undefined;
	_currentSelection = undefined;

	self.getId = function(){
		return _gameId;
	}

	self.getName = function(){
		return _username;
	}

	self.getGuess = function(){
		// TODO - make sure defined
		return _currentGuess;
	}

	self.getFake = function(){
		return _currentFake;
	}

	self.getSelection = function(){
		return _currentSelection;
	}

	self.getScore = function(){
		return _score;
	}

	self.addPoints = function(points){
		_score += points;
	}

	self.sendWord = function(word){
		_socket.emit('drawing-word', { word : word });
	}

	self.getDrawing = function(){
		return _drawing;
	}

	self.waitForGuesses = function(){
		_socket.emit('wait-for-guesses', {});
	}

	self.startGuessing = function(){
		_socket.emit('start-guessing', {});
	}

	self.makeFakesAndSelections = function(options){
		_socket.emit('prompt-fake-and-selection', { options : options });
	}

	self.showResult = function(){
		_socket.emit('game-over-self-score', { username : _username, score : _score });
	}

	_socket.on('drawing-submitted', function(data){
		_drawing = data.image;
		_socket.emit('drawing-stored', {});
	});

	_socket.on('submit-guess', function(data){
		_currentGuess = data.guess;
	});

	_socket.on('submit-fake', function(data){
		_currentFake = data.fake;
	});

	_socket.on('submit-selection', function(data){
		_currentSelection = data.selection;
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