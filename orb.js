orb = {};
orb.Orb = function(center_x, center_y){
	//starting coordinates
	this.center_x = center_x;
	this.center_y = center_y;

	//set initial orb properties according to globals
	this.speed = ORB_SPEED;
	this.bounce_ratio = ORB_BOUNCE;
	this.separation = ORB_SEPARATION;
	this.scale = ORB_SCALE;
	this.outer_width = this.scale * ORB_WIDTH;
	this.outer_line_width = this.scale * ORB_LINE_WIDTH;
	this.iris_width = this.scale * ORB_IRIS_WIDTH;
	this.iris_line_width = this.scale * ORB_IRIS_LINE_WIDTH;
	
	this.rotation_counter = 0;
	
	//variables for movement
	this.x_dir = 1;
	this.y_dir = 1;
	
	//variables to store answers and guesses
	this.answer = "";
	this.correct_guesses = [];
	this.incorrect_guesses = [];
	
	//variables for wrong answer shake effect
	this.x_offset = 0;
	this.shaking = false;
	
	//variables for correct answer pulsate effect
	this.extra_thickness = 0;
	this.pulsating = false;
	
	this.shake = (function() {
		var total = 0;
		var polarity = 1;
		var num_of_shakes = 2;
		var time = 0.3;
		var turn_point = this.outer_width/6;
		var distance = turn_point*4*num_of_shakes;
		var speed = distance/time;
		
		return function(){
			this.shaking = true;
			if (total + (speed/TICKS) >= distance) {
				total = 0;
				polarity = 1;
				this.x_offset = 0;
				this.shaking = false;
			} else {		
				this.x_offset += (speed/TICKS*polarity);
				total += (speed/TICKS);
				if (this.x_offset >= turn_point || this.x_offset <= -turn_point) {
					this.x_offset = turn_point * polarity;
					polarity *= (-1);
					total = utilities.nearestMultiple(total,turn_point,"floor");
				}
			}
		};
	}).bind(this)();	
	
	this.pulsate = (function() {
		var total = 0;
		var polarity = 1;
		var num_of_pulses = 1;
		var time = 0.3;
		var max = Math.round(this.outer_line_width*1.5);			
		var distance = num_of_pulses * max * 2;
		var speed = distance/time;
		
		return function() {	
			this.pulsating = true;
			if (total >= distance) {
				total = 0;
				polarity = 1;
				this.extra_thickness = 0;
				this.pulsating = false;
				this.new_answer();
			} else {
				this.extra_thickness += (speed/TICKS*polarity);
				total += (speed/TICKS);
				if (this.extra_thickness >= max || this.extra_thickness <= 0) {
					this.extra_thickness = (this.extra_thickness > 0) ? max : 0;
					polarity *= (-1);
					total = utilities.nearestMultiple(total,max,"round");
				}
			}
		};
	}).bind(this)();	
};

