// Start enchant
enchant();

//Global variables. Don't change in code
var gameWidth = 1000;
var gameHeight = 600;

var labelHeight = 100;

var text;

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
var Character = Class.create(Sprite, {
	initialize: function(x, y, width, height, model, hat) {
		Sprite.call(this, width, height);
		this.x = x;
		this.y = y;
		this.image = game.assets[model];
		this.hat = hat;
		hat.x = ((this.x * 2 + this.width) / 2) - (hat.width / 2);
		hat.y = this.y - hat.height + 1;
		game.rootScene.addChild(hat);
	}
});

var Hat = Class.create(Sprite, {
	initialize: function(width, height, model) {
		Sprite.call(this, width, height);
		this.image = game.assets[model];
	}
});

var Background = Class.create(Sprite, {
	initialize: function(imageName) {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets[imageName];
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
		this.text = "Option 3 here " + character1.x + " " + character1.y;
	}
});

var Option2 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - labelHeight + 1;
		this.text = "Option 3 here " + character2.x + " " + character2.y;
	}
});

var Option3 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 400;
		this.y = gameHeight - (labelHeight / 2) + 1;
		this.text = "Option 3 here " + character3.x + " " + character3.y;
	}
});

var Option4 = Class.create(Label, {
	initialize: function() {
		Label.call(this);
		this.x = 700;
		this.y = gameHeight - (labelHeight / 2) + 1;
		this.text = "Option 3 here " + character4.x + " " + character4.y;
	}
});

// When document loads, set up basic game
window.onload = function() {
	game = new Game(gameWidth, gameHeight);
	game.preload('images/bg.png', 'images/hat.png', 'images/dude.png');
	
	game.fps = 60;
	game.scale = 1;

	game.onload = function() {
		var bg = new Background("images/bg.png");
		game.rootScene.addChild(bg);
		
		hat1 = new Hat(15, 15, "images/hat.png");
		hat2 = new Hat(15, 15, "images/hat.png");
		hat3 = new Hat(15, 15, "images/hat.png");
		hat4 = new Hat(15, 15, "images/hat.png");
		
		character1 = new Character(200, 200, 16, 28, "images/dude.png", hat1);
		game.rootScene.addChild(character1);
		
		character2 = new Character(250, 250, 16, 28, "images/dude.png", hat2);
		game.rootScene.addChild(character2);
		
		character3 = new Character(300, 300, 16, 28, "images/dude.png", hat3);
		game.rootScene.addChild(character3);
		
		character4 = new Character(350, 350, 16, 28, "images/dude.png", hat4);
		game.rootScene.addChild(character4);
		
		text = new ButtonText();
		game.rootScene.addChild(text);
		
		option1 = new Option1();
		option2 = new Option2();
		option3 = new Option3();
		option4 = new Option4();
		
		game.rootScene.addChild(option1);
		game.rootScene.addChild(option2);
		game.rootScene.addChild(option3);
		game.rootScene.addChild(option4);
	};
    game.start();
};
