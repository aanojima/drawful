var wg = require('./word-generator');

exports.Game = function(gameId,gameSocket,rounds){
	// TODO
	// _socket.to(gameId).emit("", {});
	var self = {};

	const _ROUNDS = rounds || 1;

	var _gameId = gameId;
	var _socket = gameSocket;
	var _roundsLeft = rounds || 1;

	var _players = {};
	var _playersLeft = {};

	// States
	var _currentPlayer = undefined;
	var _currentImage = undefined;
	var _currentOptions = [];
	var _mapOptionToPlayerName = {};

	self.getId = function(){
		return _gameId;
	}

	self.hasPlayer = function(username){
		return _players.hasOwnProperty(username);
	}

	self.addPlayer = function(player){
		_players[player.getName()] = player;
		_socket.emit("player-added", { username : player.getName() });
		if (Object.keys(_players).length == 8){
			startGame();
		}
	}

	self.removePlayer = function(username){
		if (self.hasPlayer(username)){
			_players[username] = undefined;
			delete _players[username];
		}
	}

	function startGame(){
		_socket.to(_gameId).emit('game-started', {});
		startRound();
	}

	function startRound(){
		if (_roundsLeft <= 0){
			return gameOver();
		}
		for (var pkey in _players){
			_playersLeft[pkey] = _players[pkey];
		}
		_socket.emit('round-started', {});
		_roundsLeft -= 1;
		for (pkey in _players){
			var word = wg.newWord();
			var player = _players[pkey];
			_words[pkey] = word;
			player.sendWord(word);
		}
		_socket.emit('drawing-started', {});
	}

	function randomPlayer() {
		var keys = Object.keys(_playersLeft);
		var player = _players[keys[ keys.length * Math.random() << 0]];
		delete _playersLeft[player.getName()];
		return player;
	};

	function startTurn() {
		if (Object.keys(_playersLeft).length == 0){
			startRound();
		}
		_currentPlayer = randomPlayer();
		_playersThisRound[_currentPlayer.getName()] = true;
		_currentPlayer.waitForFakes();
		_currentImage = player.getImage();
		_socket.emit('show-drawing', { image : _currentImage });
		for (var pkey in _players){
			if (_currentPlayer.getName() == pkey){
				continue;
			}
			var other = _players[pkey];
			other.startFakeStage();
		}
	}

	function gameOver(){
		var results = {};
		for (var pkey in _players){
			var score = _players[pkey].getScore();
			results[pkey] = score;
			_players[pkey].showResult();
		}
		_socket.emit("game-over", { results : results });
		// TODO - disconnect and tie up loose ends
	}

	// Event Listeners
	_socket.on('game-start', function(data){
		startGame();
	});

	_socket.on('drawing-time-finish', function(data){
		startTurn();
	});

	_socket.on('fake-stage-finish', function(data){
		// Have other players pick fakes and selections
		var answer = _words[_currentPlayer.getName()];
		_currentOptions = [];
		_mapOptionToPlayerName = {};
		var others = [];
		// TODO traverse in random order!!!
		for (var pkey in _players){
			var player = _players[pkey];
			if (_currentPlayer.getName() == pkey){
				_currentOptions.push(answer);
			} else {
				others.push(player);
				_currentOptions.push(player.getFake());
			}
			_mapOptionToPlayerName[_currentOptions.length-1] = player;
		}
		for (var i in others){
			var other = others[i];
			other.startGuessStage(options);
		}
		_socket.emit('show-options', { options : options });
	});

	_socket.on('guess-stage-finish', function(data){
		var username = _currentPlayer.getName()
		var answer = _words[username];
		var results = {};
		var points = {};

		// Player gets 500 points if other players select his or her fake phrase
		// Player gets 1000 points if he or she guesses the actual title
		// Drawer gets 1000 points for each player that guesses the actual title

		// (1) if A's fake matches B's guess, A gets 500 points
		// (2) if A's guess matches the actual answer, A gets 1000 points
		// (3) drawer gets the 1000 times the number of correct guesses
		for (var pkey in _players){
			points[pkey] = 0;
			if (username == pkey){
				continue;
			}
			var other = _players[pkey];
			var guess = other.getGuess();
			var faker = _mapOptionToPlayerName[guess];
			if (faker == username){
				points[username] = 1000 + (points[pkey] || 0);
				_currentPlayer.addPoints(1000);
				points[pkey] = 1000 + (points[pkey] || 0);
				other.addPoints(1000);
			} else if (faker != pkey){
				points[pkey] = 500 + (points[pkey] || 0);
				other.addPoints(500);
			} else {
				// Error Faker Picked His Own Answer
				// TODO: Handle Error
			}
			results[pkey] = {
				fake : other.getFake(),
				guess : other.getGuess()
			};
		}
		_socket.to(_gameId).emit("show-results", {
			drawer : username,
			answer : answer,
			mapping : _mapOptionToPlayerName,
			results : results,
			points : points
		});
	});

	_socket.on('start-next-turn', function(data){
		startTurn();
	})

	_socket.on('disconnect', function(info){
		_socket.to(_gameId).emit('game-disconnected', info);
	});

	// Initialized Setup
	// Tell game client that game has been created > change UI
	_socket.emit("game-created", { gameId : _gameId });

	return self;
}