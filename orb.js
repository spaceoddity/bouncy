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
	
	this.segment_length = this.scale * ORB_SEGMENT_LENGTH;
	this.segment_width = this.scale * ORB_SEGMENT_WIDTH;
	this.segment_line_width = this.scale * ORB_SEGMENT_LINE_WIDTH;
	
	this.rotation_counter = 0;
	
	//variables for movement
	this.x_dir = 1;
	this.y_dir = 1;
	
	//variables to store answers and guesses
	this.answer = [];
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
		this.draw_square(ctx, color1, 1);
		this.draw_square(ctx, color2, -1);
		//this.draw_outer_hex(ctx, color1, 1);
		//this.draw_outer_hex(ctx, color2, -1);
		this.draw_comparison(ctx, color1, this.answer[2], 1);
		this.draw_comparison(ctx, color2, this.answer[3], -1);
		//this.draw_word(ctx,color1, this.word[0], 1);
		//this.draw_word(ctx,color2, this.word[1], -1);
	},	

	draw_outer_hex : function(ctx, color, polarity){
		ctx.strokeStyle = color;
		ctx.lineWidth = this.outer_line_width + this.extra_thickness;
		
		var sides = 10;
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

	draw_square : function(ctx, color, polarity){
		ctx.strokeStyle = color;

		var width = this.segment_length*2 + this.segment_width*7;
		var height = this.segment_length*2 + this.segment_width*3;
		var x = (this.center_x + polarity*(this.separation/2) + this.x_offset) - width/2;
		var y = this.center_y - height/2;
		ctx.lineWidth = this.segment_width/2 + this.extra_thickness;		
		ctx.beginPath();
		ctx.rect(x,y,width,height);
		ctx.closePath();
		ctx.stroke();
		
/* 		var width1 = this.segment_length + this.segment_width*1.25;
		var height1 = this.segment_length*2 + this.segment_width*1.25;		
		var x1 =(this.center_x + polarity*(this.separation/2) + this.x_offset)-this.segment_length - this.segment_width*2.5;
		var y1 = this.center_y - this.segment_length - this.segment_width/2;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.rect(x1,y1,width1,height1);
		ctx.closePath();
		ctx.stroke(); */		
	},
	
	draw_comparison : function(ctx,color, answer, polarity){
		var self = this;
		var x = this.center_x + polarity*(this.separation/2) + this.x_offset;
		var y = this.center_y;
		var len = this.segment_length;
		var width = this.segment_width;		
		var x1 = x - len/2 - width*2;
		var x2 = x + len/2 + width*2;

		this.thing_between(ctx,x,y,color);
		
		_.forEach(answer, function(n){
			switch (n) {
				case "a1":
					self.horz_segment(ctx, x1, y-len, color); //top
					break;
				case "a2":
					self.horz_segment(ctx, x2, y-len, color); //top				
					break;
				case "b1":
					self.horz_segment(ctx, x1, y, color); //mid
					break;
				case "b2":
					self.horz_segment(ctx, x2, y, color); //mid
					break;
				case "c1":
					self.horz_segment(ctx, x1, y+len, color); //bottom
					break;
				case "c2":
					self.horz_segment(ctx, x2, y+len, color); //bottom
					break;
				case "d1":
					self.vert_segment(ctx, x1-len/2, y-len/2, color); //left upper
					break;
				case "d2":
					self.vert_segment(ctx, x2-len/2, y-len/2, color); //left upper
					break;
				case "e1":
					self.vert_segment(ctx, x1-len/2, y+len/2, color); //left lower
					break;
				case "e2":
					self.vert_segment(ctx, x2-len/2, y+len/2, color); //left lower
					break;
				case "f1":
					self.vert_segment(ctx, x1+len/2, y-len/2, color); //right upper
					break;
				case "f2":
					self.vert_segment(ctx, x2+len/2, y-len/2, color); //right upper
					break;
				case "g1":
					self.vert_segment(ctx, x1+len/2, y+len/2, color); //right lower
					break;
				case "g2":
					self.vert_segment(ctx, x2+len/2, y+len/2, color); //right lower
					break;
			}
		});
	},

	thing_between : function(ctx,x,y,color){
		var len = this.segment_length;
		var width = this.segment_width;
		ctx.fillStyle = color;

		ctx.beginPath();
		ctx.moveTo(x-width/2, y);
		ctx.lineTo(x, y-width/2);
		ctx.lineTo(x+width/2, y);
		ctx.lineTo(x, y+width/2);
		ctx.closePath();
		ctx.fill();
	},
	
	horz_segment : function(ctx,x,y,color){
		var len = this.segment_length;
		var width = this.segment_width;
		ctx.fillStyle = color;
		
		ctx.beginPath();
		ctx.moveTo(x-len/2, y);
		ctx.lineTo(x-len/2+width/2, y-width/2);
		ctx.lineTo(x+len/2-width/2, y-width/2);
		ctx.lineTo(x+len/2, y);
		ctx.lineTo(x+len/2-width/2, y+width/2);
		ctx.lineTo(x-len/2+width/2, y+width/2);
		ctx.closePath();
		ctx.fill();
	},

	vert_segment : function(ctx,x,y,color){		
		var len = this.segment_length;
		var width = this.segment_width;
		ctx.fillStyle = color;
		
		ctx.beginPath();
		ctx.moveTo(x, y-len/2);
		ctx.lineTo(x-width/2, y-len/2+width/2);
		ctx.lineTo(x-width/2, y+len/2-width/2);
		ctx.lineTo(x, y+len/2);
		ctx.lineTo(x+width/2, y+len/2-width/2);
		ctx.lineTo(x+width/2, y-len/2+width/2);
		ctx.closePath();
		ctx.fill();
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
						this.segment_length = this.scale * ORB_SEGMENT_LENGTH;
						this.segment_width = this.scale * ORB_SEGMENT_WIDTH;
						this.segment_line_width = this.scale * ORB_SEGMENT_LINE_WIDTH;
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
	},	

	new_answer : function() {
		this.answer = [];
		this.answer[0] = _.random(0,9);
		this.answer[1] = _.random(0,9);
		while (this.answer[0] === this.answer[1]) {
			this.answer[1] = _.random(0,9);
		}
		this.answer[2] = [];
		this.answer[3] = [];
		this.shuffle_answer(this.answer[0], 1);
		this.shuffle_answer(this.answer[1], 2);
	},
	
	shuffle_answer : function(num, side){
		var segments;
		
		switch (num) {
			case 0:
				segments = ["a","c","d","e","f","g"];
				break;
			case 1:
				segments = ["f","g"];
				break;
			case 2:
				segments = ["a","b","c","e","f"];
				break;
			case 3:
				segments = ["a","b","c","f","g"];
				break;
			case 4:
				segments = ["b","d","f","g"];
				break;
			case 5:
				segments = ["a","b","c","d","g"];				
				break;
			case 6:
				segments = ["a","b","c","d","e","g"]; 
				break;
			case 7:
				segments = ["a","f","g"];
				break;
			case 8:
				segments = ["a","b","c","d","e","f","g"];
				break;
			case 9:
				segments = ["a","b","c","d","f","g"];
				break;
		}
		
		segments = _.shuffle(segments);
		var first_half;	
		
		if (segments.length % 2 > 0) {
			if (_.random(1,10)>5) {
				first_half = Math.ceil(segments.length/2);
			} else {
				first_half = Math.floor(segments.length/2);
			}
		} else {
			first_half = segments.length/2;
		}
				
		for (i=0; i < first_half+1; i++) {
			this.answer[2].push(segments[i] + side.toString());
		}
		for (i=first_half-1; i < segments.length; i++) {
			this.answer[3].push(segments[i] + side.toString());
		}
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
			if ((this.answer[0]>this.answer[1] && guessed === "left") || (this.answer[0]<this.answer[1] && guessed === "right")) {
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

/* Word = {
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
		"zebra",  "donkey", "shrimp", "turkey", "tiger",  "horse",  "roach",
		"monkey", "rabbit", "eagle",  "beaver", "animal", "woman",  "skunk",
		"kitten", "shark",  "snake",  "birds",  "daisy",  "people", "bushes",
		"whale",  "lizard", "goose",  "snail",  "grass",  "child",  
		"puppy",  "human",  "parrot", "squid",  "trees",  "doggy",
		"goats",  "sheep",  "mouse",  "rhino",  "lions",  "bears",
		"worms",  "ducks",  "wolves", "walrus", "insect", "beetle",
		"turtle", "frogs",  "panda",  "moose",  "oyster", "poodle",
		"jaguar", "crabs",  "koala",  "llama",  "gopher", "clams",
		"gerbil", "falcon", "toads",  "cattle", "hyena",  "bobcat",
		"spider", "baboon", "badger", "coyote", "camel",  "bunny",
	],	
	
	not_living : [
		"pillow", "table",  "towel",  "shoes",  "knife",  "music",
		"phone",  "paper",  "couch",  "socks",  "plate",  "radio",
		"clock",  "pencil", "teapot", "shirt",  "napkin", "butter",
		"chair",  "candle", "hammer", "pants",  "water",  "cookie",
		"bottle", "truck",  "string", "spoon",  "boats",  "cream",
		"staple", "school", "sphere", "jacket", "steam",  "fridge",
		"cycle",  "ticket", "burger", "future", "house",  "doors",
		"glove",  "bagel",  "chalk",  "cloud",  "wallet", "toilet",
	],
}; */

