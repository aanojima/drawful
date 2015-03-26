function Player(socket){
	var self = {};

	var _socket = socket;

	self.joinGame = function(gameId,username){
		_socket.emit("add-player", { gameId : gameId, username : username });
	}

	_socket.on('game-error', function(error){
		console.log(error);
	});

	_socket.on('connection-error', function(error){
		console.log(error);
	});

	_socket.on('player-added', function(data){
		console.log(data);
	});

	return self;
}