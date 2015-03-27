function UIController(playerHandlers){
	var self = {};

	_playerHandlers = playerHandlers;

	self.handle = function(event,data){
		if (_playerEvents.hasOwnProperty(event)){
			return _playerEvents[event](data);
		}
	}

	var _playerEvents = {
		"player-added" : playerAdded,
		"drawing-phrase" : drawingPhrase,
		"draw-stage-time-up" : drawStageTimeUp,
		"drawing-stored" : drawingStored,
		"start-turn" : startTurn,
		"wait-for-fakes" : waitForFakes,
		"start-fake-stage" : startFakeStage,
		"fake-stage-time-up" : fakeStageTimeUp,
		"fake-stored" : fakeStored,
		"start-guess-stage" : startGuessStage,
		"guess-stage-time-up" : guessStageTimeUp,
		"guess-stored" : guessStored,		
		"turn-over" : turnOver,
		"get-drawing" : getDrawing,
		"get-fake" : getFake,
		"get-guess" : getGuess,
	};

	// UI Event Handlers
	function playerAdded(data){
		// TODO
	}

	function drawingPhrase(data){
		// TODO: Display Phrase to User
		$("#drawing-phrase").text(data.phrase);	
	}

	function drawStageTimeUp(data){
		// TODO
	}

	function drawingStored(data){
		// TODO
	}

	function startTurn(data){
		// TODO: Start of Turn: clear options, etc.
		$("#options").html("");
	}

	function waitForFakes(data){
		// TODO
	}

	function startFakeStage(data){
		// TODO
	}

	function fakeStageTimeUp(data){
		// TODO
	}

	function fakeStored(data){
		// TODO
	}

	function startGuessStage(data){
		// TODO
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
	}
	
	function guessStageTimeUp(data){
		// TODO
	}

	function guessStored(data){
		// TODO
	}

	function turnOver(data){
		// TODO
		$("#options").html("");
	}

	function getDrawing(data){
		var canvas = $("#controller-canvas")[0];
		var imgData = canvas.toDataURL("image/png");
		return imgData;
	}

	function getFake(data){
		return $("#fake-input").val();
	}

	function getGuess(data){
		var guess = parseInt(
			$("#options")
				.children()
				.children()
				.filter("input:checked")
				.val(),
			10);
		return guess;
	}

	// UI Event Listeners
	$("#create-player-btn").click(function(e){
		var gameId = $("#game-id-input").val().toUpperCase();
		var username = $("#username-input").val();
		var data = { gameId : gameId, username : username };
		return _playerHandlers["create-player"](data);
	});

	$("#submit-drawing").click(function(e){
		return _playerHandlers["submit-drawing"]();
	});

	$("#submit-fake").click(function(e){
		return _playerHandlers["submit-fake"]();
	});

	$("#submit-guess").click(function(e){
		return _playerHandlers["submit-guess"]();
	});

	return self;
}