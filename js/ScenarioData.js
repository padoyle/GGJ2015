//////////////////////////////////////////
// All our scenario data and contianers //
//////////////////////////////////////////

var gOptLocations = [[50, 50], [200, 50], [50, 100], [200, 100]];

var Background = Class.create(Sprite, {
	initialize: function(imageName) {
		Sprite.call(this, gameWidth, gameHeight - labelHeight);
		this.image = game.assets[imageName];
		
		game.rootScene.addChild(this);
	}
});

var Scenario = Class.create({
	options: null,
	title: "",
	text: "",
	wdwdnText: "",
	bgImage: null,
	game: null,

	initialize: function(_text, _wdwdnText, _bgImage, _title) {
		this.game = Game.instance;
		this.text = _text;
		this.wdwdnText = _wdwdnText;
		this.bgImage = _bgImage;
		this.options = [];
		// If it's an ending, it needs a title that we can list
		if (_title !== undefined)
			this.title = _title;
	},

	setOptions: function(_options) {
		this.options = _options;
	}
});

var VoteOption = Class.create({
	text: "",
	destination: null,
	randomize: false,

	initialize: function(_text, _dest, _randomize) {
		Label.apply(this);
		this.text = _text;
		this.destination = _dest;
		if (_randomize != undefined)
			this.randomize = _randomize;
	},

	getDestination: function() {
		if (this.randomize) {
			var index;
			do {
				index = Math.floor(Math.random() * gRootScenarios.length);
			} while (gRootScenarios[index] == currScenario);
			return gRootScenarios[index];
		}
		else {
			return this.destination;
		}
	}
});

var	gScenarios = {
	intro1: new Scenario("You and your pals have been given a mysterious button.  Have fun!", 
		"", "images/intro1.jpg"),
	intro2: new Scenario("Alright, friends.  Now you have this exciting button!  The possibilities are endless!",
		"What do we do now?", "images/intro2.jpg"),
	beer1: new Scenario("You all went out for drinks!", 
		"What should we do now?", "images/beer1.jpg"),
	beer2: new Scenario("All four of you tried to hit on the girl at the bar.  That's super creepy, guys.  You all got smacked.", 
		"Ow... what we do now?", "images/beer2.jpg"),
	beer3: new Scenario("You've all had far too many drinks.  The bartender refuses to give you more.", 
		"Wha... what should... guys... guys, what do we do now?", "images/beer3.jpg"),
	beer4: new Scenario("Despite your best efforts, you're all too drunk to actually press the button.", 
		"...?", "images/beer4.jpg"),
	beer5: new Scenario("One way or another, you've made your way out of the bar.  You're all far too drunk to drive.", 
		"What... um, what now?", "images/beer5.jpg"),
	beer6: new Scenario("Everybody choked on their keys.  That was a terrible idea!", 
		"THE END", "images/beer6.jpg", "Really?  Swallow your keys?"),
	beer7: new Scenario("You all made it home safe and sound.  Unfortunately, you forgot the button at the bar.", 
		"THE END", "images/beer7.jpg", "Forgotten button"),
	falling1: new Scenario("You're falling from the sky.  Rather fast, to be honest.  It's a lovely day, though.",
		"What shall we do now?", "images/falling1.jpg"),
	falling2: new Scenario("As it turns out, falling is dangerous.  You all died.",
		"THE END", "images/genericdeath.jpg", "Splat!"),
	furniture1: new Scenario("You find yourselves in an empty room with a mysterious switch on the wall.", 
		"Should we flip the switch?", "images/furniture1.jpg"),
	furniture2: new Scenario("You've been turned into furniture.  Furniture can't do much of anything, let alone press a button.  You live out your lives as a modest but homey set of living room furniture.", 
		"THE END", "images/furniture2.jpg", "Shoulda gone unfurnished"),
	ml1: new Scenario("You're all alone in a dark and mysterious forest.  You see a house ahead of you.", 
		"Psst!  What now?", "images/ml1.jpg"),
	ml2: new Scenario("Inside the cabin is a barren room with a single table.  Upon it sit three different drinks.", 
		"What do we drink?", "images/ml2.jpg"),
	ml25: new Scenario("You drank a tasty beverage!  There are two drinks remaining on the table.", 
		"What do we drink now?", "images/ml2.5.jpg"),
	ml3: new Scenario("All you see are trees.  You might be lost.", 
		"Where do we go now?", "images/ml3.jpg"),
	ml4: new Scenario("It's just a really dark cave.  There could be anything in there.",
		"Do we... do we go in?", "images/ml4.jpg"),
	ml5: new Scenario("You've all been shrunk to the size of a mouse.  There's a mouse hole nearby.", 
		"What do we do now?", "images/ml5.jpg"),
	ml6: new Scenario("You encounter a kindly gentleman mouse, who offers you wine and cheese.", 
		"Where do we go now?", "images/ml6.jpg"),
	mlend: new Scenario("Upon accepting his offer, you've been whisked away to Mouselandia, where you're hailed as their new rulers.  You live happily ever after.", 
		"THE END", "images/mlend.jpg", "Onward, to Mouselandia!"),
	mldeath: new Scenario("Well, it looks like you just drank poison.  Way to go, ya doofuses.", 
		"THE END", "images/genericdeath.jpg", "So it WAS poison!"),
	moa1: new Scenario("You've arrived on a pleasant grassy knoll.  Off in the distance a group of moas are strutting about.", 
		"What bird we do now?", "images/moa1.jpg", "A mouse in a house"),
	moa2: new Scenario("You have an intense moa racing face-off.  You're not really sure who won.", 
		"Now what?", "images/moa2.jpg"),
	moa3: new Scenario("You've raced the moas so much that you have become one with them.  The button is forgotten.  You are moas now.", 
		"THE END", "images/moa3.jpg", "What IS a moa, anyway?"),
	monkies1: new Scenario("You've all been turned into monkies!", 
		"Ooh ooh ah ah?", "images/monkies1.jpg"),
	monkies2: new Scenario("A lot of poop has been flung, some words were said, feelings were hurt, and nobody is proud of what's just happened...", 
		"Keep monkeying around?", "images/monkies2.jpg"),
	monkies3: new Scenario("You've all gone thoroughly bananas!  Having become bananas, you're kind of out of luck.  Nobody even knows who you are, since you're all banans now.", 
		"THE END", "images/monkies3.jpg", "Bananonymity"),
	monkies4: new Scenario("A yurt has been built, sufficient firewood for the winter has been gathered, and you've had your first monkey baby!  You're on your way, monkeys!", 
		"Now what?", "images/monkies4.jpg"),
	monkies5: new Scenario("You may have gotten carried away, monkeys. Lighter fluid, gunpowder, banana peels, and yellowcake uranium did not turn out to be a more useful recipe for fire.", 
		"THE END", "images/monkies5.jpg", "Well, there WAS a lot of fire"),
	monkies6: new Scenario("You elected one among you as your monkey leader.  Unfortunately, monkey democracy is ineffective and quickly devolves into tyranny.  The button has been lost and you all live out your lives under a furry iron fist.", 
		"THE END", "images/monkies6.jpg", "Ruthless chimptatorship"),
	catnami1: new Scenario("You’ve arrived on a beach.  In the distance is an enormous tsunami... made of cats.  One might go so far as to call it a catnami.", 
		"Cat do we do meow!?", "images/catnami1.jpg"),
	catnami2: new Scenario("You escaped to higher ground, but now the cats have the button.  The entire universe is doomed.", 
		"THE END", "images/catnami2.jpg", "Cat-astrophe"),
	catnami3: new Scenario("You've chosen to enter the catnami code.  Do you know what it is?", 
		"How about meow!?", "images/catnami3.jpg"),
	catnami4: new Scenario("You failed to enter the correct code, and now you've all drowned in a flood of cats.",
		"THE END", "images/catnami4.jpg", "Cat-aclysmic flood"),
	catnami5: new Scenario("Entering the catnami code correctly conjured a comfy box.  Cats can always cram their kitty selves into comfy boxes.  You COULD press the button again, but you've got all these cats to play with now!", 
		"THE END", "images/catnami5.jpg", "If it fits, it sits"),
};

