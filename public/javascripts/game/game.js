function Game(socket){
	var self = {};

	var _socket = socket;

	_numPlayers = 0;

	_playersFinishedDrawing = 0;
	_playersFinishedFaking = 0;
	_playersFinishedGuessing = 0;

	function allPlayersFinishedDrawing(){
		return _playersFinishedDrawing == _numPlayers;
	}

	function allPlayersFinishedFaking(){
		return _playersFinishedFaking == _numPlayers - 1;
	}

	function allPlayersFinishedGuessing(){
		return _playersFinishedGuessing == _numPlayers - 1;
	}

	_socket.on('game-error', function(error){
		console.log(error);
	});

	_socket.on('connection-error', function(error){
		console.log(error);
	});

	_socket.on("game-started", function(data){
		console.log(data);
		_numPlayers = data.numPlayers;
	});

	_socket.on("drawing-started", function(data){
		console.log("drawing-started");
		_playersFinishedDrawing = 0;
		setTimeout(function(){
			console.log("drawing-finish");
			_socket.emit("drawing-time-finish");
		}, 10000);
	});

	_socket.on("faking-started", function(data){
		console.log("faking-started");
		_playersFinishedFaking = 0;
		setTimeout(function(){
			console.log("fake-stage-finish");
			_socket.emit("fake-stage-finish")
		}, 10000);
	});

	_socket.on("guessing-started", function(data){
		console.log("guessing-started");
		_playersFinishedGuessing = 0;
		setTimeout(function(){
			console.log("guess-stage-finish");
			_socket.emit("guess-stage-finish");
		}, 10000);
	});

	_socket.on("show-results", function(data){
		console.log("RESULTS: ", data);
		setTimeout(function(){
			_socket.emit("start-next-turn");
		}, 10000);
	});

	_socket.on("drawing-stored", function(data){
		var username = data.username;
		_playersFinishedDrawing += 1;
		if (_playersFinishedDrawing == _numPlayers){
			console.log("all-drawings-submitted");
			_socket.emit("all-drawings-submitted");
		}
	});

	_socket.on("fake-stored", function(data){
		var username = data.username;
		_playersFinishedFaking += 1;
		console.log("fake-stored");
		if (_playersFinishedFaking == _numPlayers - 1){
			console.log("all-fakes-submitted");
			_socket.emit("all-fakes-submitted");
		}
	});

	_socket.on("guess-stored", function(data){
		var username = data.username;
		_playersFinishedGuessing += 1;
		console.log("guess-stored");
		if (_playersFinishedGuessing == _numPlayers - 1){
			_socket.emit("all-guesses-submitted");
		}
	});

	_socket.emit('create-game');

	return self;
}