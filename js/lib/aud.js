
const BUFFER_SIZE = 4096;
const NUM_OUTPUTS = 2;
const NUM_INPUTS = 0; 
		
var audio_context = new webkitAudioContext();
var sampleRate = this.audio_context.sampleRate;
var node = this.audio_context.createJavaScriptNode(BUFFER_SIZE, NUM_INPUTS, NUM_OUTPUTS);

var aud_waves = new function(){
	this.Saw = 0;
	this.Tri = 1;
	this.Square = 2;
	this.Noise = 3;
}    
	
var aud_interface = function()
{   
	this.pattern = 0;
	this.increment_pattern_pos = 0;
	this.to_pattern = 0;
	this.to_time = 0;
	this.to_total = 0;
	
	this.paused = true;
	
	this.gainNode = audio_context.createGainNode();
    this.gainNode.gain.value = 1;
    node.connect(this.gainNode);
    this.gainNode.connect(audio_context.destination);	

	this.notes = new Array();
	for (var i = 0; i < 8; i++)
		this.notes[i * 12] = 4186.01 /* C 8 */ / Math.pow(2, 8 - i - 1); // C notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 1] = 2217.46 /* C# 7 */ / Math.pow(2, 7 - i - 1); // C# notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 2] = 2349.32 /* D 7 */ / Math.pow(2, 7 - i - 1); // D notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 3] = 2489.02 /* D# 7 */ / Math.pow(2, 7 - i - 1); // D# notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 4] = 2637.02 /* E 7 */ / Math.pow(2, 7 - i - 1); // E notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 5] = 2793.83 /* F 7 */ / Math.pow(2, 7 - i - 1); // F notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 6] = 2959.96 /* F# 7 */ / Math.pow(2, 7 - i - 1); // F# notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 7] = 3135.96 /* G 7 */ / Math.pow(2, 7 - i - 1); // G notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 8] = 3322.44 /* G# 7 */ / Math.pow(2, 7 - i - 1); // G# notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 9] = 3520.00 /* A 7 */ / Math.pow(2, 7 - i - 1); // A notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 10] = 3729.31 /* A# 7 */ / Math.pow(2, 7 - i - 1); // A# notes
	for (var i = 0; i < 7; i++)
		this.notes[i * 12 + 11] = 3951.07 /* B 7 */ / Math.pow(2, 7 - i - 1); // B notes

    var self = this;
	
	this.NoteToFrequency = function(note)
	{
		return self.notes[note];
	}	
	
	this.NoteToLetter = function(note)
	{
		var retval = "";
		switch (note % 12)
		{
			case 0: retval += "C "; break;
			case 1: retval += "C# "; break;
			case 2: retval += "D "; break;
			case 3: retval += "D# "; break;
			case 4: retval += "E "; break;
			case 5: retval += "F "; break;
			case 6: retval += "F# "; break;
			case 7: retval += "G "; break;
			case 8: retval += "G# "; break;
			case 9: retval += "A "; break;
			case 10: retval += "A# "; break;
			case 11: retval += "B "; break;
		}
		retval += (Math.floor(note / 12) + 1) + " ";
		
		return retval;
	}
	
	this.t = 0;
	this.prev_pos = 0;
	this.vol = 1;
		
	this.generateAudio = function(e)
	{
		var left  = e.outputBuffer.getChannelData(0);
		var right = e.outputBuffer.getChannelData(1);

		var numTracks = self.pattern.length;

		var numSamples = left.length;
		for (var i = 0; i < numSamples; i++) 
		{		
			main_output = 0;
			var current_pat_pos = Math.floor(self.t / 10000);
			var phase = self.t / sampleRate * 2 * Math.PI;
			
			// Start
			for (var track = 0; track < numTracks; track++)
			{
				var wave = self.pattern[track].instrument.waveform;
				
				var curpos = current_pat_pos % self.pattern[track].pattern.length;
				var note = self.pattern[track].pattern[curpos];
				// find nearest note played
				var temp = 1;
				while (note < 0 && temp < self.pattern[track].instrument.length)
				{
					curpos--;
					if (curpos == -1) curpos = self.pattern[track].pattern.length - 1;
					
					note = self.pattern[track].pattern[curpos];
					temp++;
				}
				if (note < 0) continue;
				
				var freq = self.notes[note];
				var amp = 1, depth = 10000 * (temp - 1) + self.t % 10000; 
				if (depth < self.pattern[track].instrument.attackTime)
				{
					amp = depth / self.pattern[track].instrument.attackTime;
				}
				else if (depth > self.pattern[track].instrument.attackTime + self.pattern[track].instrument.sustainTime)
				{
					depth -= (self.pattern[track].instrument.attackTime + self.pattern[track].instrument.sustainTime);
					if (depth > self.pattern[track].instrument.decayTime)
					{					
						amp = 0;
					}
					else
					{
						amp = 1 - (depth / self.pattern[track].instrument.decayTime);
					}
				}
				amp *= self.pattern[track].instrument.volume * self.vol;
				
				if (wave == aud_waves.Square)
				{
					main_output += ((Math.sin(phase * freq) > 0? 1: -1) / numTracks * amp);
				}
				else if (wave == aud_waves.Tri)
				{
					main_output += (((Math.acos(Math.cos(phase * freq)) - 1.57) / 1.57) / numTracks * amp);
				}
				else if (wave == aud_waves.Saw)
				{
					var temp = (Math.acos(Math.cos(phase * freq))) / 3.14;
					main_output += ((Math.sin(phase * freq) > 0? temp : -temp) / numTracks * amp);
				}
				else if (wave == aud_waves.Noise)
				{
					if (note == 0 || self.t % note == 0)
					{
						main_output += ((Math.random(2) - 1) / numTracks * amp);
					}
				}	
			}
			
			if (self.to_time != 0)
			{
				main_output *= (self.to_time / self.to_total);
				var lerp = 1 - (self.to_time / self.to_total);
			
				for (var track = 0; track < numTracks; track++)
				{
					var wave = self.to_pattern[track].instrument.waveform;
					
					var curpos = current_pat_pos % self.to_pattern[track].pattern.length;
					var note = self.to_pattern[track].pattern[curpos];
					// find nearest note played
					var temp = 1;
					while (note < 0 && temp < self.to_pattern[track].instrument.length)
					{
						curpos--;
						if (curpos == -1) curpos = self.to_pattern[track].pattern.length - 1;
						
						note = self.to_pattern[track].pattern[curpos];
						temp++;
					}
					if (note < 0) continue;
					
					var freq = self.notes[note];
					var amp = 1, depth = 10000 * (temp - 1) + self.t % 10000; 
					if (depth < self.to_pattern[track].instrument.attackTime)
					{
						amp = depth / self.to_pattern[track].instrument.attackTime;
					}
					else if (depth > self.to_pattern[track].instrument.attackTime + self.to_pattern[track].instrument.sustainTime)
					{
						depth -= (self.to_pattern[track].instrument.attackTime + self.to_pattern[track].instrument.sustainTime);
						if (depth > self.to_pattern[track].instrument.decayTime)
						{					
							amp = 0;
						}
						else
						{
							amp = 1 - (depth / self.to_pattern[track].instrument.decayTime);
						}
					}
					amp *= self.to_pattern[track].instrument.volume;
					
					if (wave == aud_waves.Square)
					{
						main_output += ((Math.sin(phase * freq) > 0? 1: -1) / numTracks * amp) * lerp;
					}
					else if (wave == aud_waves.Tri)
					{
						main_output += (((Math.acos(Math.cos(phase * freq)) - 1.57) / 1.57) / numTracks * amp) * lerp;
					}
					else if (wave == aud_waves.Saw)
					{
						var temp = (Math.acos(Math.cos(phase * freq))) / 3.14;
						main_output += ((Math.sin(phase * freq) > 0? temp : -temp) / numTracks * amp) * lerp;
					}
					else if (wave == aud_waves.Noise)
					{
						if (note == 0 || self.t % note == 0)
						{
							main_output += ((Math.random(2) - 1) / numTracks * amp) * lerp;
						}
					}	
				}
				self.to_time--;
				if (self.to_time == 0)
				{
					self.pattern = self.to_pattern;
				}
			}
				
			// End
			
			if (self.paused)
			{
				right[i] = 0;
				left[i] = 0;
			}
			else
			{
				right[i] = main_output;
				left[i] = main_output;
				self.t += 1;
			}
		}
		
		if (self.increment_pattern_pos != 0  && Math.floor(self.t / 10000) > self.prev_pos) 
		{
			self.increment_pattern_pos();
			self.prev_pos++;
		}
	}
	
    node.onaudioprocess = function(e) {
        self.generateAudio(e);
    };
	
	this.soundAt = function(index)
	{	
		var pat_pos = Math.floor(index / 10000);
		var ret = 0;
		var phase = index / sampleRate * 2 * Math.PI;
		var numTracks = self.pattern.length;

		for (var track = 0; track < numTracks; track++)
		{
			var wave = self.pattern[track].instrument.waveform;
			
			var curpos = pat_pos % self.pattern[track].pattern.length;
			var note = self.pattern[track].pattern[curpos];
			// find nearest note played
			var temp = 1;
			while (note < 0 && temp < self.pattern[track].instrument.length)
			{
				curpos--;
				if (curpos == -1) curpos = self.pattern[track].pattern.length - 1;
				
				note = self.pattern[track].pattern[curpos];
				temp++;
			}
			if (note < 0) continue;
			
			var freq = self.notes[note];
			var amp = 1, depth = 10000 * (temp - 1) + index % 10000; 
			if (depth < self.pattern[track].instrument.attackTime)
			{
				amp = depth / self.pattern[track].instrument.attackTime;
			}
			else if (depth > self.pattern[track].instrument.attackTime + self.pattern[track].instrument.sustainTime)
			{
				depth -= (self.pattern[track].instrument.attackTime + self.pattern[track].instrument.sustainTime);
				if (depth > self.pattern[track].instrument.decayTime)
				{					
					amp = 0;
				}
				else
				{
					amp = 1 - (depth / self.pattern[track].instrument.decayTime);
				}
			}
			amp *= self.pattern[track].instrument.volume;
			
			if (wave == aud_waves.Square)
			{
				ret += ((Math.sin(phase * freq) > 0? 1: -1) / numTracks * amp);
			}
			else if (wave == aud_waves.Tri)
			{
				ret += (((Math.acos(Math.cos(phase * freq)) - 1.57) / 1.57) / numTracks * amp);
			}
			else if (wave == aud_waves.Saw)
			{
				var temp = (Math.acos(Math.cos(phase * freq))) / 3.14;
				ret += ((Math.sin(phase * freq) > 0? temp : -temp) / numTracks * amp);
			}
			else if (wave == aud_waves.Noise)
			{
				if (note == 0 || self.t % note == 0)
				{
					ret += ((Math.random(2) - 1) / numTracks * amp);
				}
			}	
		}
		
		return ret;
	}
}

var aud_instrument = function(at, st, dt, wf)
{
	this.attackTime = at * 200;
	this.sustainTime = st * 200;
	this.decayTime = dt * 200;
	this.waveform = wf;
	this.length = Math.ceil((at + st + dt) / 50);
	this.volume = 1;
}

