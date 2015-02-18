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
	this.pupil_width = this.scale * ORB_PUPIL_WIDTH;
	
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
		this.draw_outer_hex(ctx,color1,1);
		this.draw_iris(ctx,color1,1);		
		this.draw_outer_hex(ctx,color2,-1);
		this.draw_pupil(ctx,color2,-1);
	},	

	draw_outer_hex : function(ctx, color, polarity){
		ctx.strokeStyle = color;
		ctx.lineWidth = this.outer_line_width + this.extra_thickness;
		
		var sides = 6;
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

	draw_iris : function(ctx, color, polarity){
		ctx.strokeStyle = color;		
		
		radius = this.iris_width/2;
		x = this.iris_x + polarity*(this.separation/2) + this.x_offset;
		y = this.iris_y;
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.lineWidth = this.iris_line_width + this.extra_thickness;
		ctx.stroke()
	},
	
	draw_pupil : function(ctx, color, polarity){
		ctx.fillStyle = color;
		
		radius = this.pupil_width/2 + this.extra_thickness/2;
		x = this.pupil_x + polarity*(this.separation/2) + this.x_offset;
		y = this.pupil_y;
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
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
						this.iris_width = this.scale * ORB_IRIS_WIDTH;
						this.iris_line_width = this.scale * ORB_IRIS_LINE_WIDTH;
						this.pupil_width = this.scale * ORB_PUPIL_WIDTH;
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
		this.pupil_x += this.speed_x/TICKS;
		this.pupil_y += this.speed_y/TICKS;
	},	

	new_answer : function() {
		var x_offset = 0;
		var y_offset = 0;		

		switch(utilities.randInt(1,4)) {
			case 1:
				this.answer = "up";
				y_offset = -4;
				break;
			case 2:
				this.answer = "down";
				y_offset = 4;
				break;
			case 3:
				this.answer = "right";
				x_offset = 4;
				break;
			case 4:
				this.answer = "left";
				x_offset = (-4);
				break;
		}
				
		this.random_iris();
		
		this.pupil_x = this.iris_x + (x_offset * this.scale);
		this.pupil_y = this.iris_y + (y_offset * this.scale);
	},

	random_iris : function() {
		this.iris_x = this.center_x + utilities.randInt((-7)*this.scale, 7*this.scale);
		this.iris_y = this.center_y + utilities.randInt((-7)*this.scale, 7*this.scale);
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
			if (guessed === this.answer) {
				this.correct_guesses.push([this.iris_x, this.iris_y]);
				this.pulsate();
			} else {
				this.incorrect_guesses.push([this.iris_x, this.iris_y]);
				this.shake();
			}
		}
	},
	
//TODO: add sounds
//TODO: comment code
};