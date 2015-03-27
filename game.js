var pg = require('./phrase-generator');

exports.Game = function(gameId,gameSocket,rounds){

	var self = {};

	const _ROUNDS = rounds || 1;

	var _gameId = gameId;
	var _socket = gameSocket;
	var _roundsLeft = rounds || 1;
	var _phrases = {};
	var _players = {};
	var _playersLeft = [];

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
		_socket.to(_gameId).emit("player-added", { username : player.getName() });
		_socket.emit("player-added", { username : player.getName() });
		if (Object.keys(_players).length == 8){
			startGame();
		}
	}

	self.removePlayer = function(username){
		// TODO IF HAPPENS DURING GAME
		if (self.hasPlayer(username)){
			_players[username] = undefined;
			delete _players[username];
			_socket.emit('player-disconnected', { username : username });
			_socket.to(_gameId).emit('player-disconnected', { username : username });
		}
	}

	function startGame(){
		var data = { numPlayers : Object.keys(_players).length };
		_socket.to(_gameId).emit('game-started', data);
		_socket.emit('game-started', data);
		startRound();
	}

	function startRound(){
		if (_roundsLeft <= 0){
			return gameOver();
		}
		_playersLeft = Object.keys(_players);
		_socket.emit('round-started', {});
		_roundsLeft -= 1;
		for (pkey in _players){
			var phrase = pg.newPhrase();
			var player = _players[pkey];
			_phrases[pkey] = phrase;
			player.sendPhrase(phrase);
		}
		_socket.emit('drawing-started', {});
	}

	function randomPlayer() {
		var playerName = _playersLeft.splice(_playersLeft.length * Math.random() << 0, 1)[0];
		var player = _players[playerName];
		return player;
	};

	function startTurn() {
		if (_playersLeft.length == 0){
			return startRound();
		}
		_currentPlayer = randomPlayer();
		_currentImage = _currentPlayer.getDrawing();
		_socket.emit('show-drawing', { image : _currentImage });
		_currentPlayer.waitForFakes();
		for (var pkey in _players){
			if (_currentPlayer.getName() == pkey){
				continue;
			}
			var other = _players[pkey];
			other.startFakeStage();
		}
		_socket.emit('faking-started');
	}

	function startGuessing() {
		var username = _currentPlayer.getName();
		var answer = _phrases[username];
		_currentOptions = [];
		_mapOptionToPlayerName = {};
		var others = [];
		var mapPlayerNameToOption = {};
		// TODO traverse in random order!!!
		for (var pkey in _players){
			var player = _players[pkey];
			if (username == pkey){
				_currentOptions.push(answer);
			} else {
				others.push(player);
				_currentOptions.push(player.getFake());
			}
			var optionNumber = _currentOptions.length-1;
			_mapOptionToPlayerName[optionNumber] = pkey;
			mapPlayerNameToOption[pkey] = optionNumber;
		}
		_currentPlayer.waitForGuesses();
		for (var i in others){
			var other = others[i];
			var otherName = other.getName();
			var optionNumber = mapPlayerNameToOption[otherName];
			other.startGuessStage(_currentOptions, optionNumber);
		}
		_socket.emit('show-options', { options : _currentOptions });
		_socket.emit('guessing-started');
	}

	function updateAndNotifyScores() {
		var username = _currentPlayer.getName()
		var answer = _phrases[username];
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
				points[username] = 1000 + (points[username] || 0);
				_currentPlayer.addPoints(1000);
				points[pkey] = 1000 + (points[pkey] || 0);
				other.addPoints(1000);
			} else if (faker != pkey){
				points[faker] = 500 + (points[faker] || 0);
				_players[faker].addPoints(500);
			} else {
				// Error Faker Picked His Own Answer
				// TODO: Handle Error
			}
			results[pkey] = {
				fake : other.getFake(),
				guess : other.getGuess()
			};
		}
		_socket.emit("show-results", {
			drawer : username,
			answer : answer,
			mapping : _mapOptionToPlayerName,
			results : results,
			points : points
		});
		_socket.to(_gameId).emit("turn-over");
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
		_socket.to(_gameId).emit('drawing-time-up');
	});

	_socket.on('all-drawings-submitted', function(data){
		startTurn();
	});

	_socket.on('fake-stage-finish', function(data){
		for (var pkey in _players){
			if (pkey != _currentPlayer.getName()){
				var player = _players[pkey];
				player.requireFake();
			}
		}
	});

	_socket.on('all-fakes-submitted', function(data){
		// Have other players pick fakes and selections
		startGuessing();
	});

	_socket.on('guess-stage-finish', function(data){
		for (var pkey in _players){
			if (pkey != _currentPlayer.getName()){
				var player = _players[pkey];
				player.requireGuess();
			}
		}
	});

	_socket.on('all-guesses-submitted', function(data){
		updateAndNotifyScores()
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