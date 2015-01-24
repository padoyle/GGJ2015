// Start enchant
enchant();

//Global variables. Don't change in code
var CONT_INPUT = {
	a: 0, //Controller.buttons[blah]
	b: 1,
	x: 2,
	y: 3,
	lb: 4,
	rb: 5,
	lt: 6,
	rt: 7,
	back: 8,
	start: 9,
	lstick: 10,
	rstick: 11,
	up: 12,
	down: 13,
	left: 14,
	right: 15,
	lstick_x: 0, //Controller.axes[blah]
	lstick_y: 1,
	rstick_x: 2,
	rstick_y: 3
};

var game;

var gameWidth = 1000;
var gameHeight = 600;

var labelHeight = 100;

var text;

var debug;
var debug1;
var debug2;
var debug3;
var debug4;

var background;

var option1;
var option2;
var option3;
var option4;

var character1;
var character2;
var character3;
var character4;

var gHats = [];
var gOptions = [];
var gVotes = [null, null, null, null];

var controllers = [];

//Base Classes
var Hat = Class.create(Sprite, {
	initialize: function(x, y, width, height, model) {
		Sprite.call(this, width, height);
		this.x = x;
		this.y = y;
		this.image = game.assets[model];
	}
});

var setScenario = function(scenario) {
	background.image = game.assets[scenario.bgImage];

	for (var i=0; i < scenario.options.length; i++) {
		optionLabels[i].text = scenario.options[i].text;
	}
}

var initNewScenario = function() {
	for (var i=0; i < 4; i++) {
		var hat = new Hat(150 + i*50, 150 + i*50, 15, 15, "images/hat.png");
		gHats.push(hat);
		game.rootScene.addChild(hat);
	}
	background = new Background("images/bg.png", gHats);
	
	optionLabels = [];
	optionLabels[0] = new Option1();
	optionLabels[1] = new Option2();
	optionLabels[2] = new Option3();
	optionLabels[3] = new Option4();
	
	game.rootScene.addChild(optionLabels[0]);
	game.rootScene.addChild(optionLabels[1]);
	game.rootScene.addChild(optionLabels[2]);
	game.rootScene.addChild(optionLabels[3]);
		
	text = new ButtonText();
	game.rootScene.addChild(text);

	setScenario(gScenarios.intro);
};

var vote = function() {
	updateControllers();
	if (controllers) {
		var array = [];
		array[0] = controllers[5];
		array[1] = controllers[6];
		array[2] = controllers[7];
		array[3] = controllers[8];
		
		if (controllers[5] == 0 || controllers[6] == 0 || controllers[7] == 0 || controllers[8] == 0) {
			return null;
		}
		var num = array[Math.floor(Math.random() * 4)];
		debug.text = "" + num;
		
		controllers[5] = 0;
		controllers[6] = 0;
		controllers[7] = 0;
		controllers[8] = 0;
		
		return num;
	}
}

var Start = new Class(Sprite, {
	initialize: function() {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets['images/startScreen.png'];
	},
	onenterframe: function() {
		updateControllers();
		if (game.input['Enter'] || controllers[0].controller.buttons[CONT_INPUT.start]) {
			game.rootScene.removeChild(this);
			initNewScenario();
		}
	}
});

var Victory = new Class(Sprite, {
	initialize: function() {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets['images/victoryScreen.png'];
		this.done = false;
		this.show = false;
		var vict = this;
		setTimeout(function() {vict.done = true}, 5000); //Show victory screen for 5 seconds, then allow refresh
	},
	onenterframe: function() {
		if (!this.done) {
			return;
		}
		if (!this.show) {
			var lab = new Label();
			lab.x = 200;
			lab.y = 300;
			lab.color = 'white';
			lab.text = "Press Select to Refresh Page";
			game.rootScene.addChild(lab);
		}
		this.show = true;
		updateControllers();
		if (game.input['Enter'] || controllers[0].controller.buttons[CONT_INPUT.back]) {
			game.stop();
			location.reload();
		}
	}
});