var aud_pattern = new Array();
var aud_track = function(inst)
{
	this.velocities = new Array();
	this.pattern = new Array();
	this.instrument = inst;
}
	
var aud = new function()
{
	this.random;
	var self = this;
	var rng = function(seed)
	{
		this.seed = Math.floor(seed);
		this.MAX = 100000000;
		this.hike1 = Math.floor((10 - 9 * Math.cos(seed)) * 12345678);
		this.hike2 = Math.floor((10 - 9 * Math.sin(seed)) * 123456);
		this.prev = seed;
		
		this.next = function()
		{
			var ret = self.random.prev;
			ret += self.random.hike1;
			ret += self.random.hike2;
			ret %= self.random.MAX;
			
			ret = ret << 3 ^ ret >> 3;
			ret %= self.random.MAX;
			
			self.random.prev = Math.floor(ret);
			return ret / self.random.MAX;
		}
		
		self.random = this;
	}
	
	this.ontick = 0;
	this.pattern = 0;
	this.pattern_position = 0;
	
	this.interf = new aud_interface();
	this.interf.increment_pattern_pos = function() {
		self.pattern_position++;
		if (self.ontick != 0)
		{
			self.pattern_position %= self.pattern[0].pattern.length;
			self.ontick();
		}
	}
	
	this.clear = function()
	{
		self.pattern = new Array();
				
		for (var i = 0; i < 18; i++)
		{
			// clear 18 instruments' worth of pattern out
			self.pattern.push(new aud_track(new aud_instrument(0, 10, 0, 0)));
			self.pattern[i].pattern[0] = -1;
		}
		
		self.interf.pattern = self.pattern;
	}
	
	this.resumepause = function()
	{
		self.interf.paused = !self.interf.paused;		
	}
	this.playstop = function()
	{
		self.interf.t = 0;
		self.pattern_position = 0;
		self.interf.prev_pos = 0;
		self.interf.paused = !self.interf.paused;
		if (self.ontick != 0) self.ontick();
	}
	this.isplaying = function()
	{
		return !self.interf.paused;
	}
	this.setvolume = function(newvolume)
	{
		self.interf.vol = newvolume; 
	}
	
	this.LL = 0;
	this.LM = 1;
	this.LH = 2;
	this.ML = 3;
	this.MM = 4;
	this.HM = 5;
	this.HL = 6;
	this.HM = 7;
	this.HH = 8;
	this.followMatrices = new Array();
	this.joinMatrices = new Array();
	this.prevalenceArrays = new Array();
	
	this.joinMatrices[this.LL] = new Array(
		new Array(1.000,	0.000,	0.141,	0.236,	0.384,	0.332,	0.043,	0.263,	0.181,	0.318,	0.053,	0.054	),
		new Array(0.000,	1.000,	0.006,	0.000,	0.009,	0.005,	0.000,	0.009,	0.053,	0.021,	0.079,	0.009	),
		new Array(0.118,	0.083,	1.000,	0.019,	0.071,	0.192,	0.109,	0.151,	0.006,	0.130,	0.272,	0.310	),
		new Array(0.037,	0.000,	0.009,	1.000,	0.000,	0.017,	0.167,	0.034,	0.138,	0.004,	0.073,	0.000	),
		new Array(0.159,	0.026,	0.041,	0.000,	1.000,	0.050,	0.003,	0.157,	0.050,	0.066,	0.019,	0.125	),
		new Array(0.211,	0.050,	0.174,	0.087,	0.052,	1.000,	0.000,	0.062,	0.095,	0.296,	0.221,	0.058	),
		new Array(0.011,	0.000,	0.022,	0.019,	0.003,	0.000,	1.000,	0.011,	0.000,	0.033,	0.000,	0.021	),
		new Array(0.171,	0.031,	0.165,	0.223,	0.267,	0.069,	0.047,	1.000,	0.069,	0.056,	0.163,	0.348	),
		new Array(0.032,	0.099,	0.006,	0.116,	0.005,	0.033,	0.000,	0.006,	1.000,	0.000,	0.008,	0.014	),
		new Array(0.190,	0.165,	0.136,	0.032,	0.069,	0.206,	0.211,	0.060,	0.000,	1.000,	0.112,	0.062	),
		new Array(0.020,	0.171,	0.126,	0.101,	0.007,	0.048,	0.000,	0.066,	0.006,	0.024,	1.000,	0.000	),
		new Array(0.052,	0.042,	0.173,	0.000,	0.132,	0.048,	0.253,	0.181,	0.069,	0.051,	0.000,	1.000	)
	);
	this.followMatrices[this.LL] = new Array(
		new Array(0.375,	0.286,	0.088,	0.000,	0.119,	0.231,	0.000,	0.121,	0.600,	0.118,	0.133,	0.156	),
		new Array(0.028,	0.000,	0.059,	0.000,	0.000,	0.026,	0.000,	0.017,	0.000,	0.000,	0.000,	0.031	),
		new Array(0.014,	0.286,	0.265,	0.429,	0.095,	0.051,	0.000,	0.069,	0.000,	0.118,	0.000,	0.094	),
		new Array(0.000,	0.000,	0.088,	0.000,	0.071,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.031	),
		new Array(0.097,	0.000,	0.118,	0.429,	0.190,	0.077,	0.333,	0.121,	0.100,	0.098,	0.067,	0.063	),
		new Array(0.167,	0.143,	0.059,	0.000,	0.071,	0.154,	0.000,	0.086,	0.100,	0.137,	0.067,	0.031	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.024,	0.000,	0.000,	0.017,	0.000,	0.020,	0.000,	0.000	),
		new Array(0.097,	0.143,	0.059,	0.000,	0.262,	0.128,	0.333,	0.241,	0.300,	0.157,	0.200,	0.094	),
		new Array(0.042,	0.000,	0.000,	0.000,	0.024,	0.026,	0.000,	0.052,	0.100,	0.020,	0.000,	0.000	),
		new Array(0.111,	0.000,	0.088,	0.000,	0.190,	0.282,	0.333,	0.155,	0.100,	0.078,	0.133,	0.125	),
		new Array(0.042,	0.000,	0.000,	0.000,	0.024,	0.026,	0.000,	0.052,	0.000,	0.039,	0.200,	0.063	),
		new Array(0.028,	0.143,	0.059,	0.143,	0.190,	0.026,	0.000,	0.069,	0.000,	0.078,	0.133,	0.219	)
	);
	this.prevalenceArrays[this.LL] = new Array(0.184, 0.007, 0.098, 0.033, 0.079, 0.122, 0.025, 0.166, 0.031, 0.121, 0.088, 0.045);

	this.joinMatrices[this.LM] = new Array(
		new Array(1.000,	0.000,	0.088,	0.171,	0.222,	0.141,	0.159,	0.154,	0.109,	0.188,	0.112,	0.046	),
		new Array(0.000,	1.000,	0.006,	0.003,	0.033,	0.050,	0.061,	0.020,	0.025,	0.077,	0.034,	0.000	),
		new Array(0.078,	0.095,	1.000,	0.022,	0.034,	0.159,	0.037,	0.152,	0.086,	0.113,	0.161,	0.209	),
		new Array(0.092,	0.003,	0.006,	1.000,	0.022,	0.019,	0.042,	0.020,	0.053,	0.055,	0.027,	0.000	),
		new Array(0.233,	0.130,	0.035,	0.009,	1.000,	0.012,	0.010,	0.261,	0.080,	0.048,	0.015,	0.082	),
		new Array(0.181,	0.092,	0.193,	0.112,	0.052,	1.000,	0.007,	0.115,	0.327,	0.274,	0.271,	0.210	),
		new Array(0.022,	0.036,	0.021,	0.047,	0.016,	0.006,	1.000,	0.006,	0.019,	0.038,	0.041,	0.179	),
		new Array(0.145,	0.005,	0.160,	0.028,	0.294,	0.060,	0.014,	1.000,	0.008,	0.045,	0.094,	0.177	),
		new Array(0.058,	0.033,	0.112,	0.040,	0.052,	0.063,	0.027,	0.035,	1.000,	0.050,	0.025,	0.044	),
		new Array(0.103,	0.137,	0.173,	0.092,	0.045,	0.113,	0.095,	0.048,	0.007,	1.000,	0.075,	0.050	),
		new Array(0.079,	0.040,	0.128,	0.047,	0.030,	0.216,	0.048,	0.090,	0.202,	0.089,	1.000,	0.003	),
		new Array(0.009,	0.000,	0.078,	0.000,	0.058,	0.018,	0.070,	0.099,	0.085,	0.023,	0.002,	1.000	)
	);
	this.followMatrices[this.LM] = new Array(
		new Array(0.320,	0.051,	0.171,	0.000,	0.137,	0.000,	0.048,	0.039,	0.000,	0.186,	0.333,	0.157	),
		new Array(0.040,	0.205,	0.012,	0.000,	0.027,	0.000,	0.214,	0.045,	0.000,	0.058,	0.000,	0.020	),
		new Array(0.100,	0.026,	0.183,	0.250,	0.027,	0.000,	0.286,	0.050,	0.000,	0.128,	0.000,	0.206	),
		new Array(0.000,	0.000,	0.012,	0.000,	0.027,	0.000,	0.000,	0.006,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.140,	0.179,	0.049,	0.500,	0.356,	0.000,	0.214,	0.034,	0.000,	0.035,	0.000,	0.020	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.030,	0.103,	0.061,	0.000,	0.110,	0.000,	0.048,	0.084,	0.000,	0.023,	0.000,	0.029	),
		new Array(0.200,	0.487,	0.085,	0.500,	0.151,	0.000,	0.476,	0.285,	0.000,	0.209,	0.000,	0.304	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.030,	0.103,	0.171,	0.000,	0.055,	0.000,	0.167,	0.106,	0.000,	0.256,	0.333,	0.118	),
		new Array(0.010,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.012,	0.000,	0.010	),
		new Array(0.060,	0.051,	0.098,	0.000,	0.329,	0.000,	0.071,	0.095,	0.000,	0.093,	0.333,	0.324	)
	);
	this.prevalenceArrays[this.LM] = new Array(0.209, 0.022, 0.075, 0.040, 0.067, 0.108, 0.033, 0.171, 0.036, 0.119, 0.077, 0.042);

	this.joinMatrices[this.LH] = new Array(
		new Array(1.000,	0.005,	0.072,	0.101,	0.417,	0.179,	0.120,	0.167,	0.146,	0.309,	0.065,	0.040	),
		new Array(0.001,	1.000,	0.000,	0.000,	0.018,	0.007,	0.009,	0.009,	0.000,	0.009,	0.009,	0.003	),
		new Array(0.067,	0.000,	1.000,	0.055,	0.084,	0.185,	0.101,	0.271,	0.078,	0.099,	0.193,	0.385	),
		new Array(0.017,	0.000,	0.010,	1.000,	0.002,	0.007,	0.009,	0.018,	0.121,	0.008,	0.000,	0.019	),
		new Array(0.222,	0.109,	0.066,	0.008,	1.000,	0.033,	0.268,	0.294,	0.073,	0.094,	0.051,	0.058	),
		new Array(0.238,	0.031,	0.258,	0.051,	0.039,	1.000,	0.018,	0.100,	0.019,	0.301,	0.268,	0.026	),
		new Array(0.072,	0.005,	0.062,	0.004,	0.007,	0.002,	1.000,	0.005,	0.000,	0.066,	0.065,	0.003	),
		new Array(0.139,	0.063,	0.169,	0.104,	0.279,	0.067,	0.054,	1.000,	0.016,	0.077,	0.054,	0.173	),
		new Array(0.023,	0.000,	0.014,	0.106,	0.014,	0.003,	0.000,	0.002,	1.000,	0.008,	0.000,	0.028	),
		new Array(0.170,	0.271,	0.084,	0.262,	0.077,	0.137,	0.091,	0.044,	0.039,	1.000,	0.044,	0.015	),
		new Array(0.027,	0.005,	0.105,	0.000,	0.035,	0.106,	0.063,	0.028,	0.000,	0.018,	1.000,	0.000	),
		new Array(0.025,	0.010,	0.159,	0.058,	0.029,	0.024,	0.018,	0.062,	0.259,	0.010,	0.000,	1.000	)
	);
	this.followMatrices[this.LH] = new Array(
		new Array(0.312,	0.000,	0.150,	0.125,	0.286,	0.190,	0.000,	0.346,	0.143,	0.129,	0.094,	0.105	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.118,	0.000,	0.133,	0.167,	0.286,	0.238,	0.000,	0.136,	0.143,	0.043,	0.151,	0.158	),
		new Array(0.065,	0.000,	0.067,	0.167,	0.000,	0.048,	0.000,	0.012,	0.286,	0.086,	0.019,	0.000	),
		new Array(0.022,	0.000,	0.033,	0.000,	0.000,	0.000,	0.200,	0.000,	0.000,	0.022,	0.000,	0.053	),
		new Array(0.043,	0.000,	0.067,	0.083,	0.000,	0.071,	0.000,	0.049,	0.429,	0.151,	0.226,	0.158	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.143,	0.000,	0.200,	0.012,	0.000,	0.022,	0.019,	0.000	),
		new Array(0.258,	0.000,	0.283,	0.042,	0.000,	0.095,	0.200,	0.284,	0.000,	0.086,	0.113,	0.053	),
		new Array(0.011,	0.000,	0.017,	0.083,	0.000,	0.024,	0.000,	0.000,	0.286,	0.000,	0.000,	0.000	),
		new Array(0.032,	0.000,	0.033,	0.167,	0.143,	0.167,	0.200,	0.043,	0.000,	0.323,	0.151,	0.105	),
		new Array(0.022,	0.000,	0.100,	0.042,	0.000,	0.357,	0.200,	0.012,	0.000,	0.215,	0.283,	0.105	),
		new Array(0.043,	0.000,	0.050,	0.000,	0.143,	0.071,	0.000,	0.062,	0.000,	0.022,	0.038,	0.000	)
	);
	this.prevalenceArrays[this.LH] = new Array(0.211, 0.005, 0.089, 0.009, 0.123, 0.114, 0.006, 0.178, 0.011, 0.125, 0.081, 0.047);
	
	this.joinMatrices[this.ML] = new Array(
		new Array(1.000,	0.017,	0.112,	0.087,	0.237,	0.132,	0.085,	0.233,	0.086,	0.149,	0.095,	0.080	),
		new Array(0.006,	1.000,	0.000,	0.024,	0.082,	0.091,	0.083,	0.023,	0.070,	0.059,	0.227,	0.044	),
		new Array(0.094,	0.000,	1.000,	0.003,	0.039,	0.129,	0.130,	0.193,	0.105,	0.080,	0.126,	0.102	),
		new Array(0.063,	0.019,	0.004,	1.000,	0.016,	0.055,	0.030,	0.117,	0.131,	0.022,	0.069,	0.064	),
		new Array(0.144,	0.077,	0.054,	0.024,	1.000,	0.025,	0.010,	0.098,	0.025,	0.154,	0.008,	0.170	),
		new Array(0.171,	0.272,	0.200,	0.096,	0.039,	1.000,	0.013,	0.098,	0.166,	0.107,	0.237,	0.117	),
		new Array(0.011,	0.047,	0.021,	0.021,	0.027,	0.002,	1.000,	0.000,	0.221,	0.042,	0.056,	0.049	),
		new Array(0.246,	0.147,	0.254,	0.145,	0.212,	0.107,	0.000,	1.000,	0.035,	0.106,	0.135,	0.234	),
		new Array(0.090,	0.122,	0.115,	0.190,	0.054,	0.132,	0.053,	0.026,	1.000,	0.025,	0.042,	0.049	),
		new Array(0.099,	0.139,	0.070,	0.032,	0.151,	0.068,	0.134,	0.061,	0.025,	1.000,	0.002,	0.054	),
		new Array(0.044,	0.130,	0.120,	0.149,	0.051,	0.211,	0.188,	0.075,	0.113,	0.009,	1.000,	0.036	),
		new Array(0.031,	0.031,	0.050,	0.030,	0.091,	0.049,	0.073,	0.077,	0.022,	0.047,	0.004,	1.000	)
	);
	this.followMatrices[this.ML] = new Array(
		new Array(0.147,	0.000,	0.191,	0.378,	0.000,	0.238,	0.667,	0.275,	0.286,	0.150,	0.143,	0.200	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.053,	0.000,	0.149,	0.162,	0.000,	0.143,	0.333,	0.157,	0.143,	0.200,	0.229,	0.000	),
		new Array(0.107,	0.000,	0.149,	0.216,	0.000,	0.024,	0.000,	0.196,	0.048,	0.000,	0.057,	0.000	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.107,	0.000,	0.106,	0.135,	0.000,	0.048,	0.000,	0.059,	0.143,	0.150,	0.314,	0.400	),
		new Array(0.013,	0.000,	0.021,	0.000,	0.000,	0.000,	0.000,	0.020,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.187,	0.000,	0.170,	0.216,	0.000,	0.167,	0.333,	0.098,	0.095,	0.050,	0.086,	0.400	),
		new Array(0.053,	0.000,	0.043,	0.108,	0.000,	0.095,	0.000,	0.039,	0.143,	0.050,	0.029,	0.000	),
		new Array(0.093,	0.000,	0.149,	0.000,	0.000,	0.071,	0.000,	0.020,	0.048,	0.000,	0.029,	0.000	),
		new Array(0.160,	0.000,	0.064,	0.081,	0.000,	0.167,	0.000,	0.039,	0.048,	0.200,	0.086,	0.000	),
		new Array(0.013,	0.000,	0.000,	0.000,	0.000,	0.048,	0.000,	0.039,	0.000,	0.000,	0.000,	0.000	)
	);
	this.prevalenceArrays[this.ML] = new Array(0.173, 0.043, 0.123, 0.063, 0.063, 0.105, 0.046, 0.142, 0.047, 0.079, 0.054, 0.063);

	this.joinMatrices[this.MH] = new Array(
		new Array(1.000,	0.019,	0.028,	0.103,	0.081,	0.066,	0.025,	0.123,	0.097,	0.123,	0.077,	0.012	),
		new Array(0.019,	1.000,	0.101,	0.058,	0.080,	0.134,	0.089,	0.008,	0.115,	0.058,	0.276,	0.054	),
		new Array(0.019,	0.014,	1.000,	0.054,	0.119,	0.092,	0.058,	0.089,	0.015,	0.041,	0.055,	0.009	),
		new Array(0.184,	0.136,	0.062,	1.000,	0.022,	0.043,	0.106,	0.103,	0.255,	0.031,	0.121,	0.116	),
		new Array(0.023,	0.066,	0.030,	0.024,	1.000,	0.001,	0.024,	0.008,	0.072,	0.056,	0.004,	0.030	),
		new Array(0.101,	0.150,	0.125,	0.050,	0.025,	1.000,	0.011,	0.062,	0.130,	0.277,	0.057,	0.055	),
		new Array(0.064,	0.073,	0.017,	0.141,	0.038,	0.007,	1.000,	0.000,	0.029,	0.026,	0.073,	0.152	),
		new Array(0.092,	0.092,	0.113,	0.107,	0.100,	0.051,	0.000,	1.000,	0.011,	0.072,	0.069,	0.028	),
		new Array(0.165,	0.085,	0.024,	0.081,	0.123,	0.103,	0.076,	0.009,	1.000,	0.010,	0.096,	0.019	),
		new Array(0.094,	0.027,	0.023,	0.025,	0.026,	0.106,	0.020,	0.032,	0.008,	1.000,	0.000,	0.013	),
		new Array(0.065,	0.135,	0.088,	0.083,	0.019,	0.044,	0.108,	0.054,	0.080,	0.000,	1.000,	0.014	),
		new Array(0.007,	0.036,	0.056,	0.107,	0.033,	0.020,	0.151,	0.013,	0.022,	0.137,	0.006,	1.000	)
	);
	this.followMatrices[this.MH] = new Array(
		new Array(0.381,	0.000,	0.169,	0.222,	0.125,	0.103,	0.111,	0.104,	0.154,	0.235,	0.308,	0.219	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.086,	0.000,	0.056,	0.204,	0.125,	0.308,	0.111,	0.135,	0.000,	0.000,	0.077,	0.500	),
		new Array(0.105,	0.000,	0.099,	0.167,	0.125,	0.256,	0.222,	0.083,	0.077,	0.000,	0.038,	0.000	),
		new Array(0.019,	0.000,	0.028,	0.037,	0.250,	0.051,	0.111,	0.021,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.038,	0.000,	0.056,	0.037,	0.125,	0.205,	0.111,	0.063,	0.308,	0.059,	0.077,	0.000	),
		new Array(0.019,	0.000,	0.028,	0.074,	0.125,	0.051,	0.111,	0.021,	0.000,	0.118,	0.000,	0.000	),
		new Array(0.238,	0.000,	0.028,	0.074,	0.125,	0.103,	0.222,	0.438,	0.077,	0.118,	0.077,	0.219	),
		new Array(0.038,	0.000,	0.000,	0.037,	0.000,	0.205,	0.000,	0.021,	0.000,	0.000,	0.154,	0.188	),
		new Array(0.019,	0.000,	0.000,	0.000,	0.000,	0.026,	0.111,	0.021,	0.000,	0.235,	0.077,	0.125	),
		new Array(0.076,	0.000,	0.085,	0.019,	0.000,	0.051,	0.000,	0.021,	0.154,	0.176,	0.000,	0.000	),
		new Array(0.019,	0.000,	0.225,	0.000,	0.000,	0.000,	0.000,	0.042,	0.231,	0.235,	0.000,	0.000	)
	);
	this.prevalenceArrays[this.MH] = new Array(0.169, 0.070, 0.077, 0.073, 0.040, 0.057, 0.041, 0.177, 0.085, 0.049, 0.120, 0.042);

	this.joinMatrices[this.MM] = new Array(
		new Array(1.000,	0.000,	0.097,	0.144,	0.043,	0.112,	0.000,	0.216,	0.027,	0.038,	0.051,	0.030	),
		new Array(0.000,	1.000,	0.008,	0.000,	0.083,	0.059,	0.000,	0.003,	0.144,	0.020,	0.008,	0.002	),
		new Array(0.150,	0.096,	1.000,	0.093,	0.075,	0.187,	0.056,	0.158,	0.200,	0.310,	0.273,	0.158	),
		new Array(0.029,	0.000,	0.014,	1.000,	0.000,	0.006,	0.000,	0.018,	0.025,	0.000,	0.008,	0.009	),
		new Array(0.022,	0.235,	0.038,	0.000,	1.000,	0.003,	0.050,	0.108,	0.001,	0.074,	0.060,	0.169	),
		new Array(0.109,	0.049,	0.098,	0.005,	0.005,	1.000,	0.000,	0.043,	0.074,	0.061,	0.139,	0.006	),
		new Array(0.000,	0.000,	0.049,	0.000,	0.006,	0.000,	1.000,	0.000,	0.000,	0.074,	0.000,	0.040	),
		new Array(0.262,	0.009,	0.168,	0.143,	0.193,	0.148,	0.000,	1.000,	0.046,	0.152,	0.179,	0.118	),
		new Array(0.012,	0.140,	0.053,	0.091,	0.002,	0.084,	0.000,	0.016,	1.000,	0.009,	0.039,	0.046	),
		new Array(0.110,	0.193,	0.235,	0.000,	0.154,	0.091,	0.093,	0.177,	0.013,	1.000,	0.113,	0.033	),
		new Array(0.052,	0.027,	0.196,	0.020,	0.177,	0.183,	0.000,	0.112,	0.066,	0.099,	1.000,	0.013	),
		new Array(0.004,	0.001,	0.044,	0.004,	0.136,	0.001,	0.051,	0.023,	0.030,	0.038,	0.006,	1.000	)
	);
	this.followMatrices[this.MM] = new Array(
		new Array(0.242,	0.000,	0.143,	0.237,	0.167,	0.395,	0.000,	0.230,	0.000,	0.191,	0.163,	0.000	),
		new Array(0.000,	0.000,	0.000,	0.011,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.010,	0.000	),
		new Array(0.044,	0.000,	0.036,	0.075,	0.167,	0.005,	0.000,	0.036,	0.000,	0.000,	0.031,	0.000	),
		new Array(0.035,	0.500,	0.464,	0.151,	0.167,	0.079,	0.000,	0.144,	0.000,	0.035,	0.173,	0.000	),
		new Array(0.004,	0.000,	0.036,	0.011,	0.000,	0.005,	0.000,	0.000,	0.000,	0.009,	0.010,	0.000	),
		new Array(0.282,	0.000,	0.036,	0.086,	0.333,	0.274,	0.000,	0.223,	0.000,	0.235,	0.051,	0.000	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.123,	0.000,	0.179,	0.204,	0.000,	0.100,	0.000,	0.122,	0.000,	0.209,	0.276,	0.000	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	),
		new Array(0.154,	0.000,	0.000,	0.011,	0.167,	0.137,	0.000,	0.101,	0.000,	0.174,	0.184,	0.000	),
		new Array(0.123,	0.500,	0.107,	0.151,	0.167,	0.063,	0.000,	0.129,	0.000,	0.096,	0.102,	0.000	),
		new Array(0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.000	)
	);
	this.prevalenceArrays[this.MM] = new Array(0.252, 0.032, 0.062, 0.075, 0.025, 0.084, 0.054, 0.182, 0.093, 0.040, 0.071, 0.030);

	this.joinMatrices[this.HL] = new Array(
		new Array(1.000,	0.000,	0.000,	0.000,	0.119,	0.222,	0.333,	0.222,	0.111,	0.000,	0.037,	0.000	),
		new Array(0.000,	1.000,	0.045,	0.042,	0.067,	0.279,	0.006,	0.000,	0.111,	0.128,	0.104,	0.021	),
		new Array(0.000,	0.023,	1.000,	0.021,	0.042,	0.023,	0.058,	0.000,	0.238,	0.000,	0.018,	0.010	),
		new Array(0.000,	0.031,	0.030,	1.000,	0.042,	0.000,	0.058,	0.026,	0.063,	0.333,	0.073,	0.052	),
		new Array(0.128,	0.083,	0.015,	0.010,	1.000,	0.000,	0.000,	0.184,	0.016,	0.000,	0.333,	0.333	),
		new Array(0.148,	0.465,	0.030,	0.000,	0.000,	1.000,	0.019,	0.000,	0.016,	0.051,	0.098,	0.333	),
		new Array(0.077,	0.008,	0.136,	0.094,	0.000,	0.034,	1.000,	0.051,	0.111,	0.077,	0.170,	0.031	),
		new Array(0.148,	0.000,	0.000,	0.010,	0.275,	0.000,	0.013,	1.000,	0.000,	0.000,	0.049,	0.031	),
		new Array(0.128,	0.167,	0.348,	0.042,	0.042,	0.011,	0.222,	0.000,	1.000,	0.026,	0.074,	0.135	),
		new Array(0.000,	0.039,	0.000,	0.333,	0.000,	0.023,	0.019,	0.000,	0.016,	1.000,	0.012,	0.000	),
		new Array(0.037,	0.169,	0.045,	0.396,	0.214,	0.157,	0.252,	0.107,	0.111,	0.051,	1.000,	0.052	),
		new Array(0.000,	0.016,	0.015,	0.052,	0.200,	0.250,	0.019,	0.077,	0.206,	0.000,	0.030,	1.000	)
	);
	this.followMatrices[this.HL] = new Array(
		new Array(0.729,	0.038,	0.056,	0.231,	0.000,	0.136,	0.020,	0.035,	0.080,	0.059,	0.111,	0.207	),
		new Array(0.007,	0.000,	0.250,	0.000,	0.135,	0.034,	0.061,	0.000,	0.000,	0.059,	0.000,	0.138	),
		new Array(0.007,	0.154,	0.222,	0.077,	0.108,	0.102,	0.020,	0.035,	0.000,	0.118,	0.037,	0.069	),
		new Array(0.043,	0.000,	0.056,	0.077,	0.054,	0.102,	0.000,	0.105,	0.000,	0.000,	0.037,	0.000	),
		new Array(0.000,	0.077,	0.194,	0.077,	0.378,	0.102,	0.000,	0.035,	0.000,	0.059,	0.000,	0.069	),
		new Array(0.007,	0.077,	0.056,	0.077,	0.216,	0.119,	0.082,	0.070,	0.400,	0.059,	0.074,	0.103	),
		new Array(0.014,	0.115,	0.028,	0.000,	0.000,	0.068,	0.571,	0.035,	0.040,	0.059,	0.074,	0.034	),
		new Array(0.057,	0.000,	0.056,	0.231,	0.054,	0.034,	0.041,	0.105,	0.140,	0.059,	0.370,	0.000	),
		new Array(0.043,	0.000,	0.000,	0.000,	0.000,	0.034,	0.061,	0.474,	0.000,	0.059,	0.111,	0.138	),
		new Array(0.043,	0.077,	0.056,	0.000,	0.108,	0.034,	0.041,	0.035,	0.040,	0.294,	0.000,	0.069	),
		new Array(0.043,	0.000,	0.056,	0.077,	0.000,	0.169,	0.082,	0.140,	0.120,	0.000,	0.259,	0.069	),
		new Array(0.064,	0.154,	0.056,	0.000,	0.054,	0.051,	0.020,	0.000,	0.080,	0.059,	0.037,	0.000	)
	);
	this.prevalenceArrays[this.HL] = new Array(0.154, 0.101, 0.077, 0.070, 0.125, 0.125, 0.045, 0.045, 0.084, 0.035, 0.062, 0.076);

	this.joinMatrices[this.HM] = new Array(
		new Array(1.000,	0.029,	0.009,	0.153,	0.065,	0.015,	0.247,	0.046,	0.208,	0.046,	0.107,	0.045	),
		new Array(0.041,	1.000,	0.000,	0.107,	0.269,	0.524,	0.187,	0.395,	0.225,	0.248,	0.038,	0.134	),
		new Array(0.004,	0.000,	1.000,	0.002,	0.016,	0.003,	0.031,	0.000,	0.246,	0.028,	0.046,	0.071	),
		new Array(0.171,	0.059,	0.009,	1.000,	0.016,	0.039,	0.148,	0.190,	0.136,	0.203,	0.203,	0.069	),
		new Array(0.077,	0.146,	0.018,	0.005,	1.000,	0.015,	0.049,	0.083,	0.046,	0.085,	0.143,	0.049	),
		new Array(0.022,	0.012,	0.009,	0.029,	0.040,	1.000,	0.022,	0.000,	0.014,	0.029,	0.040,	0.190	),
		new Array(0.278,	0.119,	0.336,	0.233,	0.123,	0.015,	1.000,	0.016,	0.086,	0.228,	0.016,	0.195	),
		new Array(0.080,	0.329,	0.000,	0.026,	0.079,	0.000,	0.021,	1.000,	0.000,	0.065,	0.315,	0.121	),
		new Array(0.206,	0.130,	0.246,	0.179,	0.090,	0.146,	0.075,	0.000,	1.000,	0.006,	0.037,	0.012	),
		new Array(0.071,	0.136,	0.089,	0.203,	0.098,	0.039,	0.159,	0.056,	0.010,	1.000,	0.016,	0.099	),
		new Array(0.023,	0.022,	0.184,	0.024,	0.143,	0.015,	0.009,	0.204,	0.019,	0.005,	1.000,	0.015	),
		new Array(0.027,	0.018,	0.101,	0.040,	0.062,	0.190,	0.052,	0.011,	0.010,	0.055,	0.040,	1.000	)
	);
	this.followMatrices[this.HM] = new Array(
		new Array(0.537,	0.045,	0.095,	0.030,	0.250,	0.000,	0.013,	0.054,	0.000,	0.077,	0.133,	0.333	),
		new Array(0.049,	0.136,	0.048,	0.030,	0.000,	0.167,	0.067,	0.031,	0.250,	0.077,	0.100,	0.000	),
		new Array(0.049,	0.045,	0.571,	0.000,	0.000,	0.000,	0.027,	0.015,	0.000,	0.077,	0.033,	0.000	),
		new Array(0.024,	0.136,	0.000,	0.697,	0.000,	0.000,	0.013,	0.031,	0.000,	0.000,	0.033,	0.000	),
		new Array(0.024,	0.000,	0.000,	0.000,	0.000,	0.167,	0.000,	0.008,	0.000,	0.077,	0.000,	0.000	),
		new Array(0.000,	0.045,	0.000,	0.000,	0.250,	0.000,	0.027,	0.008,	0.000,	0.000,	0.033,	0.000	),
		new Array(0.098,	0.227,	0.095,	0.030,	0.000,	0.333,	0.000,	0.438,	0.000,	0.154,	0.033,	0.333	),
		new Array(0.195,	0.455,	0.238,	0.121,	0.250,	0.167,	0.693,	0.300,	0.250,	0.077,	0.267,	0.000	),
		new Array(0.000,	0.045,	0.000,	0.000,	0.000,	0.000,	0.000,	0.008,	0.000,	0.154,	0.000,	0.000	),
		new Array(0.024,	0.045,	0.048,	0.000,	0.250,	0.000,	0.027,	0.015,	0.500,	0.000,	0.100,	0.000	),
		new Array(0.024,	0.227,	0.048,	0.030,	0.000,	0.167,	0.013,	0.092,	0.000,	0.231,	0.133,	0.333	),
		new Array(0.024,	0.000,	0.000,	0.000,	0.000,	0.000,	0.013,	0.000,	0.000,	0.000,	0.033,	0.000	)
	);
	this.prevalenceArrays[this.HM] = new Array(0.168, 0.066, 0.083, 0.074, 0.036, 0.047, 0.142, 0.211, 0.019, 0.047, 0.069, 0.038);
	
	this.joinMatrices[this.HH] = new Array(
		new Array(1.000,	0.061,	0.070,	0.129,	0.016,	0.099,	0.073,	0.137,	0.135,	0.168,	0.089,	0.062	),
		new Array(0.016,	1.000,	0.017,	0.025,	0.049,	0.042,	0.053,	0.053,	0.027,	0.062,	0.043,	0.015	),
		new Array(0.027,	0.012,	1.000,	0.151,	0.018,	0.193,	0.031,	0.164,	0.045,	0.054,	0.146,	0.129	),
		new Array(0.164,	0.085,	0.099,	1.000,	0.066,	0.080,	0.189,	0.143,	0.110,	0.078,	0.197,	0.151	),
		new Array(0.024,	0.039,	0.025,	0.014,	1.000,	0.015,	0.018,	0.028,	0.040,	0.018,	0.025,	0.082	),
		new Array(0.080,	0.052,	0.114,	0.025,	0.012,	1.000,	0.042,	0.038,	0.137,	0.037,	0.039,	0.079	),
		new Array(0.098,	0.149,	0.061,	0.179,	0.031,	0.074,	1.000,	0.071,	0.051,	0.150,	0.153,	0.102	),
		new Array(0.129,	0.060,	0.121,	0.161,	0.050,	0.065,	0.041,	1.000,	0.027,	0.027,	0.077,	0.091	),
		new Array(0.064,	0.041,	0.064,	0.064,	0.073,	0.103,	0.037,	0.024,	1.000,	0.085,	0.039,	0.057	),
		new Array(0.148,	0.119,	0.053,	0.045,	0.018,	0.043,	0.089,	0.033,	0.055,	1.000,	0.026,	0.042	),
		new Array(0.104,	0.104,	0.080,	0.138,	0.119,	0.068,	0.112,	0.120,	0.069,	0.053,	1.000,	0.064	),
		new Array(0.021,	0.027,	0.172,	0.069,	0.171,	0.094,	0.065,	0.065,	0.054,	0.019,	0.041,	1.000	)
	);
	this.followMatrices[this.HH] = new Array(
		new Array(0.351,	0.145,	0.000,	0.190,	0.047,	0.182,	0.152,	0.085,	0.000,	0.179,	0.255,	0.000	),
		new Array(0.091,	0.218,	0.161,	0.000,	0.068,	0.091,	0.030,	0.068,	0.083,	0.077,	0.149,	0.148	),
		new Array(0.000,	0.036,	0.194,	0.143,	0.034,	0.091,	0.061,	0.034,	0.250,	0.077,	0.000,	0.148	),
		new Array(0.052,	0.000,	0.032,	0.238,	0.020,	0.000,	0.030,	0.000,	0.083,	0.051,	0.085,	0.000	),
		new Array(0.065,	0.127,	0.290,	0.190,	0.358,	0.182,	0.394,	0.407,	0.083,	0.154,	0.277,	0.407	),
		new Array(0.052,	0.018,	0.032,	0.000,	0.020,	0.000,	0.030,	0.000,	0.000,	0.000,	0.000,	0.037	),
		new Array(0.013,	0.073,	0.065,	0.048,	0.027,	0.273,	0.000,	0.153,	0.083,	0.051,	0.064,	0.111	),
		new Array(0.013,	0.018,	0.097,	0.000,	0.162,	0.000,	0.121,	0.186,	0.167,	0.051,	0.149,	0.148	),
		new Array(0.000,	0.018,	0.097,	0.048,	0.007,	0.000,	0.030,	0.017,	0.083,	0.026,	0.021,	0.037	),
		new Array(0.078,	0.055,	0.129,	0.190,	0.047,	0.000,	0.061,	0.102,	0.083,	0.026,	0.064,	0.074	),
		new Array(0.078,	0.109,	0.000,	0.190,	0.068,	0.000,	0.091,	0.102,	0.083,	0.103,	0.128,	0.037	),
		new Array(0.000,	0.073,	0.129,	0.000,	0.020,	0.273,	0.030,	0.068,	0.083,	0.051,	0.021,	0.148	)
	);
	this.prevalenceArrays[this.HH] = new Array(0.228, 0.048, 0.053, 0.127, 0.057, 0.074, 0.064, 0.155, 0.065, 0.058, 0.043, 0.028);

	var lerp = function(min, max, val)
	{
		return (val - min) / (max - min);
	}
	var ilerp = function(min, max, val)
	{
		return 1 - (val - min) / (max - min);
	}
	
	this.createJMap = function(stress, energy)
	{
		// INSERT MATRIX CODE HERE	
		var map = new Array();
		
		if (stress < 0.5)
		{
			for (i = 0; i < 12; i++)
			{
				map[i] = new Array();
				if (energy < 0.5)
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.joinMatrices[aud.LL][i][j] + 
							ilerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.joinMatrices[aud.LM][i][j] + 
							lerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.joinMatrices[aud.ML][i][j] + 
							lerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.joinMatrices[aud.MM][i][j];
					}
				}
				else // energy > 0.5
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.joinMatrices[aud.LM][i][j] + 
							ilerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.joinMatrices[aud.LH][i][j] + 
							lerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.joinMatrices[aud.MM][i][j] + 
							lerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.joinMatrices[aud.MH][i][j];
					}
				}
			}
		}
		else // stress > 0.5
		{
			for (i = 0; i < 12; i++)
			{
				map[i] = new Array();
				if (energy < 0.5)
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.joinMatrices[aud.ML][i][j] + 
							ilerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.joinMatrices[aud.MM][i][j] + 
							lerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.joinMatrices[aud.HL][i][j] + 
							lerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.joinMatrices[aud.HM][i][j];
					}
				}
				else // energy > 0.5
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.joinMatrices[aud.MM][i][j] + 
							ilerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.joinMatrices[aud.MH][i][j] + 
							lerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.joinMatrices[aud.HM][i][j] + 
							lerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.joinMatrices[aud.HH][i][j];
					}
				}
			}
		}

		return map;
	}
	this.createFMap = function(stress, energy)
	{
		// INSERT MATRIX CODE HERE	
		var map = new Array();
		
		if (stress < 0.5)
		{
			for (i = 0; i < 12; i++)
			{
				map[i] = new Array();
				if (energy < 0.5)
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.followMatrices[aud.LL][i][j] + 
							ilerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.followMatrices[aud.LM][i][j] + 
							lerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.followMatrices[aud.ML][i][j] + 
							lerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.followMatrices[aud.MM][i][j];
					}
				}
				else // energy > 0.5
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.followMatrices[aud.LM][i][j] + 
							ilerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.followMatrices[aud.LH][i][j] + 
							lerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.followMatrices[aud.MM][i][j] + 
							lerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.followMatrices[aud.MH][i][j];
					}
				}
			}
		}
		else // stress > 0.5
		{
			for (i = 0; i < 12; i++)
			{
				map[i] = new Array();
				if (energy < 0.5)
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.followMatrices[aud.ML][i][j] + 
							ilerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.followMatrices[aud.MM][i][j] + 
							lerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.followMatrices[aud.HL][i][j] + 
							lerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.followMatrices[aud.HM][i][j];
					}
				}
				else // energy > 0.5
				{
					for (j = 0; j < 12; j++)
					{
						map[i][j] = ilerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.followMatrices[aud.MM][i][j] + 
							ilerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.followMatrices[aud.MH][i][j] + 
							lerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.followMatrices[aud.HM][i][j] + 
							lerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.followMatrices[aud.HH][i][j];
					}
				}
			}
		}

		return map;
	}
	this.createPMap = function(stress, energy)
	{
		// INSERT MATRIX CODE HERE	
		var map = new Array();
		
		if (stress < 0.5)
			if (energy < 0.5)
			{
				for (var i = 0; i < 12; i++)
				{
					map[i] = ilerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.prevalenceArrays[aud.LL][i] + 
							ilerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.prevalenceArrays[aud.LM][i] + 
							lerp(0, 0.5, stress) * ilerp(0, 0.5, energy) * aud.prevalenceArrays[aud.ML][i] + 
							lerp(0, 0.5, stress) * lerp(0, 0.5, energy) * aud.prevalenceArrays[aud.MM][i];
				}
			}
			else
			{
				for (var i = 0; i < 12; i++)
				{
					map[i] = ilerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.prevalenceArrays[aud.LM][i] + 
							ilerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.prevalenceArrays[aud.LH][i] + 
							lerp(0, 0.5, stress) * ilerp(0.5, 1, energy) * aud.prevalenceArrays[aud.MM][i] + 
							lerp(0, 0.5, stress) * lerp(0.5, 1, energy) * aud.prevalenceArrays[aud.MH][i];
				}
			
			}
		else
		{
			if (energy < 0.5)
			{
				for (var i = 0; i < 12; i++)
				{
					map[i] = ilerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.prevalenceArrays[aud.ML][i] + 
							ilerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.prevalenceArrays[aud.MM][i] + 
							lerp(0.5, 1, stress) * ilerp(0, 0.5, energy) * aud.prevalenceArrays[aud.HL][i] + 
							lerp(0.5, 1, stress) * lerp(0, 0.5, energy) * aud.prevalenceArrays[aud.HM][i];
				}
			}
			else
			{
				for (var i = 0; i < 12; i++)
				{
					map[i] = ilerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.prevalenceArrays[aud.MM][i] + 
							ilerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.prevalenceArrays[aud.MH][i] + 
							lerp(0.5, 1, stress) * ilerp(0.5, 1, energy) * aud.prevalenceArrays[aud.HM][i] + 
							lerp(0.5, 1, stress) * lerp(0.5, 1, energy) * aud.prevalenceArrays[aud.HH][i];
				}
			}
		}
		return map;
	}
		
	this.populate_perc = function (stress, energy, pat, patlen, transitions)
	{	
		// two percussive instruments
		// snare - kick
		self.pattern.push(new aud_track(new aud_instrument(1, 35 - Math.floor(25 * energy), 15 - Math.floor(10 * energy), aud_waves.Noise)));
		// hat
		self.pattern.push(new aud_track(new aud_instrument(50 - Math.floor(35 * energy), 50 - Math.floor(30 * energy), 300 - Math.floor(200 * energy), aud_waves.Noise)));
		self.pattern[0].instrument.volume = 0.8 + 0.2 * energy - 0.1 * (1 - stress);
		self.pattern[1].instrument.volume = 0.7 + 0.2 * energy - 0.3 * (1 - stress);
	
		for (var p = 0; p < pat; p++)
		{		
			for (var pl = 0; pl < patlen; pl++)
			{
				var pat_pos = p * patlen * 32 + pl * 32;
				if (pl == 0)
				{
					for (var i = 0; i < 32; i++)
					{
						var tenergy = energy;
						if (patlen == 1 && i > 32 - 8)
						{
							if (transitions[p] == "low")
								tenergy = energy * energy * energy;
							else 
								tenergy = Math.sqrt(Math.sqrt(energy));
						}
					
						self.pattern[0].pattern[pat_pos + i] = -1;
						self.pattern[1].pattern[pat_pos + i] = -1;
					
						var r1 = self.random.next();
						var r2 = self.random.next();
						
						if (i % 8 == 0) 
						{
							if (r1 > 0.02)
								self.pattern[0].pattern[pat_pos + i] = 0;
							if (r2 - tenergy / 4 > 0.6)
								self.pattern[1].pattern[pat_pos + i] = 0;
						}
						else if (i % 4 == 0)
						{
							if (r1 > 0.1 && tenergy + r1 > 0.6)
								self.pattern[0].pattern[pat_pos + i] = 0;
							if (r2 - tenergy / 4 > 0.5)
								self.pattern[1].pattern[pat_pos + i] = 0;
						}
						else if (i % 2 == 0)
						{
							if (tenergy + r1 > 0.9)
								self.pattern[0].pattern[pat_pos + i] = 0;
						}
						else
						{
							if (r1 > 0.75 && tenergy > 0.75)
								self.pattern[0].pattern[pat_pos + i] = 0;
						}
					}
				}
				else // copy
				{
					if (pl < patlen - 1)
					{
						for (var i = 0; i < 32; i++)
						{
							self.pattern[0].pattern[pat_pos + i] = self.pattern[0].pattern[pat_pos + i - 32];
							self.pattern[1].pattern[pat_pos + i] = self.pattern[1].pattern[pat_pos + i - 32];
						}
					}
					else
					{
						for (var i = 0; i < 32 - 8; i++)
						{
							self.pattern[0].pattern[pat_pos + i] = self.pattern[0].pattern[pat_pos + i - 32];
							self.pattern[1].pattern[pat_pos + i] = self.pattern[1].pattern[pat_pos + i - 32];
						}
						var tenergy = energy;
						if (transitions[p] == "low")
							tenergy = energy * energy * energy;
						else 
							tenergy = Math.sqrt(Math.sqrt(energy));
						// design transition
						for (var i = 32 - 8; i < 32; i++)
						{
							self.pattern[0].pattern[pat_pos + i] = -1;
							self.pattern[1].pattern[pat_pos + i] = -1;
							var r1 = self.random.next();
							var r2 = self.random.next();
						
							if (i % 8 == 0) 
							{
								if (r1 > 0.02)
									self.pattern[0].pattern[pat_pos + i] = 0;
								if (r2 > 0.5)
									self.pattern[1].pattern[pat_pos + i] = 0;
							}
							else if (i % 4 == 0)
							{
								if (r1 > 0.1 && tenergy + r1 > 0.6)
									self.pattern[0].pattern[pat_pos + i] = 0;
								if (r2 > 0.6 && tenergy > 0.5)
									self.pattern[1].pattern[pat_pos + i] = 0;
							}
							else if (i % 2 == 0)
							{
								if (tenergy + r1 > 0.9)
									self.pattern[0].pattern[pat_pos + i] = 0;
							}
							else
							{
								if (tenergy + r1 > 1)
									self.pattern[0].pattern[pat_pos + i] = 0;
							}
						}
					}
				}
			}
		}
	}
	
	this.canUse = function(map, note, refnote, cutoff)
	{
		if (map[note][refnote] > cutoff)
			return true;
		return false;
	}
	
	this.getJoiningNotes = function(pat_pos, instr_no)
	{
		var ret = new Array();
		
		//console.log("JOIN: " + pat_pos + " " + instr_no + " aud.pattern.length = " + aud.pattern.length);
		
		for (var i = 2; i < aud.pattern.length; i++)
		{
			if (i == instr_no)
				continue;
			if ((i - 2) % 4 == 0)
			{
				//console.log(pat_pos - pat_pos % 8 + " " + aud.pattern[i].pattern[pat_pos - pat_pos % 8] + " EIGHT"); 
				if (aud.pattern[i].pattern[pat_pos - pat_pos % 8] != -1)
				{
					ret.push(aud.pattern[i].pattern[pat_pos - pat_pos % 8]);
				}
			}
			else if ((i - 2) % 4 == 1)
			{
				//console.log(pat_pos - pat_pos % 4 + " " + aud.pattern[i].pattern[pat_pos - pat_pos % 4] + " FOUR");
				if (aud.pattern[i].pattern[pat_pos - pat_pos % 4] != -1)
				{
					ret.push(aud.pattern[i].pattern[pat_pos - pat_pos % 4]);
				}
			}
			else if ((i - 2) % 4 == 2)
			{
				//console.log(pat_pos - pat_pos % 2 + " " + aud.pattern[i].pattern[pat_pos - pat_pos % 2] + " TWO");
				if (aud.pattern[i].pattern[pat_pos - pat_pos % 2] != -1)
				{
					ret.push(aud.pattern[i].pattern[pat_pos - pat_pos % 2]);
				}
			}
			else if ((i - 2) % 4 == 3)
			{
				if (aud.pattern[i].pattern[pat_pos] != -1)
				{
					ret.push(aud.pattern[i].pattern[pat_pos]);
				}
			}
		}
		
		return ret;
	}
	
	this.getFollowingNotes = function(pat_pos, instr_no)
	{
		var ret = new Array();
		
		if (instr_no >= 2 && instr_no < 6)
		{		
			for (var i = 0; i < 4; i++)
			{
				var ins = i + 2;
				
				if (i == 0 && aud.pattern[ins].pattern[pat_pos - pat_pos % 8] != -1)
				{
					ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 8]);
				}
				if (i == 1 && aud.pattern[ins].pattern[pat_pos - pat_pos % 4] != -1)
				{
					ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 4]);
				}
				if (i == 2 && aud.pattern[ins].pattern[pat_pos - pat_pos % 2] != -1)
				{
					ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 2]);
				}
				if (i == 3 && aud.pattern[ins].pattern[pat_pos] != -1)
				{
					ret.push(aud.pattern[ins].pattern[pat_pos]);
				}
			}
		}
		if (instr_no >= 6 && instr_no < 10)
		{
			for (var i = 0; i < 4; i++)
			{
				var ins = i + 6;
				
				if (ins == instr_no)
					continue;
				else
				{
					if (i == 0 && aud.pattern[ins].pattern[pat_pos - pat_pos % 8] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 8]);
					}
					if (i == 1 && aud.pattern[ins].pattern[pat_pos - pat_pos % 4] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 4]);
					}
					if (i == 2 && aud.pattern[ins].pattern[pat_pos - pat_pos % 2] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 2]);
					}
					if (i == 3 && aud.pattern[ins].pattern[pat_pos] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos]);
					}
				}
			}		
		}
		if (instr_no >= 10 && instr_no < 14)
		{
			for (var i = 0; i < 4; i++)
			{
				var ins = i + 10;
				
				if (ins == instr_no)
					continue;
				else
				{
					if (i == 0 && aud.pattern[ins].pattern[pat_pos - pat_pos % 8] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 8]);
					}
					if (i == 1 && aud.pattern[ins].pattern[pat_pos - pat_pos % 4] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 4]);
					}
					if (i == 2 && aud.pattern[ins].pattern[pat_pos - pat_pos % 2] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 2]);
					}
					if (i == 3 && aud.pattern[ins].pattern[pat_pos] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos]);
					}
				}
			}		
		}
		if (instr_no >= 14 && instr_no < 18)
		{
			for (var i = 0; i < 4; i++)
			{
				var ins = i + 14;
				
				if (ins == instr_no)
					continue;
				else
				{
					if (i == 0 && aud.pattern[ins].pattern[pat_pos - pat_pos % 8] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 8]);
					}
					if (i == 1 && aud.pattern[ins].pattern[pat_pos - pat_pos % 4] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 4]);
					}
					if (i == 2 && aud.pattern[ins].pattern[pat_pos - pat_pos % 2] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos - pat_pos % 2]);
					}
					if (i == 3 && aud.pattern[ins].pattern[pat_pos] != -1)
					{
						ret.push(aud.pattern[ins].pattern[pat_pos]);
					}
				}
			}		
		}
		
		return ret;
	}
	
	this.usableNotes = function(notesToFollow, Fmap, notesToJoin, Jmap, base_note, cutoff, expand)
	{
		var avail = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
		/*
		for (var i = 0; i < notesToFollow.length; i++)
		{
			notesToFollow[i] %= 12;
			
			for (var j = 0; j < avail.length; j++)
			{
				if (!self.canUse(Fmap, avail[j], notesToFollow[i], cutoff))
				{
					avail.splice(j, 1);
					j--;
				}
			}
		}*/
		//console.log(avail);
		//console.log(Jmap);
		for (var i = 0; i < notesToJoin.length; i++)
		{
			notesToJoin[i] -= (base_note % 12);
			notesToJoin[i] %= 12;
			
			for (var j = 0; j < avail.length; j++)
			{
				if (!self.canUse(Jmap, avail[j], notesToJoin[i], cutoff))
				{
					avail.splice(j, 1);
					j--;
				}
			}			
		}
		if (avail.indexOf(0) != -1)
			avail.push(12);
		if (expand)
		{
			if (avail.indexOf(1) != -1)
				avail.push(13);
			if (avail.indexOf(2) != -1)
				avail.push(14);
			if (avail.indexOf(3) != -1)
				avail.push(15);
			if (avail.indexOf(4) != -1)
				avail.push(16);
			if (avail.indexOf(5) != -1)
				avail.push(17);
			if (avail.indexOf(6) != -1)
				avail.push(18);
			if (avail.indexOf(7) != -1)
				avail.push(19);
		}
		for (var i = 0; i < avail.length; i++)
		{
			avail[i] += base_note;
		}
		//console.log(avail);
		if (avail.length == 0 && notesToJoin.length != 0)
			for (var i = 0; i < notesToJoin.length; i++)
			{
				avail.push(notesToJoin[i] + base_note);
			}
		//console.log(avail);
		return avail;
	}
	
	this.pickNoteFromUsable = function(Pmap, n, rand, base_note, cutoff)
	{
		if (n.length == 0) return -1;
		
		var nt = -1, nt_r = rand;
		var prev = new Array(), pntot = 0;
		for (var pnt = 0; pnt < n.length; pnt++)
		{
			prev.push(Pmap[(n[pnt] - base_note) % 12]);
			pntot += Pmap[(n[pnt] - base_note) % 12];
		}
		if (pntot > 0)
		{
			for (var pnt = 0; pnt < prev.length; pnt++)
			{
				prev[pnt] /= pntot; 
			}
		}		
		
		do
		{
			nt++;
			nt_r -= prev[nt];
		} while(nt_r > 0 || prev[nt] < cutoff);
		
		if (nt >= n.length) return -1;
		
		return n[nt];
	}
	
	this.populate_melody = function (stress, energy, pat, patlen, transitions, Jmap, Fmap, Pmap, base_note, n_instr, instr_arr, n_tracks, fwd_arr)
	{	
		var a = self.pattern.length;
		var b = self.pattern.length + 1;
		var c = self.pattern.length + 2;
		var d = self.pattern.length + 3;		
		
		var wf = Math.floor(self.random.next() * 3);
		/*var twf1 = Math.floor(self.random.next() * 2); 
		var twf2 = Math.floor(self.random.next() * 3); 
		var twf3 = Math.floor(self.random.next() * 2); 
		var wf;
		if (n_instr == 0)
		{
			if (twf1 == 0) wf = aud_waves.Square;
			else wf = aud_waves.Saw;
		}
		else if (n_instr == 1)
		{
			if (twf2 == 0) wf = aud_waves.Square;
			else if (twf2 == 2) wf = aud_waves.Saw;
			else wf = aud_waves.Tri;
		}
		else
		{
			if (n_instr == 3) wf = aud_waves.Saw;
			else wf = aud_waves.Tri;
		}*/	
		
		// three melodic instruments
		var v = 0.7 + 0.2 * energy;
		if (wf == aud_waves.Square)
			v -= 0.5;
		if (wf == aud_waves.Saw)
			v -= 0.3;
		if (wf == aud_waves.Tri)
			v += 0.4;
		self.pattern.push(new aud_track(new aud_instrument(50 - Math.floor(48 * energy), 150 + Math.floor(238 * energy), 200 - Math.floor(195 * energy), wf)));
		self.pattern.push(new aud_track(new aud_instrument(50 - Math.floor(48 * energy), 50 + Math.floor(143 * energy), 100 - Math.floor(95 * energy), wf)));
		self.pattern.push(new aud_track(new aud_instrument(20 - Math.floor(18 * energy), 60 + Math.floor(33 * energy), 20 - Math.floor(15 * energy), wf)));
		self.pattern.push(new aud_track(new aud_instrument(10 - Math.floor(8 * energy), 10 + Math.floor(33 * energy), 30 - Math.floor(25 * energy), wf)));
		self.pattern[a].instrument.volume = v;
		self.pattern[b].instrument.volume = v;
		self.pattern[c].instrument.volume = v;
		self.pattern[d].instrument.volume = v;
		for (var p = 0; p < pat; p++)
		{		
			var sp_r = self.random.next();
		
			var shouldplay = instr_arr[p][n_instr];
			var shouldclear = true;
			if (fwd_arr[p][n_instr] != -1)
			{
				var ndxpos = fwd_arr[p][n_instr] * patlen * 32;
				var pos = p * patlen * 32;
				console.log(p + ", " + n_instr + ": " + pos + " " + ndxpos);
				for ( ; pos < (p + 1) * 32 * patlen; pos++, ndxpos++)
				{
					self.pattern[a].pattern[pos] = self.pattern[a].pattern[ndxpos];
					self.pattern[b].pattern[pos] = self.pattern[b].pattern[ndxpos];
					self.pattern[c].pattern[pos] = self.pattern[c].pattern[ndxpos];
					self.pattern[d].pattern[pos] = self.pattern[d].pattern[ndxpos];	
				}
				
				shouldplay = false;
				shouldclear = false;
			}
				
				var renergy = energy + (self.random.next() - 0.5) * 1.0;
			for (var pl = 0; pl < patlen; pl++)
			{
				var pat_pos = p * patlen * 32 + pl * 32;
				
				if (pl == 0)
				{				
					for (var i = 0; i < 32; i++)
					{
						var tenergy = energy;
						var trenergy = renergy;
						
						if (patlen == 1 && i > 32 - 8)
						{
							if (transitions[p] == "low")
							{
								tenergy = energy * energy * energy - 0.2;
								trenergy = renergy * renergy * renergy - 0.2;
							}
							else
							{
								tenergy = Math.sqrt(Math.sqrt(energy)) + 0.2;
								trenergy = Math.sqrt(Math.sqrt(renergy)) + 0.2;
							}
						}
						
						if (n_instr == 0)
						{
							tenergy /= 1.5;
							trenergy /= 1.5;
						}
						
						if (shouldclear)
						{
							self.pattern[a].pattern[pat_pos + i] = -1;
							self.pattern[b].pattern[pat_pos + i] = -1;
							self.pattern[c].pattern[pat_pos + i] = -1;
							self.pattern[d].pattern[pat_pos + i] = -1;
						}
						
						var r1 = self.random.next();
						var r2 = self.random.next();
						var r3 = self.random.next();
						var r4 = self.random.next();
						var r5 = self.random.next();
						var r6 = self.random.next();
						var r7 = self.random.next();
						var r8 = self.random.next();
						
						if (!shouldplay)
							continue;
						
						if (i % 8 == 0 && (trenergy < 0.3 || (n_tracks >= 3 && trenergy < 0.5)))
						{
							if (r1 + tenergy > 0.05)
							{
								var ntf = aud.getFollowingNotes(pat_pos + i - 1, a);
								if (i == 0 && p == 0)
									ntf = new Array();
								var ntj = aud.getJoiningNotes(pat_pos + i, a);
								
								var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.15, false);
								
								self.pattern[a].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r5, base_note, 0.08);
							}
						}
						if (i % 4 == 0 && (n_tracks >= 3 || (trenergy > 0.3 && trenergy < 0.7) || (trenergy < 0.5)))
						{
							if (r2 + tenergy > 0.4)
							{
								var ntf = aud.getFollowingNotes(pat_pos + i - 1, b);
								if (i == 0 && p == 0)
									ntf = new Array();
								var ntj = aud.getJoiningNotes(pat_pos + i, b);
							
								var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.10, true);
								
								self.pattern[b].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r6, base_note, 0.03);
							}
						}
						if (i % 2 == 0 && (n_tracks >= 3 || (trenergy > 0.3 && trenergy < 0.7) || (trenergy > 0.5)))
						{
							if (r3 + tenergy > 0.6)
							{
								var ntf = aud.getFollowingNotes(pat_pos + i - 1, c);
								if (i == 0 && p == 0)
									ntf = new Array();
								var ntj = aud.getJoiningNotes(pat_pos + i, c);
							
								var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.06, true);
								
								self.pattern[c].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r7, base_note, 0.02);
							}
						}
						if (i % 1 == 0 && (trenergy > 0.7 || (n_tracks >= 3 && trenergy > 0.5)))
						{
							if (r4 + tenergy > 0.9)
							{
								var ntf = aud.getFollowingNotes(pat_pos + i - 1, d);
								if (i == 0 && p == 0)
									ntf = new Array();
								var ntj = aud.getJoiningNotes(pat_pos + i, d);
							
								var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.04, true);
								
								self.pattern[d].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r8, base_note, 0.01);
							}
						}
					}
				}
				else // copy
				{
					var variance = 0;
					
					if (patlen % 2 == 0)
					{
						if (pl / patlen < 0.5) 
							variance = 0.3; // first half
						else
							variance = 0.1; // second half
					}
					else
					{
						if (pl % 2 == 1 && pl < 4)
							variance = 0.3; // B & C
						else
							variance = 0.1;
					}
					
					if (pl < patlen - 1)
					{
						if (shouldclear)
						{
							var copyfrom;
							if (patlen % 2 == 0)
							{
								if (pl / patlen < 0.5)
									copyfrom = pl;
								else
									copyfrom = Math.floor(patlen / 2);
							}
							else
							{
								if (pl < 4)
									copyfrom = pl;
								else if (patlen == 5 && pl == 4)
									copyfrom = 2;
								else if (pl == 4)
									copyfrom = 3;
								else if (pl == 5)
									copyfrom = 2;
								else if (pl == 6)
									copyfrom = 4;									
							}
						
							for (var i = 0; i < 32; i++)
							{
								var r1 = self.random.next();
								var r2 = self.random.next();
								var r3 = self.random.next();
								var r4 = self.random.next();
								var r5 = self.random.next();
								var r6 = self.random.next();
								var r7 = self.random.next();
								var r8 = self.random.next();
								
								self.pattern[a].pattern[pat_pos + i] = self.pattern[a].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[b].pattern[pat_pos + i] = self.pattern[b].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[c].pattern[pat_pos + i] = self.pattern[c].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[d].pattern[pat_pos + i] = self.pattern[d].pattern[pat_pos + i - 32 * copyfrom];
								
								if (self.pattern[a].pattern[pat_pos + i] != -1 && r1 < variance - 0.1)
								{
									var ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, a);
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.10, false);
									self.pattern[a].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r5, base_note, 0.05);
								}
								if (self.pattern[b].pattern[pat_pos + i] != -1 && r2 < variance)
								{
									var ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, b);
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.08, false);
									self.pattern[b].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r6, base_note, 0.04);
								}
								if (self.pattern[c].pattern[pat_pos + i] != -1 && r3 < variance + 0.1)
								{
									var ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, c);
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.05, false);
									self.pattern[c].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r7, base_note, 0.02);
								}
								if (self.pattern[d].pattern[pat_pos + i] != -1 && r4 < variance + 0.2)
								{
									var ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, d);
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.03, false);
									self.pattern[d].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r8, base_note, 0.02);
								}
							}
						}
					}
					else
					{
						if (shouldclear)
						{
							var copyfrom;
							if (patlen % 2 == 0)
							{
								copyfrom = Math.floor(patlen / 2);
							}
							else
							{
								if (patlen == 3)
									copyfrom = 2;
								else 
									copyfrom = pl - 2;
							} 
						
							for (var i = 0; i < 32 - 8; i++)
							{
								var r1 = self.random.next();
								var r2 = self.random.next();
								var r3 = self.random.next();
								var r4 = self.random.next();
								var r5 = self.random.next();
								var r6 = self.random.next();
								var r7 = self.random.next();
								var r8 = self.random.next();
						
								self.pattern[a].pattern[pat_pos + i] = self.pattern[a].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[b].pattern[pat_pos + i] = self.pattern[b].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[c].pattern[pat_pos + i] = self.pattern[c].pattern[pat_pos + i - 32 * copyfrom];
								self.pattern[d].pattern[pat_pos + i] = self.pattern[d].pattern[pat_pos + i - 32 * copyfrom];
							}
						}
						
						var tenergy = energy;
						var trenergy = renergy;
						if (transitions[p] == "low")
						{
							tenergy = energy * energy * energy - 0.2;
							trenergy = renergy * renergy * renergy - 0.2;
						}
						else
						{
							tenergy = Math.sqrt(Math.sqrt(energy)) + 0.2;
							trenergy = Math.sqrt(Math.sqrt(renergy)) + 0.2;
						}
						if (n_instr == 0)
						{
							tenergy /= 1.5;
							trenergy /= 1.5;
						}
						// design transition
						for (var i = 32 - 8; i < 32; i++)
						{
							if (shouldclear)
							{
								self.pattern[a].pattern[pat_pos + i] = -1;
								self.pattern[b].pattern[pat_pos + i] = -1;
								self.pattern[c].pattern[pat_pos + i] = -1;
								self.pattern[d].pattern[pat_pos + i] = -1;
							}
							var r1 = self.random.next();
							var r2 = self.random.next();
							var r3 = self.random.next();
							var r4 = self.random.next();
							var r5 = self.random.next();
							var r6 = self.random.next();
							var r7 = self.random.next();
							var r8 = self.random.next();
						
							if (!shouldplay)
								continue;
							// aqui
							if (i % 8 == 0 && (trenergy < 0.3 || (n_tracks >= 3 && trenergy < 0.5)))
							{
								if (r1 + tenergy > 0.1)
								{
									var ntf = aud.getFollowingNotes(pat_pos + i - 1, a);
									if (i == 0 && p == 0)
										ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, a);
									
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.12, false);
									
									self.pattern[a].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r5, base_note, 0.06);
								}
							}
							if (i % 4 == 0 && (n_tracks >= 3 || (trenergy > 0.3 && trenergy < 0.7) || (trenergy < 0.5)))
							{
								if (r2 + tenergy > 0.4)
								{
									var ntf = aud.getFollowingNotes(pat_pos + i - 1, b);
									if (i == 0 && p == 0)
										ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, b);
								
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.09, true);
									
									self.pattern[b].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r6, base_note, 0.03);
								}
							}
							if (i % 2 == 0 && (n_tracks >= 3 || (trenergy > 0.3 && trenergy < 0.7) || (trenergy > 0.5)))
							{
								if (r3 + tenergy > 0.6)
								{
									var ntf = aud.getFollowingNotes(pat_pos + i - 1, c);
									if (i == 0 && p == 0)
										ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, c);
								
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.05, true);
									
									self.pattern[c].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r7, base_note, 0.02);
								}
							}
							if (i % 1 == 0 && (trenergy > 0.7 || (n_tracks >= 3 && trenergy > 0.5)))
							{
								if (r4 + tenergy > 0.9)
								{
									var ntf = aud.getFollowingNotes(pat_pos + i - 1, d);
									if (i == 0 && p == 0)
										ntf = new Array();
									var ntj = aud.getJoiningNotes(pat_pos + i, d);
								
									var n = self.usableNotes(ntf, Fmap, ntj, Jmap, base_note, 0.03, true);
									
									self.pattern[d].pattern[pat_pos + i] = aud.pickNoteFromUsable(Pmap, n, r8, base_note, 0.02);
								}
							}
							// jusqu'ici
						}
					}
					
				}
				
			}
			
			// consume more random numbers to compensate for # over repeats - consume numbers equivalent to 8 repeats 
			for (var tmp = 0; tmp < (8 - patlen) * 32 * 8 ; tmp++) 
				self.random.next();
				
		}
	}
	
	
	var aud_pat = 1, aud_seed = 0, aud_patlen = 4; 
	this.getNumSamples = function()
	{
		return 10000 * 32 * self.aud_patlen * self.aud_pat;
	}
	
	var has_gen = false;
	var assure_instr = function(energy, array, no)
	{
		var num = 0;
		for (var t = 0; t < 4; t++)
		{
			if (array[no][t])
				num++;
		}
		
		if (energy < 0.3 && num < 1)
		{
			if (no % 2 == 0)
				array[no][0] = true;
			else
				array[no][1] = true;
		}
		if (energy > 0.3 && num < 2)
		{
			if (num == 0)
			{
				if (no % 2 == 0)
				{
					array[no][0] = true;
					if (no % 3 == 0)
						array[no][1] = true;
					else 
						array[no][2] = true;
				}
				else
				{
					array[no][1] = true;
					if (no % 3 == 0)
						array[no][0] = true;
					else 
						array[no][2] = true;
				}
			}
			else
			{
				if (!array[no][0])
					array[no][0] = true;
				else
					array[no][1] = true;
			}
		}	
		if (num > 3)
		{
			if (no % 2 == 0)
				array[no][2] = false;
			else
				array[no][3] = false;
		}
		if (energy < 0.5 && num > 2)
		{
			if (array[no][3])
				array[no][3] = false;
			else if (no % 2 == 0)
				array[no][2] = false;
			else 
				array[no][0] = false;
		}
		return array;
	}
	var populate_instr = function(energy, pat, array)
	{
		var howlong = new Array(0,0,0,0);
		array[0] = new Array();
		
		array[0][0] = self.random.next() < 0.5 + energy * 0.2;
		array[0][1] = self.random.next() < 0.4 + energy * 0.2;
		array[0][2] = self.random.next() < 0.3 + energy * 0.2;
		array[0][3] = self.random.next() < 0.3 + energy * 0.1;
		
		array = assure_instr(energy, array, 0);
		
		for (var i = 1; i < pat; i++)
		{
			array[i] = new Array();
			array[i][0] = self.random.next() < 0.4 + energy * 0.2 - howlong[0] * 0.2;
			if (array[i][0]) howlong[0]++; else howlong[0] = 0; 
			array[i][1] = self.random.next() < 0.4 + energy * 0.2 - howlong[1] * 0.2;
			if (array[i][1]) howlong[1]++; else howlong[1] = 0; 
			array[i][2] = self.random.next() < 0.4 + energy * 0.2 - howlong[2] * 0.2;
			if (array[i][2]) howlong[2]++; else howlong[2] = 0; 
			array[i][3] = self.random.next() < 0.4 + energy * 0.2 - howlong[3] * 0.2;	
			if (array[i][3]) howlong[3]++; else howlong[3] = 0; 
			
			array = assure_instr(energy, array, i);
		}
	}
	var populate_fwd = function(instr_arr, pat)
	{
		var aseen = false, bseen = false, cseen = false, dseen = false;
		var fwd_arr = new Array();
		
		for (var i = 0; i < pat; i++)
		{
			fwd_arr[i] = new Array();
			
			for (var j = 0; j < 4; j++)
			{
				fwd_arr[i][j] = - 1;
			}
		}
		
		for (var i = 0; i < pat - 1; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				var rand = self.random.next();
				var rarr = new Array(self.random.next(),self.random.next(),self.random.next());
				if (instr_arr[i][j] && rand < 0.7)
				{
					for (var ti = i + 1, ndx = 0; ti < pat && ndx < 3; ti++)
					{
						if (instr_arr[ti][j] && 
							(fwd_arr[ti][0] == -1 || fwd_arr[ti][0] == i) && 
							(fwd_arr[ti][1] == -1 || fwd_arr[ti][1] == i) && 
							(fwd_arr[ti][2] == -1 || fwd_arr[ti][2] == i) && 
							(fwd_arr[ti][3] == -1 || fwd_arr[ti][3] == i) && 
							(!instr_arr[ti][0] || fwd_arr[ti][0] == i || j == 0) && 
							(!instr_arr[ti][1] || fwd_arr[ti][1] == i || j <= 1) && 
							(!instr_arr[ti][2] || fwd_arr[ti][2] == i || j <= 2) && 
							(!instr_arr[ti][3] || fwd_arr[ti][3] == i || j <= 3))
						{
							if (rarr[ndx] < 0.6)
							{
								fwd_arr[ti][j] = i;
							}
							ndx++;
						}
					}
				}
			}
		}
		return fwd_arr;
	}
	
	this.adaptpattern = function(stress, energy)
	{
		if (!self.has_gen)
		{
			console.log("No generation call performed!");
			return;
		}
	
		self.pattern = new Array();
		new rng(self.aud_seed);
		
		var base_note = Math.floor(self.random.next() * 11.99) + 12;
		var transitions = new Array();
				
		for (var i = 0; i < self.aud_pat; i++)
		{
			if (self.random.next() < 0.5)
				transitions.push("low");
			else
				transitions.push("high");
		}
		console.log("base note (C = 0) is " + base_note % 12);
		console.log("transitions: ");
		console.log(transitions);
		
		new rng(self.aud_seed);
		console.log("instr arr: ");
		var instr_arr = new Array();
		populate_instr(energy, self.aud_pat, instr_arr);
		console.log(instr_arr);
		
		new rng(self.aud_seed);
		console.log("fwd arr: ");
		var fwd_arr = populate_fwd(instr_arr, self.aud_pat);
		console.log(fwd_arr);
		
		// reset RNG for pattern-length independence
		new rng(self.aud_seed);
		
		// Set Percussion
		self.populate_perc(stress, energy, self.aud_pat, self.aud_patlen, transitions);
		
		// Pick base note and create base note
		var Jmap = self.createJMap(stress, energy);
		var Fmap = self.createFMap(stress, energy);
		var Pmap = self.createPMap(stress, energy);
		console.log("Join Map: ");
		console.log(Jmap);
		console.log("Follow Map: ");
		console.log(Fmap);
		console.log("Prevalence Table: " + Pmap);
			
		// reset RNG for pattern-length independence
		new rng(self.aud_seed);
		var n_tracks = Math.floor(2 + energy * 0.5 + self.random.next() * 1.2);
		// set other instruments & melody
		self.populate_melody(stress, energy, self.aud_pat, self.aud_patlen, transitions, Jmap, Fmap, Pmap, base_note, 0, instr_arr, n_tracks, fwd_arr);
		
		new rng(self.aud_seed);
		for (var temp = 0; temp < 20; temp++) self.random.next(); // so the two melodic tracks aren't identical
		n_tracks = Math.floor(2 + energy * 0.5 + self.random.next() * 1.2);
		self.populate_melody(stress, energy, self.aud_pat, self.aud_patlen, transitions, Jmap, Fmap, Pmap, base_note + 12, 1, instr_arr, n_tracks, fwd_arr);
		
		new rng(self.aud_seed);
		for (var temp = 0; temp < 40; temp++) self.random.next(); // so the two melodic tracks aren't identical
		n_tracks = Math.floor(2 + energy * 0.5 + self.random.next() * 1.2);
		self.populate_melody(stress, energy, self.aud_pat, self.aud_patlen, transitions, Jmap, Fmap, Pmap, base_note + 24, 2, instr_arr, n_tracks, fwd_arr);
		
		new rng(self.aud_seed);
		for (var temp = 0; temp < 80; temp++) self.random.next(); // so the two melodic tracks aren't identical
		n_tracks = Math.floor(2 + energy * 0.5 + self.random.next() * 1.2);
		self.populate_melody(stress, energy, self.aud_pat, self.aud_patlen, transitions, Jmap, Fmap, Pmap, base_note + 36, 3, instr_arr, n_tracks, fwd_arr);
		
		// copy the pattern into the player interface
		if (self.interf.pattern == 0)
			self.interf.pattern = self.pattern;
		else
		{
			self.interf.to_pattern = self.pattern;
			self.interf.to_time = 40000;
			self.interf.to_total = 40000;
		}
		
	}
	
	this.generatepattern = function(stress, energy, pat, patlen, seed)
	{
		if (pat < 1) pat = 1;
		if (pat > 100) pat = 100;
		if (patlen < 1) patlen = 1;
		if (patlen > 8) patlen = 8;
	
		// apply new pattern/length/seed
		self.aud_pat = pat;
		self.aud_patlen = patlen;
		self.aud_seed = seed;
		
		self.has_gen = true;
		self.adaptpattern(stress, energy);	

		// reset song
		self.interf.t = 0;
		self.interf.prev_pos = 0;
		self.pattern_position = 0;
		self.interf.paused = true;
		if (self.ontick != 0) self.ontick();
		
	}
	
	this.current_map;
	
}

aud.clear();