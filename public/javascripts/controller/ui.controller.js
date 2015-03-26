function UIController(player){
	var self = {};

	var _socket = socket;

	var _drawingSubmitted = false;
	var _fakeSubmitted = false;
	var _guessSubmitted = false;

	$("#create-player-btn").click(function(e){
		var gameId = $("#game-id-input").val().toUpperCase();
		var username = $("#username-input").val();
		player.joinGame(gameId,username);
	});

	_socket.on("drawing-word", function(data){
		// TODO: clear canvas
		_drawingSubmitted = false;
		var word = data.word;
		$("#drawing-word").text(word);
	});

	$("#submit-drawing").click(function(e){
		submitDrawing();
	});

	$("#submit-fake").click(function(e){
		submitFake();
	});

	$("#submit-guess").click(function(e){
		submitGuess();
	});

	function submitDrawing(){
		console.log("I am submitting a drawing");
		if (_drawingSubmitted){
			return;
		}
		var canvas = $("#controller-canvas")[0];
		var imgData = canvas.toDataURL("image/png");
		_socket.emit("drawing-submitted", { image : imgData });
		_drawingSubmitted = true;
	}

	function submitFake(){
		console.log("I am submitting a fake");
		if (_fakeSubmitted){
			return;
		}
		var fake = $("#fake-input").val();
		_socket.emit("submit-fake", { fake : fake });
		_fakeSubmitted = true;
	}

	function submitGuess(){
		console.log("I am submitting a guess");
		if (_guessSubmitted){
			return;
		}
		var guess = parseInt(
			$("#options")
				.children()
				.children()
				.filter("input:checked")
				.val(),
			10);
		_socket.emit("submit-guess", { guess : guess });
		_guessSubmitted = true;
	}

	_socket.on("drawing-stored", function(data){
		console.log("drawing-stored");
	});

	_socket.on("drawing-time-up", function(data){
		console.log("Time's Up!");
		submitDrawing();
	});

	_socket.on('start-fake-stage', function(data){
		// New Turn
		$("#options").html("");
		_fakeSubmitted = false;
	});

	_socket.on("fake-stage-time-up", function(data){
		console.log("fake time up");
		submitFake();
	});

	_socket.on('start-guess-stage', function(data){
		_guessSubmitted = false;
		var options = data.options;
		var optionNumber = data.optionNumber;
		for (var i in options){
			if (i == optionNumber){
				continue;
			}
			var option = options[i];
			var optionInput = $("<input type='radio' name='guess'/>")
				.val(i)
				.data("option", i);
			var optionLabel = $("<label></label>").text(option);
			var optionDiv = $("<div></div>").append(optionInput).append(optionLabel);
			$("#options").append(optionDiv);
		}
		console.log('start-guess-stage');
	});

	_socket.on("guess-stage-time-up", function(data){
		console.log("guess time up");
		submitGuess();
	});

	_socket.on("turn-over", function(data){
		$("#options").html("");
	});

	return self;
}