// var Initial = new Class(Sprite, {
// 	initialize: function() {
// 		Sprite.call(this, gameWidth, gameHeight - labelHeight);
// 		this.image = game.assets['images/initialScreen.png'];
// 	},
// 	onenterframe: function() {
// 		updateControllers();
// 		if (game.input['Enter'] || controllers[0].controller.buttons[CONT_INPUT.back]) {
// 			game.rootScene.removeChild(this);
// 		}
// 	}
// });

var ButtonText = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 50;
		this.y = gameHeight - (labelHeight * 3 / 4);
		this.text = "PUSH THE FOLKING BUTTON";
	}
});

var Option1 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 400;
		this.y = gameHeight - labelHeight + 1;
	}
});

var Option2 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - labelHeight + 1;
	}
});

var Option3 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 400;
		this.y = gameHeight - (labelHeight / 2) + 1;
	}
});

var Option4 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - (labelHeight / 2) + 1;
	}
});

// var Driver = Class.create({

// });

var Controller = Class.create(Object, {
	initialize: function(controller, set, numY, numB, numA, numX, lastNum) {
		Object.call(this);
		this.controller = controller;
		this.set = set;
		this.lastNum = lastNum;
		if (this.set == "axes") {
			this.y = numY;
			this.x = numB;
		}
		else {
			this.numY = numY;
			this.numB = numB;
			this.numA = numA;
			this.numX = numX;
		}
	},
	setLast: function(num) {
		controllers[this.lastNum] = num;
	},
	getButton: function() {
		if (this.set == "axes") {
			if (this.controller.axes[this.y] >= .5) {
				this.setLast(3);
				return 3;
			}
			else if (this.controller.axes[this.y] <= -.5) {
				this.setLast(1);
				return 1;
			}
			else if (this.controller.axes[this.x] >= .5) {
				this.setLast(2);
				return 2;
			}	
			else if (this.controller.axes[this.x] <= -.5) {
				this.setLast(4);
				return 4;
			}
			else {
				return 0;
			}
		}
		else if (this.set == "buttons") {
			if (this.controller.buttons[this.numY]) {
				this.setLast(1);
				return 1;
			}
			else if (this.controller.buttons[this.numB]) {
				this.setLast(2);
				return 2;
			}
			else if (this.controller.buttons[this.numA]) {
				this.setLast(3);
				return 3;
			}
			else if (this.controller.buttons[this.numX]) {
				this.setLast(4);
				return 4;
			}			
			else {
				return 0;
			}
		}
	}
});

