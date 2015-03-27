$(document).ready(function(){
	var canvas = $("#controller-canvas");
	var whiteboard = Whiteboard(canvas);
	socket = io();
	var player = Player(socket);
});