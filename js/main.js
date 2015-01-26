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
var gameHeight = 700;

var backgroundHeight = 100;
var labelHeight = 100;

var endingsLabel;
var wdwdnLabel;
var descriptionLabel;

var background;
var currScenario;

var option1;
var option2;
var option3;
var option4;

var optionLabels = [];

var character1;
var character2;
var character3;
var character4;

var gHats = [];
var gOptions = [];
var gVotes = [null, null, null, null];

var controllers = [];  //0-3 = controllers. 4 = keyboard last vote. 5-8 = controllers' last vote
var endingsReached = [];

//Base Classes
var Hat = Class.create(Sprite, {
	initialize: function(x, y, width, height, model) {
		Sprite.call(this, width, height);
		this.x = x;
		this.y = y;
		this.image = game.assets[model];
	}
});

var setEndingsText = function() {
	 var text = "Endings reached (" + endingsReached.length + "/13):<br>";
	 for (var i=0; i < endingsReached.length; i++) {
	 	text += "  " + endingsReached[i].title + "<br>";
	 }
	 endingsLabel.text = text;
}

var setScenario = function(scenario) {
	currScenario = scenario;
	background.image = game.assets[scenario.bgImage];
	wdwdnLabel.text = scenario.wdwdnText;
	descriptionLabel.text = scenario.text;

	for (var i=0; i < optionLabels.length; i++) {
		if (scenario.options[i])
			optionLabels[i].text = optionLabels[i].baseText + scenario.options[i].text;
		else 
			optionLabels[i].text = "";

		if (scenario.options[i] == gOps.restart) {
			if (endingsReached.indexOf(scenario) == -1) {
				endingsReached.push(scenario);
				setEndingsText();
			}
		}
	}
	for (var i=0; i < controllers.length; i++) {
		controllers[i].clearVote();
	}
}

var setupScene = function() {
	descriptionLabel = new Label();
	descriptionLabel.x = 12;
	descriptionLabel.y = 8;
	descriptionLabel.width = gameWidth - 40;
	descriptionLabel.text = "";
	descriptionLabel.font = "18px AYearWithoutRain";
	game.rootScene.addChild(descriptionLabel);

	background = new Background("images/intro1.jpg");
	background.y = backgroundHeight;
	background.height = (gameHeight - labelHeight) - backgroundHeight;

	optionLabels[0] = new OptionLabel();
	optionLabels[0].y = gameHeight - labelHeight + 1;
	optionLabels[0].baseText = (controllers[0].type == "controller") ? "A. " : "1. ";
	optionLabels[1] = new OptionLabel();
	optionLabels[1].y = gameHeight - labelHeight * (3/4);
	optionLabels[1].baseText = (controllers[0].type == "controller") ? "B. " : "2. ";
	optionLabels[2] = new OptionLabel();
	optionLabels[2].y = gameHeight - (labelHeight / 2);
	optionLabels[2].baseText = (controllers[0].type == "controller") ? "Y. " : "3. ";
	optionLabels[3] = new OptionLabel();
	optionLabels[3].y = gameHeight - (labelHeight / 4);
	optionLabels[3].baseText = (controllers[0].type == "controller") ? "X. " : "4. ";
	
	game.rootScene.addChild(optionLabels[0]);
	game.rootScene.addChild(optionLabels[1]);
	game.rootScene.addChild(optionLabels[2]);
	game.rootScene.addChild(optionLabels[3]);

	wdwdnLabel = new ButtonText();
	game.rootScene.addChild(wdwdnLabel);

	endingsLabel = new Label();
	endingsLabel.x = 10;
	endingsLabel.y = backgroundHeight + 6;
	endingsLabel.text = "";
	endingsLabel.font = "14px AYearWithoutRain"
	game.rootScene.addChild(endingsLabel);

	// Some simple dividers
	var topDiv = new Divider();
	topDiv.y = backgroundHeight - 1;
	var bottomDiv = new Divider();
	bottomDiv.y = gameHeight - labelHeight - 1;
	var middleDiv = new Divider();
	middleDiv.height = labelHeight;
	middleDiv.width = 2;
	middleDiv.y = gameHeight - labelHeight;
	middleDiv.x = 390;
	game.rootScene.addChild(topDiv);
	game.rootScene.addChild(bottomDiv);
	game.rootScene.addChild(middleDiv);

	setScenario(gScenarios.intro1);
};

var Start = new Class(Sprite, {
	initialize: function() {
		Sprite.call(this, gameWidth, gameHeight);
		this.image = game.assets['images/pressstart.jpg'];
	},
	onenterframe: function() {
		updateControllers();
		if (game.input['Enter'] || (controllers[0] && controllers[0].type == "controller" && controllers[0].controller.buttons[CONT_INPUT.start])) {
			game.rootScene.removeChild(this);
			setupScene();
		}
	}
});

var Divider = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.backgroundColor = "#999";
		this.width = gameWidth;
		this.height = 2;
	}
});

var ButtonText = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.font = "20px AYearWithoutRain";
		this.x = 50;
		this.y = gameHeight - (labelHeight * 3 / 4);
		this.text = "PUSH THE BUTTON";
	}
});

var OptionLabel = Class.create(Label, {
	baseText: "",
	initialize: function() {
		Label.call(this);
		this.x = 400;
		this.width = gameWidth - this.x;
	}
});