var	gRootScenarios = [
	gScenarios.catnami1,
	gScenarios.moa1,
	gScenarios.ml1,
	gScenarios.monkies1,
	gScenarios.furniture1,
	gScenarios.falling1
];

var	gOps = {
	continueIntro: new VoteOption("Continue...", gScenarios.intro2),
	pressButton: new VoteOption("Press the button!", null, true),
	grabBeer: new VoteOption("Go out for drinks!", gScenarios.beer1),
	hitOnWoman: new VoteOption("Hit on the lady at the bar", gScenarios.beer2),
	keepDrinking: new VoteOption("Keep drinking! Go go go!", gScenarios.beer3),
	pressButtonAtBar: new VoteOption("Press the button!", gScenarios.beer4),
	insultBarkeep: new VoteOption("Call the bartender a giant doosh canoe", gScenarios.beer5),
	leaveBar: new VoteOption("Leave the bar", gScenarios.beer5),
	swallowKeys: new VoteOption("You should definitely swallow your keys to make sure you don't drive.", gScenarios.beer6),
	callCab: new VoteOption("Call a cab.", gScenarios.beer7),
	enjoyFall: new VoteOption("This is kinda relaxing.  Let's just enjoy the freefall.", gScenarios.falling2),
	flipSwitch: new VoteOption("Flip the mysterious switch", gScenarios.furniture2),
	enterHouse: new VoteOption("Enter the mysterious house", gScenarios.ml2),
	exploreForest: new VoteOption("Explore the spooky forest", gScenarios.ml3),	
	exploreForestMore: new VoteOption("Wander around some more", gScenarios.ml4),
	enterCave: new VoteOption("Enter the mysterious cave", null, true),
	drinkPoison: new VoteOption("Drink the skull and crossbones thing.", gScenarios.mldeath),
	drinkShrinkPotion: new VoteOption("Drink the tiny vial.", gScenarios.ml5),
	drinkBeverage: new VoteOption("Drink carton of whatever.", gScenarios.ml25),
	mouseHole: new VoteOption("Go check out the mouse hole!", gScenarios.ml6),
	floorHole: new VoteOption("Check out the crack in the floorboards", null, true),
	leaveMousehole: new VoteOption("Just... just walk away...", gScenarios.ml5),
	acceptMouseOffer: new VoteOption("Wine and cheese? Cool!", gScenarios.mlend),
	raceMoas: new VoteOption("Let's race them!", gScenarios.moa2),
	raceSomeMoa: new VoteOption("We should race them some moa!", gScenarios.moa3),
	flingPoop: new VoteOption("Fling poop at each other", gScenarios.monkies2),
	goBananas: new VoteOption("Just go bananas!", gScenarios.monkies3),
	buildSociety: new VoteOption("Build a monkey society", gScenarios.monkies4),
	improveFire: new VoteOption("Find more efficient fuel for fires", gScenarios.monkies5),
	electLeader: new VoteOption("Elect a leader", gScenarios.monkies6),
	enterCode: new VoteOption("Enter the catnami code", gScenarios.catnami3),
	higherGround: new VoteOption("Run for higher ground!", gScenarios.catnami2),
	konamiCode: new VoteOption("Up Up Down Down Left Right...", gScenarios.catnami4),
	catnamiCode: new VoteOption("Up Up Meow Meow Left Right...", gScenarios.catnami5),
	dontKnowCode: new VoteOption("Crap.  I don't know what it is...", gScenarios.catnami4),
	restart: new VoteOption("Play again", gScenarios.intro1)
};

