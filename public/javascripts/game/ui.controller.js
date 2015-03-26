function UIController(socket){
	var self = {};

	var _socket = socket;

	_socket.on('game-created', function(data){
		$("#game-id").text(data.gameId);
	});

	_socket.on('player-added', function(data){
		var newPlayerEntry = $("<div></div>");
		newPlayerEntry
			.data("username", data.username)
			.text("User " + data.username + " has joined");
		$("#player-list").append(newPlayerEntry);
	});

	_socket.on('player-disconnected', function(data){
		var playerName = data.username;
		$("#player-list").children().filter(function(){
			return $(this).data("username") == playerName;
		}).remove();
	});

	$("#game-start-btn").click(function(e){
		_socket.emit("game-start");
	});

	_socket.on("round-started", function(data){
		// TODO
	});

	_socket.on("show-drawing", function(data){
		$("#options").html("");
		var imgData = data.image;
		$("#drawing").attr("src", imgData);
	});

	_socket.on("show-options", function(data){
		console.log("show options");
		var options = data.options;
		for (var i in options){
			var option = options[i];
			var optionDiv = $("<div></div>").text(option);
			$("#options").append(optionDiv);
		}
	});

	_socket.on("game-over", function(data){
		console.log("GAME OVER");
	});

	return self;
}