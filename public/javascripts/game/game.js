function Game(socket){
	var self = {};

	var _socket = socket;

	_numPlayers = 0;

	var _playersFinishedDrawing = 0;
	var _playersFinishedFaking = 0;
	var _playersFinishedGuessing = 0;

	// UIController -> Game
	var gameHandlers = {
		"game-start" : gameStart
	};

	var _ui = UIController(gameHandlers)

	// Game Handlers (UIController -> Game)
	function gameStart(data){
		_socket.emit("game-start");
	}

	// Game Event Listeners (Game -> UIController)
	_socket.on('game-created', function(data){
		_ui.handle("game-created", data);
	});

	_socket.on('player-added', function(data){
		_ui.handle("player-added", data);
	});

	_socket.on('player-disconnected', function(data){
		_ui.handle("player-disconnected", data);
	});

	_socket.on("game-started", function(data){
		_numPlayers = data.numPlayers;
		_ui.handle("game-started", data);
	});

	_socket.on("round-started", function(data){
		_ui.handle("round-started", data);
	});

	_socket.on("drawing-started", function(data){
		_playersFinishedDrawing = 0;
		_ui.handle("drawing-started", data);
		setTimeout(function(){
			_socket.emit("draw-stage-finish");
			_ui.handle("draw-stage-finish");
		}, 10000);
	});

	_socket.on("drawing-stored", function(data){
		var username = data.username;
		_playersFinishedDrawing += 1;
		_ui.handle("drawing-stored", data);
		if (_playersFinishedDrawing == _numPlayers){
			_socket.emit("all-drawings-submitted");
			_ui.handle("all-drawings-submitted", data);
		}
	});

	_socket.on("start-turn", function(data){
		_ui.handle("start-turn", data);
	});

	_socket.on("show-drawing", function(data){
		_ui.handle("show-drawing", data);
	});

	_socket.on("faking-started", function(data){
		_playersFinishedFaking = 0;
		_ui.handle("faking-started", data);
		setTimeout(function(){
			_socket.emit("fake-stage-finish");
			_ui.handle("fake-stage-finish");
		}, 10000);
	});

	_socket.on("fake-stored", function(data){
		var username = data.username;
		_playersFinishedFaking += 1;
		_ui.handle("fake-stored", data);
		if (_playersFinishedFaking == _numPlayers - 1){
			_socket.emit("all-fakes-submitted");
			_ui.handle("all-fakes-submitted", data);
		}
	});

	_socket.on("show-options", function(data){
		_ui.handle("show-options", data);
	});

	_socket.on("guessing-started", function(data){
		_playersFinishedGuessing = 0;
		_ui.handle("guessing-started", data);
		setTimeout(function(){
			_socket.emit("guess-stage-finish");
			_ui.handle("guess-stage-finish");
		}, 10000);
	});

	_socket.on("guess-stored", function(data){
		var username = data.username;
		_playersFinishedGuessing += 1;
		_ui.handle("guess-stored", data);
		if (_playersFinishedGuessing == _numPlayers - 1){
			_socket.emit("all-guesses-submitted");
			_ui.handle("all-guesses-submitted", data);
		}
	});

	_socket.on("show-results", function(data){
		_ui.handle("show-results", data);
		setTimeout(function(){
			_socket.emit("start-next-turn");
			_ui.handle("start-turn");
		}, 10000);
	});

	_socket.on("game-over", function(data){
		_ui.handle("game-over", data);
	});

	_socket.on('game-error', function(error){
		console.log(error);
	});

	_socket.on('connection-error', function(error){
		console.log(error);
	});

	// UTILITY FUNCTIONS
	function allPlayersFinishedDrawing(){
		return _playersFinishedDrawing == _numPlayers;
	}

	function allPlayersFinishedFaking(){
		return _playersFinishedFaking == _numPlayers - 1;
	}

	function allPlayersFinishedGuessing(){
		return _playersFinishedGuessing == _numPlayers - 1;
	}

	// SETUP
	_socket.emit('create-game');

	return self;
}