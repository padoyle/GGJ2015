// Start enchant
enchant();

//Global variables. Don't change in code
var gameWidth = 1000;
var gameHeight = 600;

var labelHeight = 100;

var text;

var background;

var option1;
var option2;
var option3;
var option4;

var character1;
var character2;
var character3;
var character4;

var hat1;
var hat2;
var hat3;
var hat4;

//Base Classes

var Hat = Class.create(Sprite, {
	initialize: function(x, y, width, height, model) {
		Sprite.call(this, width, height);
		this.x = x;
		this.y = y;
		this.image = game.assets[model];
	}
});

var Background = Class.create(Sprite, {
	initialize: function(imageName, hat1, hat2, hat3, hat4) {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets[imageName];
		
		game.rootScene.addChild(this);
		game.rootScene.addChild(hat1);
		game.rootScene.addChild(hat2);
		game.rootScene.addChild(hat3);
		game.rootScene.addChild(hat4);
	}
});

var Start = new Class(Sprite, {
	initialize: function() {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets['images/startScreen.png'];
	},
	onenterframe: function() {
		if (game.input['Enter']) {
			game.rootScene.removeChild(this);
			game.rootScene.addChild(new Initial());
		}
	}
});

var initNewScenario = function() {
	//Eventually, we'll pull a random background
	hat1 = new Hat(150, 150, 15, 15, "images/hat.png");
	hat2 = new Hat(200, 200, 15, 15, "images/hat.png");
	hat3 = new Hat(250, 250, 15, 15, "images/hat.png");
	hat4 = new Hat(300, 300, 15, 15, "images/hat.png");
	background = new Background("images/bg.png", hat1, hat2, hat3, hat4);
	
			
	option1 = new Option1();
	option2 = new Option2();
	option3 = new Option3();
	option4 = new Option4();
	
	game.rootScene.addChild(option1);
	game.rootScene.addChild(option2);
	game.rootScene.addChild(option3);
	game.rootScene.addChild(option4);
		
	text = new ButtonText();
	game.rootScene.addChild(text);
};

var Initial = new Class(Sprite, {
	initialize: function() {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets['images/initialScreen.png'];
	},
	onenterframe: function() {
		if (game.input['Enter']) {
			game.rootScene.removeChild(this);
			initNewScenario();
		}
	}
});

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
		this.text = "Option 3 here " + hat1.x + " " + hat1.y;
	}
});

var Option2 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - labelHeight + 1;
		this.text = "Option 3 here " + hat2.x + " " + hat2.y;
	}
});

var Option3 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 400;
		this.y = gameHeight - (labelHeight / 2) + 1;
		this.text = "Option 3 here " + hat3.x + " " + hat3.y;
	}
});

var Option4 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - (labelHeight / 2) + 1;
		this.text = "Option 3 here " + hat4.x + " " + hat4.y;
	}
});

// When document loads, set up basic game
window.onload = function() {
	game = new Game(gameWidth, gameHeight);
	game.preload('images/bg.png', 'images/hat.png',
	              'images/startScreen.png', 'images/initialScreen.png');
	
	game.fps = 60;
	game.scale = 1;
	
	//Keybindings for the game
	game.keybind(13, 'Enter');

	game.onload = function() {
		start = new Start();
		game.rootScene.addChild(start);
	};
    game.start();
};