var Controller = Class.create(Object, {
	initialize: function(controller, set, numY, numB, numA, numX) {
		Object.call(this);
		this.pressed = false;
		this.type = "controller";
		this.vote = 0;
		this.controller = controller;
		this.set = set;
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

	poll: function() {
		var newValue = 0;
		if (this.set == "axes") {
			if (this.controller.axes[this.y] >= .5) {
				newValue = 3;
			}
			else if (this.controller.axes[this.y] <= -.5) {
				newValue = 1;
			}
			else if (this.controller.axes[this.x] >= .5) {
				newValue = 2;
			}	
			else if (this.controller.axes[this.x] <= -.5) {
				newValue = 4;
			}
		}
		else if (this.set == "buttons") {
			if (this.controller.buttons[this.numA]) {
				newValue = 1;
			}
			else if (this.controller.buttons[this.numB]) {
				newValue = 2;
			}
			else if (this.controller.buttons[this.numY]) {
				newValue = 3;
			}
			else if (this.controller.buttons[this.numX]) {
				newValue = 4;
			}
		}
		if (newValue > 0)
			this.pressed = true;
		else
			this.pressed = false;

		if (this.pressed) {
			this.vote = newValue;
		}
	},

	getVote: function() {
		return (this.pressed) ? 0 : this.vote;
	},

	clearVote: function() {
		this.vote = 0;
	}
});

function updateControllers() {
	if (navigator.webkitGetGamepads) {
		var gamepads = navigator.webkitGetGamepads();
		if (gamepads.length == controllers.length)
			return;
		var devices = [];
		for (var i=0; i < gamepads.length; i++) {
			if (navigator.getGamepads()[i]) {
				devices.push(navigator.webkitGetGamepads()[i]);
			}
		}
		if (devices.length > 0) {
			controllers.push(new Controller(devices[0], "buttons", 3, 1, 0, 2));			
		}
		controllers.push(new Keyboard());
	}
}

var gameLoop = function(event) {
	updateControllers();
	// This is really delicate right now; getButton can only be called once per loop if you
	// want to actually pick up when it changes.
	for (var i=0; i < 4; i++) {
		if (controllers[i])
			controllers[i].poll();
	}
	for (var i=0; i < optionLabels.length; i++) {
		optionLabels[i].font = "16px AYearWithoutRain";
		optionLabels[i].color = "#111";
	}
	if (controllers[0]) {
		if (controllers[0].pressed) {
			optionLabels[controllers[0].vote - 1].font = "18px AYearWithoutRain";
			optionLabels[controllers[0].vote - 1].color = "blue";
		}
		var votedOption = controllers[0].getVote();
		if (votedOption > 0) {
			if (currScenario.options.length > votedOption-1) {
				console.log("Voted for option " + votedOption);
				setScenario(currScenario.options[votedOption-1].getDestination());
			}
		}
	}
};

var Keyboard = Class.create(Controller, {
	initialize: function() {
		Controller.call(this);
		this.type = "keyboard";
		this.pressed = false;
		this.vote = 0;
	},

	poll: function() {
		var newValue = 0;
		if (game.input['1']) {
			newValue = 1;
		}
		else if (game.input['2']) {
			newValue = 2;
		}
		else if (game.input['3']) {
			newValue = 3;
		}
		else if (game.input['4']) {
			newValue = 4;
		}
		if (newValue > 0)
			this.pressed = true;
		else
			this.pressed = false;

		if (this.pressed) {
			this.vote = newValue;
		}
	},

	getVote: function() {
		return (this.pressed) ? 0 : this.vote;
	},

	clearVote: function() {
		this.vote = 0;
	}
})

// When document loads, set up basic game
window.onload = function() {
	game = new Game(gameWidth, gameHeight);
	game.preload( 'images/pressstart.jpg',
	              'images/beer1.jpg',
	              'images/beer2.jpg',
	              'images/beer3.jpg',
	              'images/beer4.jpg',
	              'images/beer5.jpg',
	              'images/beer6.jpg',
	              'images/beer7.jpg',
	              'images/catnami1.jpg',
	              'images/catnami2.jpg',
	              'images/catnami3.jpg',
	              'images/catnami4.jpg',
	              'images/catnami5.jpg',
	              'images/falling1.jpg',
	              'images/furniture1.jpg',
	              'images/furniture2.jpg',
	              'images/genericdeath.jpg',
	              'images/intro1.jpg',
	              'images/intro2.jpg',
	              'images/ml1.jpg',
	              'images/ml2.jpg',
	              'images/ml2.5.jpg',
	              'images/ml3.jpg',
	              'images/ml4.jpg',
	              'images/ml5.jpg',
	              'images/ml6.jpg',
	              'images/mlend.jpg',
	              'images/moa1.jpg',
	              'images/moa2.jpg',
	              'images/moa3.jpg',
	              'images/monkies1.jpg',
	              'images/monkies2.jpg',
	              'images/monkies3.jpg',
	              'images/monkies4.jpg',
	              'images/monkies5.jpg',
	              'images/monkies6.jpg' );

	
	game.fps = 60;
	game.scale = 1;
	
	//Keybindings for the game
	game.keybind(13, 'Enter');
	game.keybind(27, 'Esc');
	game.keybind(49, '1');
	game.keybind(50, '2');
	game.keybind(51, '3');
	game.keybind(52, '4');

	game.onload = function() {
		start = new Start();
		game.rootScene.addChild(start);
		game.rootScene.color = "#221522";
		
		game.rootScene.addEventListener('enterframe', gameLoop);
	};
    game.start();
};
