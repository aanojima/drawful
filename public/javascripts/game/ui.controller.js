function UIController(gameHandlers){
	var self = {};

	_gameHandlers = gameHandlers;

	self.handle = function(event,data){
		if (_gameEvents.hasOwnProperty(event)){
			return _gameEvents[event](data);
		}
	}

	var _gameEvents = {
		"game-created" : gameCreated,
		"player-added" : playerAdded,
		"player-disconnected" : playerDisconnected,
		"game-started" : gameStarted,
		"round-started" : roundStarted,
		"drawing-started" : drawingStarted,
		"draw-stage-finish" : drawStageFinish,
		"drawing-stored" : drawingStored,
		"all-drawings-submitted" : allDrawingsSubmitted,
		"start-turn" : startTurn,
		"show-drawing" : showDrawing,
		"faking-started" : fakingStarted,
		"fake-stage-finish" : fakeStageFinish,
		"fake-stored" : fakeStored,
		"all-fakes-submitted" : allFakesSubmitted,
		"show-options" : showOptions,
		"guessing-started" : guessingStarted,
		"guess-stage-finish" : guessStageFinish,
		"guess-stored" : guessStored,
		"all-geusses-submitted" : allGuessesSubmitted,
		"show-results" : showResults,
		"game-over" : gameOver,
	};

	function gameCreated(data){
		$("#game-id").text(data.gameId);
	}

	function playerAdded(data){
		var newPlayerEntry = $("<div></div>");
		newPlayerEntry
			.data("username", data.username)
			.text("User " + data.username + " has joined");
		$("#player-list").append(newPlayerEntry);
	}

	function playerDisconnected(data){
		var playerName = data.username;
		$("#player-list").children().filter(function(){
			return $(this).data("username") == playerName;
		}).remove();
	}

	function gameStarted(data){
		// TODO
	}

	function roundStarted(data){
		// TODO
	}

	function drawingStarted(data){
		// TODO
	}

	function drawStageFinish(data){
		// TODO
	}

	function drawingStored(data){
		// TODO
	}

	function allDrawingsSubmitted(data){
		// TODO
	}

	function startTurn(data){
		// TODO
	}

	function showDrawing(data){
		$("#options").html("");
		var imgData = data.image;
		$("#drawing").attr("src", imgData);
	}

	function fakingStarted(data){
		// TODO
	}

	function fakeStageFinish(data){
		// TODO
	}

	function fakeStored(data){
		// TODO
	}

	function allFakesSubmitted(data){
		// TODO
	}

	function showOptions(data){
		var options = data.options;
		for (var i in options){
			var option = options[i];
			var optionDiv = $("<div></div>").text(option);
			$("#options").append(optionDiv);
		}
	}

	function guessingStarted(data){
		// TODO
	}

	function guessStageFinish(data){
		// TODO
	}

	function guessStored(data){
		// TODO
	}

	function allGuessesSubmitted(data){
		// TODO
	}

	function showResults(data){
		console.log("RESULTS: ", data);
	}

	function gameOver(data){
		console.log("GAME OVER");
	}

	$("#game-start-btn").click(function(e){
		return _gameHandlers["game-start"]();
	});

	return self;
}