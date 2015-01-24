//////////////////////////////////////////
// All our scenario data and contianers //
//////////////////////////////////////////

var Scenario = Class.create({
	options: null,
	text: "",
	wdwdnText: "",
	background: null,

	initialize: function(_text, _wdwdnText, _bgAsset) {
		this.text = _text;
		this.wdwdnText = _wdwdnText;
		this.background = new Background(_bgAsset);
	},

	setOptions: function(_options) {
		this.options = _options;
	}

});

var VoteOption = Class.create({
	text: "",
	destination: null,

	initialize: function(_text, _dest, _randomize) {
		this.text = _text;
		this.destination = _dest;
		if (_randomize)
			this.destination = getRandomScenario();
	},

	getRandomScenario: function() {
		var index = Math.floor(Math.random() * gRootScenarios.length);
		return gRootScenarios[index];
	}
});

// All the possible scenes, including endings
var gScenarios = {
	intro: new Scenario("You've been given a mysterious button.  Have fun!", 
		"What do we do now?", "images/initialScreen.png"),
	beer1: new Scenario("You all went out for drinks!", 
		"What should we do now?", "images/initialScreen.png"),
	beer2: new Scenario("All four of you tried to hit on the girl at the bar.  That's super creepy, guys.  You all got smacked.", 
		"Ow... what we do now?", "images/initialScreen.png"),
	beer3: new Scenario("You've all had far too many drinks.  The bartender refuses to give you more.", 
		"Wha... what should... guys... guys, what do we do now?", "images/initialScreen.png"),
	beer4: new Scenario("Despite your best efforts, you're all too drunk to actually press the button.", 
		"...?", "images/initialScreen.png"),
	beer5: new Scenario("UNKNOWN", 
		"...?", "images/initialScreen.png"),
	catnami1: new Scenario("You’ve arrived on a beach.  In the distance is an enormous tsunami... made of cats.  One might call it a catnami.", 
		"Cat do we do meow!?", "images/initialScreen.png"),
	catnami2: new Scenario("You’ve chosen to enter the Catnami Code.  You'll just have to remember what it is...", 
		"Cat do we do meow!?", "images/initialScreen.png"),
	catnami3: new Scenario("You escaped to higher ground, but now the cats have the button.  The entire universe is doomed.", 
		"THE END", "images/initialScreen.png"),
};

// These are the root scenes that we want to jump between
var gRootScenarios = [
	gScenarios.catnami1
];

// All possible voting options
var gOps = {
	// Find a nice way to make this one randomize
	pressButton: new VoteOption("Press the button!", null, true),
	grabBeer: new VoteOption("Go out for drinks!", gScenarios.beer1),
	hitOnWoman: new VoteOption("Hit on the lady at the bar", gScenarios.beer2),
	keepDrinking: new VoteOption("Keep drinking! Go go go!", gScenarios.beer3),
	pressButtonAtBar: new VoteOption("Press the button!", gScenarios.beer4),
	insultBarkeep: new VoteOption("Call the bartender a giant doosh canoe", gScenarios.beer5),
	leaveBar: new VoteOption("Leave the bar", gScenarios.beer5),
	higherGround: new VoteOption("Run for higher ground!", gScenarios.catnami3)
};

// Add all the options to the scenarios
gScenarios.intro.setOptions([gOps.pressButton, gOps.grabBeer]);
gScenarios.beer1.setOptions([gOps.pressButton, gOps.hitOnWoman]);
gScenarios.beer2.setOptions([gOps.pressButton, gOps.keepDrinking]);
gScenarios.beer3.setOptions([gOps.pressButtonAtBar, gOps.insultBarkeep, gOps.leaveBar]);
gScenarios.beer4.setOptions([gOps.leaveBar]);
gScenarios.beer5.setOptions([gOps.pressButton]); //unfinished
gScenarios.catnami1.setOptions([gOps.pressButton, gOps.higherGround]); //unfinished
gScenarios.catnami2.setOptions([gOps.pressButton]); //unfinished
