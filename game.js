var wg = require('./word-generator');

exports.Game = function(gameId,gameSocket,rounds){
	// TODO
	// _socket.to(gameId).emit("", {});
	var self = {};

	var _gameId = gameId;
	var _socket = gameSocket;
	var _roundsLeft = rounds || 1;

	var _players = {};
	var _playersLeft = {};

	// States
	var _currentPlayer = undefined;
	var _currentImage = undefined;

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
		_currentPlayer.waitForGuesses();
		_currentImage = player.getImage();
		_socket.emit('present-drawing', { image : _currentImage });
		for (var pkey in _players){
			if (_currentPlayer.getName() == pkey){
				continue;
			}
			var other = _players[pkey];
			other.startGuessing();
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

	_socket.on('guessing-time-finish', function(data){
		// Have other players pick fakes and selections
		var options = [_words[_currentPlayer.getName()]];
		var others = [];
		for (var pkey in _players){
			if (_currentPlayer.getName() == pkey){
				continue;
			}
			var other = _players[pkey];
			others.push(other);
			options.push(other.getGuess());
		}
		for (var i in others){
			var other = others[i];
			other.makeFakesAndSelections(options);
		}
		_socket.emit('present-options', { options : options });
	});

	_socket.on('selection-time-finish', function(data){
		// TODO: optimize
		var answer = _words[_currentPlayer.getName()];
		var actual = { _currentPlayer.getName() : answer };
		var results = {};
		var points = {};
		for (var pkey in _players){
			points[pkey] = 0;
			if (_currentPlayer.getName() == pkey){
				continue;
			}
			var other = _players[pkey];
			results[pkey] = {
				guess : other.getGuess(),
				fake : other.getFake(),
				selection : other.getSelection()
			};
		}
		// Player gets 500 points if other players select his or her fake phrase
		// Player gets 1000 points if he or she guesses the actual title
		// Drawer gets 1000 points for each player that guesses the actual title

		// (1) if A's fake matches B's selection, A gets 500 points
		// (2) if A's selection matches the actual answer, A gets 1000 points
		// (3) drawer gets the 1000 times the number of correct people that are in (2)
		var drawerPoints = 0;
		for (var pkeyA in results){
			var fakeA = results[pkeyA].fake;
			var selectionA = results[pkeyA].selection;
			var fakeoutCount = 0;
			for (var pkeyB in results){
				if (pkeyA == pkeyB){
					continue;
				}
				var selectionB = results[pkeyB].selection;
				if (fakeA == selectionB){
					points[pkeyA] += 500;
				}
			}
			if (selectionA == answer){
				points[pkeyA] += 1000;
				drawerPoints += 1000;
			}
		}
		points[_currentPlayer.getName()] = drawerPoints;
		for (var pkey in _players){
			var player = _players[pkey];
			var newPoints = points[pkey] || 0;
			player.addPoints(newPoints);
		}
		_socket.to(_gameId).emit("show-results", {
			actual : actual,
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