// Whiteboard
Whiteboard = function(gameCanvas){
	
	var self = {};
	
	// States
	var drawing = false;

	// Whiteboard HTML Objects
	var canvas = $(gameCanvas)[0];
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";

	// Whiteboard Event Listeners

	// Press - start drawing
	$(gameCanvas).on("mousedown touchstart", function(e){
		drawing = true;
	});

	// Move - update whiteboard
	$(gameCanvas).on("mousemove touchmove", function(e){
		if (drawing){
			var xFinal = e.offsetX;
			var yFinal = e.offsetY;
			var dx = e.originalEvent.movementX;
			var dy = e.originalEvent.movementY;
			var xStart = xFinal - dx;
			var yStart = yFinal - dy;
			ctx.moveTo(xStart,yStart);
			ctx.lineTo(xFinal,yFinal);
			ctx.stroke();
		}
	});

	// Release (listener for whole body) - stop drawing
	$("body").on("mouseup touchend", function(e){
		drawing = false;
	});

	return self;
}