// Add all the options to the scenarios
gScenarios.intro1.setOptions([gOps.continueIntro]);
gScenarios.intro2.setOptions([gOps.pressButton, gOps.grabBeer]);
gScenarios.beer1.setOptions([gOps.pressButton, gOps.keepDrinking, gOps.hitOnWoman]);
gScenarios.beer2.setOptions([gOps.pressButton, gOps.keepDrinking]);
gScenarios.beer3.setOptions([gOps.pressButtonAtBar, gOps.insultBarkeep, gOps.leaveBar]);
gScenarios.beer4.setOptions([gOps.leaveBar]);
gScenarios.beer5.setOptions([gOps.swallowKeys, gOps.callCab]);
gScenarios.beer6.setOptions([gOps.restart]);
gScenarios.beer7.setOptions([gOps.restart]);
gScenarios.falling1.setOptions([gOps.pressButton, gOps.enjoyFall]);
gScenarios.falling2.setOptions([gOps.restart]);
gScenarios.furniture1.setOptions([gOps.pressButton, gOps.flipSwitch]);
gScenarios.furniture2.setOptions([gOps.restart]);
gScenarios.ml1.setOptions([gOps.enterHouse, gOps.exploreForest, gOps.pressButton]);
gScenarios.ml2.setOptions([gOps.drinkPoison, gOps.drinkShrinkPotion, gOps.drinkBeverage]);
gScenarios.ml25.setOptions([gOps.drinkPoison, gOps.drinkShrinkPotion]);
gScenarios.ml3.setOptions([gOps.exploreForestMore, gOps.pressButton]);
gScenarios.ml4.setOptions([gOps.enterCave, gOps.exploreForest]);
gScenarios.ml5.setOptions([gOps.mouseHole, gOps.floorHole]);
gScenarios.ml6.setOptions([gOps.leaveMousehole, gOps.acceptMouseOffer]);
gScenarios.mlend.setOptions([gOps.restart]);
gScenarios.mldeath.setOptions([gOps.restart]);
gScenarios.monkies1.setOptions([gOps.flingPoop, gOps.pressButton, gOps.buildSociety]);
gScenarios.monkies2.setOptions([gOps.pressButton, gOps.goBananas]);
gScenarios.monkies3.setOptions([gOps.restart]);
gScenarios.monkies4.setOptions([gOps.improveFire, gOps.electLeader]);
gScenarios.monkies5.setOptions([gOps.restart]);
gScenarios.monkies6.setOptions([gOps.restart]);
gScenarios.moa1.setOptions([gOps.raceMoas, gOps.grabBeer, gOps.pressButton]);
gScenarios.moa2.setOptions([gOps.raceSomeMoa, gOps.grabBeer, gOps.pressButton]);
gScenarios.moa3.setOptions([gOps.restart]);
gScenarios.catnami1.setOptions([gOps.pressButton, gOps.higherGround, gOps.enterCode]);
gScenarios.catnami2.setOptions([gOps.restart]); 
gScenarios.catnami3.setOptions([gOps.konamiCode, gOps.catnamiCode, gOps.dontKnowCode]);
gScenarios.catnami4.setOptions([gOps.restart]);
gScenarios.catnami5.setOptions([gOps.restart]);
