// Start enchant
enchant();

//Global variables. Don't change in code


// When document loads, set up basic game
window.onload = function() {
	game = new Game(600, 720);
	//game.preload('images/gameOver.png'); Get Images and sounds in
	
	game.fps = 60;
	game.scale = 1;

	game.onload = function() {
	
	};
    game.start();
};
