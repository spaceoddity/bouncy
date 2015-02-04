var level = {};

level.Level = function(settings) {
	this.settings = settings;
	
	this.answer = "";
	this.correct_guesses = [];
	this.incorrect_guesses = [];
}

level.Level.prototype = {

	entered : function() {
		this.get_html_elements();
		this.show();
		this.expand();	
		this.choose_answer();		
		this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2,
							   this.settings.xyratio,
							   this.settings.rand_bounce, this.settings.color1, this.settings.color2);						   
		this.orb.set_answer(this.answer);
		this.orb.center();
		this.add_listeners();
	},

	get_html_elements : function() {
		this.window = $(window);
		this.background = $("#level_background");
		this.background.css("background",this.settings.background);
		this.canvas = $("#canvas")[0];
		this.context = this.canvas.getContext('2d');
	},
	
	show : function() {
		this.canvas.style.display = "block";
	},
	
	obscuring : function() {
		this.remove_listners();
	},

	revealed : function() {
		this.add_listeners();
		this.show();
	},

	exiting : function() {
		//TODO: Exiting
	},

	update : function() {
		this.orb.update(this.canvas);	
	},
	
	draw : function() {
		var width = this.canvas.width;
		var height = this.canvas.height;
		
		//clear
		this.context.clearRect(0,0,width,height);
		
		//draw orb
		this.orb.draw(this.context);
	},
	
	expand : function() {
		this.canvas.width = this.window.width();
		this.canvas.height = this.window.height();
		this.context.globalCompositeOperation = this.settings.blendmode;
	},
	
/* 	contract : function() {
		for (i in this.layer_canvas) {
			this.layer_canvas[i].width = 800;
			this.layer_canvas[i].canvas.height = 600;
		}
		$("#container").width(800);
		$("#container").width(600);	
	}, */

	add_listeners : function() {
		$('body').on('keyup', (function(event){
			var guessed = "";
			switch(event.keyCode) {
				case 38:
					guessed = "up";
					break;
				case 40:
					guessed = "down";
					break;
				case 37:
					guessed = "left";
					break;
				case 39:
					guessed = "right";
					break;
			};
			if (guessed.length > 0) {
				this.check_answer(guessed);
			}
			
			//TODO: Other key acitons (esc)
			
		}).bind(this));
	},
	
	remove_listners : function() {
		//TODO: Remove listeners
	},

/*	hexgraph : function(){
		var correct = this.hexgraph_correct;
		var incorrect = this.hexgraph_incorrect;
		
		if ( correct.is(":visible") && !incorrect.is(":visible") ) {
			correct.hide();
			incorrect.show();
		} else if ( !correct.is(":visible") && incorrect.is(":visible") ) {
			incorrect.hide();
		} else {
			correct.show();
				
			//destroy old hex graph
			correct.empty();
			incorrect.empty();
			
			//create new correct hex graph------------------------------
			this.create_new_graph("darkgreen","#hexgraph_correct", this.correct_guesses);
			
			//create new incorrect hex graph----------------------------
			this.create_new_graph("darkred","#hexgraph_incorrect", this.incorrect_guesses);
		}
	}, */
	
/*	create_new_graph : function(dark_color, selection, data){
			//margins
			var margin = {top: 0, right: 0, bottom: 0, left: 0},
				width = this.window.width()*0.5 - margin.left - margin.right,
				height = this.window.height()*0.5 - margin.top - margin.bottom;

			//color scale
			var color = d3.scale.linear()
				.domain([0, 4]) //what comes in. number of things in the bin
				.range(["white", dark_color]) //what gets spit out, a color, light to dark
				.interpolate(d3.interpolateLab);				

			var hexbin = d3.hexbin()
				.size([width, height])
				.radius(30);
				
			// an identity scale is when... domain and range are identical... ?
			var x = d3.scale.identity()
				.domain([0, width]);

			var y = d3.scale.identity()
				.domain([0, height]);
				
			var svg = d3.select(selection).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
			svg.append("clipPath")
				.attr("id", "clip")
			  .append("rect")
				.attr("class", "mesh")
				.attr("width", width)
				.attr("height", height);
				
			svg.append("g")
			    .attr("clip-path", "url(#clip)")
			  .selectAll(".hexagon")
				.data(hexbin(data))
			  .enter().append("path")
				.attr("class", "hexagon")
				.attr("d", hexbin.hexagon())
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
				.style("fill", function(d) { return color(d.length); });	
	}, */
	
	choose_answer : function() {
		switch(utilities.randInt(1,4)) {
			case 1:
				this.answer = "up";
				break;
			case 2:
				this.answer = "down";
				break;
			case 3:
				this.answer = "right";
				break;
			case 4:
				this.answer = "left";
				break;
		};
	},
	
	check_answer : function(guessed) {
		if (guessed === this.answer) {
			this.correct_guesses.push([this.orb.iris_x, this.orb.iris_y]);
			this.choose_answer();
			this.orb.set_answer(this.answer);
		} else {
			this.incorrect_guesses.push([this.orb.iris_x, this.orb.iris_y]);
		}
	},
} 