orb.Orb.prototype = {	
	draw : function(ctx, color1, color2){
		this.draw_outer_hex(ctx, color1, 1);
		this.draw_outer_hex(ctx, color2, -1);	
		this.draw_word(ctx,color1, this.word[0], 1);
		this.draw_word(ctx,color2, this.word[1], -1);
	},	

	draw_outer_hex : function(ctx, color, polarity){
		ctx.strokeStyle = color;
		ctx.lineWidth = this.outer_line_width + this.extra_thickness;
		
		var sides = 4;
		var rotation = this.rotation_counter * Math.PI/180;
		var radius = this.outer_width/2;
		var x = this.center_x + polarity*(this.separation/2) + this.x_offset; 
		var y = this.center_y;
		
		ctx.beginPath();
		ctx.moveTo(x + radius * Math.cos(0 + rotation), y + radius *  Math.sin(0 + rotation));          
		for (i = 1; i < sides; i += 1) {
			ctx.lineTo (x + radius * Math.cos(i * 2 * Math.PI / sides + rotation ), y + radius * Math.sin(i * 2 * Math.PI / sides + rotation));
		}
		ctx.closePath();
		ctx.stroke();			
	},	

	draw_word : function(ctx, color, word, polarity){	
		ctx.fillStyle = color;
		ctx.font = "bold " + ORB_FONT_SIZE*this.scale+"px " + ORB_FONT;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		
		x = this.center_x + polarity*(this.separation/2) + this.x_offset;
		y = this.center_y;
		
		ctx.fillText(word,x,y);
	},
	
	bounce : function(axis) {
		if (axis === "x") {
			this.x_dir = this.x_dir * (-1);
		} else if (axis === "y") {
			this.y_dir = this.y_dir * (-1);
		}
	},
	
	update : function(canvas, options) {
		if (options !== undefined) {
			for (var key in options) {
				switch (key) {
					case "speed":
					case "bounce_ratio":
					case "separation":
						this[key] = options[key];
						break;						
					case "scale":
						this[key] = options[key];
						this.outer_width = this.scale * ORB_WIDTH;
						this.outer_line_width = this.scale * ORB_LINE_WIDTH;
						this.iris_width = this.scale * ORB_IRIS_WIDTH;
						this.iris_line_width = this.scale * ORB_IRIS_LINE_WIDTH;
						//this.pupil_width = this.scale * ORB_PUPIL_WIDTH;
						break;					
				}
			}
		}
		
		this.speed_x = this.speed*this.bounce_ratio[0] * this.x_dir;
		this.speed_y = this.speed*this.bounce_ratio[1] * this.y_dir;
		
		this.check_bounds(canvas);
		
		this.rotation_counter += ORB_ROTATION_SPEED/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		this.move();
		
		if (this.shaking) {
			this.shake();
		}
		
		if (this.pulsating) {
			this.pulsate();
		}
	},
	
	check_bounds : function(canvas) {
		var radius = ((this.outer_width/2)+this.outer_line_width/2);
		if (this.center_x + this.speed_x/TICKS + radius + this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS + radius - this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS - radius - this.separation/2  <= 0 ||
			this.center_x + this.speed_x/TICKS - radius + this.separation/2  <= 0){
				this.bounce("x");
		}
		if (this.center_y + this.speed_y/TICKS + radius >= canvas.height || this.center_y + this.speed_y/TICKS - radius <= 0) {
			this.bounce("y");
		}	
	},
	
	move : function() {
		this.center_x += this.speed_x/TICKS;
		this.center_y += this.speed_y/TICKS;
		this.iris_x += this.speed_x/TICKS;
		this.iris_y += this.speed_y/TICKS;
		//this.pupil_x += this.speed_x/TICKS;
		//this.pupil_y += this.speed_y/TICKS;
	},	

	new_answer : function() {	
		var word = Word.new_word()
		
		this.answer = word[0];
		this.word = [word[1], word[2]];
	},
	
	set_xy : function(new_x, new_y) {
		var old_x = this.center_x;
		var old_y = this.center_y;
		
		var difference_x = new_x - old_x;
		var difference_y = new_y - old_y;
		
		this.center_x = new_x;
		this.center_y = new_y;
		
		this.iris_x += difference_x;
		this.iris_y += difference_y;
		
		this.pupil_x += difference_x;
		this.pupil_y += difference_y;
	},
	
	check_answer : function(guessed) {
		//if not currently shaking or pulsating, check answers
		if (!this.shaking && !this.pulsating) {
			if ((this.answer === "living" && guessed === "right") || (this.answer === "not_living" && guessed === "left")) {
				this.correct_guesses.push([this.center_x, this.center_y]);
				this.pulsate();
			} else {
				this.incorrect_guesses.push([this.center_x, this.center_y]);
				this.shake();
			}
		}
	},
	
//TODO: add sounds
//TODO: comment code
};

Word = {
	new_word : function(){
		var word;
		var answer;
		
		if (utilities.randInt(1,100) > 50) {
			answer = "living";
			word = this.living[utilities.randInt(0,this.living.length-1)];
			word = this.split(word);
		} else {
			answer = "not_living";
			word = this.not_living[utilities.randInt(0,this.not_living.length-1)]
			word = this.split(word);			
			return ["not_living", word[0], word[1]];
		}
		
		return [answer, word[0], word[1]];
	},
	
	split : function(word){
		var split_word;
		var pattern;
		var five = ["xooxo", "oxoox", "xoxxo", "oxxox"];
		var six = ["xooxxo", "oxxoox"];		
		var parse = function(wrd, pttrn){
			var word1 = "";
			var word2 = "";
			for (i=0; i < wrd.length; i++) {
				if (pttrn[i] === "x") {
					word1 += wrd[i];
					word2 += " ";
				} else if (pttrn[i] === "o") {
					word1 += " ";
					word2 += wrd[i];
				}
			}
			return [word1, word2];
		};
			
		if (word.length === 5) {
			pattern = five[utilities.randInt(0, five.length-1)];
			split_word = parse(word, pattern);
		} else if (word.length === 6) {
			pattern = six[utilities.randInt(0, six.length-1)];
			split_word = parse(word, pattern);
		}
		
		return split_word;
	},
	
	living : [
		"zebra",  "donkey", "shrimp", "turkey", "tiger",  "horse",
		"monkey", "rabbit", "eagle",  "beaver", "animal", "woman",
		"kitten", "shark",  "snake",  "birds",  "daisy",  "people",
		"whale",  "lizard", "goose",  "snail",  "grass",  "child",
		"puppy",  "human",  "parrot", "squid",  "trees",  "doggy",
		"goats",  "sheep",  "mouse",  "rhino",  "lions",  "bears",
		"worms",  "ducks",  "wolves", "walrus", "insect", "beetle",
		"turtle", "frogs",  "panda",  "moose",  "oyster", "poodle",
		"jaguar", "crabs",  "koala",  "llama",  "gopher", "clams",
		"gerbil", "falcon", "toads",  "cattle", "hyena",  "bobcat",
		"spider", "baboon", "badger", "coyote", "camel",
	],	
	
	not_living : [
		"pillow", "table",  "towel",  "shoes",  "knife",  "music",
		"phone",  "paper",  "couch",  "socks",  "plate",  "radio",
		"clock",  "pencil", "teapot", "shirt",  "napkin", "butter",
		"chair",  "candle", "hammer", "pants",  "water",  "cookie",
		"bottle", "truck",  "string", "spoon",  "boats",  "cream",
		"staple", "school", "sphere", "jacket", "steam",  "fridge",
		"cycle",  "ticket",
	],
};