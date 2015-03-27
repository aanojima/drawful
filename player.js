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
	var _currentFake = undefined;
	var _currentGuess = undefined;

	self.getId = function(){
		return (_gameId || "");
	}

	self.getName = function(){
		return (_username || "");
	}

	self.getScore = function(){
		return (_score || 0);
	}

	self.getDrawing = function(){
		return (_drawing || "");
	}

	self.getFake = function(){
		return (_currentFake || "");
	}

	self.getGuess = function(){
		return (_currentGuess || 0);
	}

	self.addPoints = function(points){
		_score += points;
	}

	self.sendWord = function(phrase){
		_socket.emit('drawing-phrase', { phrase : phrase });
	}

	self.waitForFakes = function(){
		_socket.emit('wait-for-fakes', {});
	}

	self.startFakeStage = function(){
		_socket.emit('start-fake-stage', {});
	}

	self.waitForGuesses = function(){
		_socket.emit('wait-for-guesses', {});
	}

	self.startGuessStage = function(options, optionNumber){
		_socket.emit('start-guess-stage', { options : options, optionNumber : optionNumber });
	}

	self.showResult = function(){
		_socket.emit('game-over-self-score', { username : _username, score : _score });
	}

	self.requireFake = function(){
		_socket.emit('fake-stage-time-up');
	}

	self.requireGuess = function(){
		 _socket.emit('guess-stage-time-up');
	}

	_socket.on('drawing-submitted', function(data){
		_drawing = data.image;
		_socket.to(_gameId).emit('drawing-stored', { username : _username });
	});

	_socket.on('submit-fake', function(data){
		_currentFake = data.fake;
		_socket.to(_gameId).emit('fake-stored', { username : _username });
	});

	_socket.on('submit-guess', function(data){
		_currentGuess = data.guess;
		_socket.to(_gameId).emit('guess-stored', { username : _username });
	});

	return self;
}