function updateControllers() {
	if (navigator.webkitGetGamepads) {
		var gamepads = navigator.webkitGetGamepads();
		var devices = [];
		for (var i=0; i < gamepads.length; i++) {
			if (navigator.getGamepads()[i]) {
				devices.push(navigator.webkitGetGamepads()[i]);
			}
		}
		if (devices.length == 4) {
			controllers[0] = new Controller(devices[0], "buttons", 3, 1, 0, 2, 5); //Y B A X
			controllers[1] = new Controller(devices[1], "buttons", 3, 1, 0, 2, 6); //Y B A X
			controllers[2] = new Controller(devices[2], "buttons", 3, 1, 0, 2, 7); //Y B A X
			controllers[3] = new Controller(devices[3], "buttons", 3, 1, 0, 2, 8); //Y B A X
		}
		else if (devices.length == 3) {
			controllers[0] = new Controller(devices[0], "buttons", 3, 1, 0, 2, 5); //Y B A X
			controllers[1] = new Controller(devices[0], "buttons", 12, 15, 13, 14, 6); //Up Right Down Left
			controllers[2] = new Controller(devices[1], "buttons", 3, 1, 0, 2, 7); //Y B A X
			controllers[3] = new Controller(devices[2], "buttons", 3, 1, 0, 2, 8); //Y B A X
		}
		else if (devices.length == 2) {
			controllers[0] = new Controller(devices[0], "buttons", 3, 1, 0, 2, 5); //Y B A X
			controllers[1] = new Controller(devices[0], "buttons", 12, 15, 13, 14, 6); //Up Right Down Left
			controllers[2] = new Controller(devices[1], "buttons", 3, 1, 0, 2, 7); //Y B A X
			controllers[3] = new Controller(devices[1], "buttons", 12, 15, 13, 14, 8); //Up Right Down Left
		}
		else if (devices.length == 1) {
			controllers[0] = new Controller(devices[0], "buttons", 3, 1, 0, 2, 5); //Y B A X
			controllers[1] = new Controller(devices[0], "buttons", 12, 15, 13, 14, 6); //Up Right Down Left
			controllers[3] = new Controller(devices[0], "axes", 3, 2, 0, 0, 8); //Right Stick X-axis=2 Y-axis=3
			controllers[2] = new Controller(devices[0], "axes", 1, 0, 0, 0, 7); //Left Stick X-axis=0 Y-axis=1
		}	
		else {
			console.log("no controllers detected");
		}
	}
}

// When document loads, set up basic game
window.onload = function() {
	game = new Game(gameWidth, gameHeight);
	game.preload('images/bg.png', 'images/hat.png', 'images/victoryScreen.png',
	              'images/startScreen.png', 'images/initialScreen.png', 
	              'images/beer1.jpg',
	              'images/beer2.jpg',
	              'images/beer3.jpg',
	              'images/beer4.jpg',
	              'images/catnami1.jpg',
	              'images/furniture.jpg',
	              'images/intro1.jpg',
	              'images/intro2.jpg');

	
	game.fps = 60;
	game.scale = 1;
	
	//Keybindings for the game
	game.keybind(13, 'Enter');
	game.keybind(27, 'Esc');

	game.onload = function() {
		start = new Start();
		game.rootScene.addChild(start);

		debug = new Label();
		debug.color = 'white';
		debug.x = gameWidth - 200;
		debug.y = 50;
		debug.text = "hello";
		
		debug1 = new Label();
		debug1.color = 'white';
		debug1.x = gameWidth - 200;
		debug1.y = 100;
		debug1.text = "hello";
		debug2 = new Label();
		debug2.color = 'white';
		debug2.x = gameWidth - 200;
		debug2.y = 200;
		debug2.text = "hello";
		debug3 = new Label();
		debug3.color = 'white';
		debug3.x = gameWidth - 200;
		debug3.y = 300;
		debug3.text = "hello";
		debug4 = new Label();
		debug4.color = 'white';
		debug4.x = gameWidth - 200;
		debug4.y = 400;
		debug4.text = "hello";

		game.rootScene.addEventListener('enterframe', function(e) {
			game.rootScene.addChild(debug);		
			game.rootScene.addChild(debug1);
			game.rootScene.addChild(debug2);
			game.rootScene.addChild(debug3);
			game.rootScene.addChild(debug4);
			updateControllers();
			if (controllers) {
				if (controllers[0]) {
					debug1.text = "Controller 1: " + controllers[0].getButton();
				}
				if (controllers[1]) {
					debug2.text = "Controller 2: " + controllers[1].getButton();
				}
				if (controllers[2]) {
					debug3.text = "Controller 3: " + controllers[2].getButton();
				}
				if (controllers[3]) {
					debug4.text = "Controller 4: " + controllers[3].getButton();
				}
			}
			if (game.input['Esc'] || (controllers && controllers[0].controller.buttons[CONT_INPUT.start])) {
				var temp = vote();
				if (temp) {
					debug.text = temp;
				}
				if (temp == 4) {
					game.rootScene.addChild(new Victory());
				}
			}
		});
	};
    game.start();
};
