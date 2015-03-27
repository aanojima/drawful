function Player(socket){
	var self = {};

	var _socket = socket;

	var _drawingSubmitted = false;
	var _fakeSubmitted = false;
	var _guessSubmitted = false;

	// UIController -> Player
	var playerHandlers = {
		"create-player" : createPlayer,
		"submit-drawing" : submitDrawing,
		"submit-fake" : submitFake,
		"submit-guess" : submitGuess
	};

	var _ui = UIController(playerHandlers);

	// Player Event Handlers (UIController -> Player)
	function createPlayer(data){
		_socket.emit("add-player", { gameId : data.gameId, username : data.username });
	}

	function submitDrawing(data){
		if (_drawingSubmitted){
			return;
		}
		var imgData = _ui.handle("get-drawing");
		_socket.emit("drawing-submitted", { image : imgData });
		_drawingSubmitted = true;
	}

	function submitFake(data){
		if (_fakeSubmitted){
			return;
		}
		var fake = _ui.handle("get-fake");
		_socket.emit("submit-fake", { fake : fake });
		_fakeSubmitted = true;
	}

	function submitGuess(data){
		if (_guessSubmitted){
			return;
		}
		var guess = _ui.handle("get-guess");
		_socket.emit("submit-guess", { guess : guess });
		_guessSubmitted = true;
	}

	// Player Event Listeners (Player -> UIController)
	_socket.on('game-error', function(error){
		console.log(error);
	});

	_socket.on('connection-error', function(error){
		console.log(error);
	});

	_socket.on('player-added', function(data){
		_ui.handle("player-added", data);
	});

	_socket.on("drawing-phrase", function(data){
		_drawingSubmitted = false;
		_ui.handle("drawing-phrase", data);
	});

	_socket.on("draw-stage-time-up", function(data){
		_ui.handle("draw-stage-time-up", data);
		submitDrawing();
	});

	_socket.on("drawing-stored", function(data){
		_ui.handle("drawing-stored", data);
	});

	_socket.on("start-turn", function(data){
		_ui.handle("start-turn", data);
	});

	_socket.on("wait-for-fakes", function(data){
		_ui.handle("wait-for-fakes", data);
	});

	_socket.on("start-fake-stage", function(data){
		_fakeSubmitted = false;
		_ui.handle("start-fake-stage", data);
	});

	_socket.on("fake-stage-time-up", function(data){
		_ui.handle("fake-stage-time-up", data);
		submitFake();
	});

	_socket.on("fake-stored", function(data){
		_ui.handle("fake-stored", data);
	});

	_socket.on('start-guess-stage', function(data){
		_guessSubmitted = false;
		_ui.handle("start-guess-stage", data);
	});

	_socket.on("guess-stage-time-up", function(data){
		_ui.handle("guess-stage-time-up", data);
		submitGuess();
	});

	_socket.on("guess-stored", function(data){
		_ui.handle("guess-stored", data);
	});

	_socket.on("turn-over", function(data){
		_ui.handle("turn-over", data);
	});

	return self;
}