orb = {};
orb.Orb = function(center_x, center_y, xyratio, rand_bounce, color1, color2){
	this.center_x = center_x;
	this.center_y = center_y;

	this.outer_width = ORB_SCALE * ORB_WIDTH;
	this.outer_line_width = ORB_SCALE * ORB_LINE_WIDTH;
	this.iris_width = ORB_SCALE * ORB_IRIS_WIDTH;
	this.iris_line_width = ORB_SCALE * ORB_IRIS_LINE_WIDTH;
	this.pupil_width = ORB_SCALE * ORB_PUPIL_WIDTH;
	
	this.speed_x = ORB_SPEED*xyratio[0];
	this.speed_y = ORB_SPEED*xyratio[1];
	this.rand_bounce = rand_bounce;
	
	this.color1 = color1;
	this.color2 = color2;
	
	this.rotation_counter = 0;
	this.rotation_speed = 90; //degrees per second //TODO: put this in constructor, and then in settings
};

orb.Orb.prototype = {
	center : function(){
		var adjustment = (ORB_SEPARATION / 2) * (-1);
		this.center_x += adjustment;
		this.iris_x += adjustment;
		this.pupil_x += adjustment;
	},
	
	draw : function(ctx){

		ctx.strokeStyle = this.color1;
		ctx.fillStyle = this.color1;
		var numberOfSides = 6;
		var rot = this.rotation_counter * Math.PI/180;
		
		//outer 1
		ctx.beginPath();
		ctx.moveTo(this.center_x + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i <= numberOfSides;i += 1) {
			ctx.lineTo (this.center_x + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		 
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();		

		//iris 1
		ctx.beginPath();
		ctx.arc(this.iris_x, this.iris_y, this.iris_width/2, 0, 2 * Math.PI);
		ctx.lineWidth = this.iris_line_width;
		ctx.stroke()				  	  

		//-------------------------------------------

		ctx.strokeStyle = this.color2;
		ctx.fillStyle = this.color2;

		//outer 2
		ctx.beginPath();
		ctx.moveTo((this.center_x + ORB_SEPARATION) + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i <= numberOfSides;i += 1) {
			ctx.lineTo ((this.center_x + ORB_SEPARATION) + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();			   

		//pupil 2
		ctx.beginPath();
		ctx.arc(this.pupil_x + ORB_SEPARATION, this.pupil_y, this.pupil_width/2, 0, 2 * Math.PI);
		ctx.fill();
	},

	bounce : function(axis) {
		if (axis === "x") {
			this.speed_x = -this.speed_x;
		} else if (axis === "y") {
			this.speed_y = -this.speed_y;
		}
	},
	
	random_bounce : function(axis) {
		if (axis === "x") {
			this.speed_x = (this.speed_x > 0) ? -ORB_SPEED : ORB_SPEED;
			this.speed_y = (Math.random >= 0.5) ? -Math.random()*ORB_SPEED : Math.random()*ORB_SPEED;
		} else if (axis === "y") {
			this.speed_x = (Math.random() >= 0.5) ? -Math.random()*ORB_SPEED : Math.random()*ORB_SPEED;			
			this.speed_y = (this.speed_y > 0) ? -ORB_SPEED : ORB_SPEED;		
		}
	},
	
	update : function(canvas) {
		this.check_bounds(canvas);
		
		this.rotation_counter += this.rotation_speed/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		this.move();
	},
	
	check_bounds : function(canvas) {
		var radius = ((this.outer_width/2)+this.outer_line_width/2);
		if (ORB_SEPARATION >= 0) {
			if (this.center_x + this.speed_x/TICKS + radius + ORB_SEPARATION >= canvas.width || this.center_x + this.speed_x/TICKS - radius  <= 0 ) {
				if (this.rand_bounce) {
					this.random_bounce("x");
				} else {
					this.bounce("x");
				}
			}		
		} else {
			if (this.center_x + this.speed_x/TICKS + radius  >= canvas.width || this.center_x + this.speed_x/TICKS - radius + ORB_SEPARATION  <= 0 ) {
				if (this.rand_bounce) {
					this.random_bounce("x");
				} else {
					this.bounce("x");
				}
			}		
		}

		if (this.center_y + this.speed_y/TICKS + radius >= canvas.height || this.center_y + this.speed_y/TICKS - radius <= 0) {
			if (this.rand_bounce) {
				this.random_bounce("y");
			} else {
				this.bounce("y");
			}
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

	set_answer : function(answer) {
		var x_offset = 0;
		var y_offset = 0;		
		
		switch (answer) {
			case "down":
				y_offset = 4;
				break;
			case "up":
				y_offset = (-4);
				break;
			case "right":
				x_offset = 4;
				break;
			case "left":
				x_offset = (-4);
				break;
		}

		this.random_iris();
		
		this.pupil_x = this.iris_x + (x_offset * ORB_SCALE);
		this.pupil_y = this.iris_y + (y_offset * ORB_SCALE);
	},

	random_iris : function() {
		this.iris_x = this.center_x + utilities.randInt((-7)*ORB_SCALE, 7*ORB_SCALE);
		this.iris_y = this.center_y + utilities.randInt((-7)*ORB_SCALE, 7*ORB_SCALE);
	},
};