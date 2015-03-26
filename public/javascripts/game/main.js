$(document).ready(function(){
	// TODO
	var socket = io();
	var ui = UIController(socket);
	var game = Game(socket);
});