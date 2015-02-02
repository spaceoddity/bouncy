var level = {};

level.Level = function(layers, settings) {
	this.layer_canvas = layers.canvas;
	this.layer_context = layers.context;
	this.settings = settings;
	
	this.answer = "";
	this.correct_guesses = [];
	this.incorrect_guesses = [];
}

level.Level.prototype = {

	entered : function() {
		$("#canvas0").show();
		$("#canvas1").show();
		$("#canvas2").show();
		
		this.expand();
		this.layer_context.ctx1.globalCompositeOperation = "multiply";
		this.clear_layers();		
			
		$("#hexgraph_correct").hide();
		$("#hexgraph_incorrect").hide();
		
		this.set_background();
		this.orb = new orb.Orb((document.documentElement.clientWidth - 20)/2, (document.documentElement.clientHeight - 20)/2,
							   this.settings.separation, this.settings.scale,
							   this.settings.speed, this.settings.xyratio,
							   this.settings.rand_bounce);
		this.choose_answer();
		this.orb.set_answer(this.answer);
		this.orb.center();
		this.add_listeners();
	},

	obscuring : function() {},

	revealed : function() {},

	exiting : function() {
		$("#canvas0").hide();
		$("#canvas1").hide();
		$("#canvas2").hide();
		
		this.contract();
	},

	update : function() {
		this.orb.update(this.layer_canvas.canvas1);	
	},
	
	draw : function() {
		this.clear();
		this.orb.draw(this.layer_context.ctx1);
	},
	
	clear : function() {
		this.layer_context.ctx1.clearRect(0, 0, this.layer_canvas.canvas1.width, this.layer_canvas.canvas1.height);
	},

	clear_layers : function() {
		for (i in this.layer_context) {
			this.layer_context[i].clearRect(0,0, this.layer_canvas.canvas0.width, this.layer_canvas.canvas0.height);
		}
	},
	
	set_background : function() {
		this.layer_context.ctx0.fillStyle = "rgb(127,127,127)";
		this.layer_context.ctx0.fillRect(0,0,this.layer_canvas.canvas0.width, this.layer_canvas.canvas0.height);
	},
	
	expand : function() {		
		var width = document.documentElement.clientWidth - 20;
		var height = document.documentElement.clientHeight - 20;
		for (i in this.layer_canvas) {
			this.layer_canvas[i].width = width;
			this.layer_canvas[i].height = height;
		}
		
		$("#hexgraph_correct").width(width).height(height);
		$("#hexgraph_incorrect").width(width).height(height);

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
			
			if (event.keyCode === 27) {
				this.hexgraph();
			}
			
		}).bind(this));
	},

	hexgraph : function(){
		var correct = $("#hexgraph_correct");
		var incorrect = $("#hexgraph_incorrect");
		
		if ( correct.is(":visible") && !incorrect.is(":visible") ) {
			correct.hide();
			incorrect.show();
			console.log("showing red");
		} else if ( !correct.is(":visible") && incorrect.is(":visible") ) {
			incorrect.hide();
			console.log("hiding all");
		} else {
			console.log("showing green");
			correct.show();
				
			//destroy old hex graph
			correct.empty();
			incorrect.empty();
			
			//create new correct hex graph------------------------------
			this.create_new_graph("darkgreen","#hexgraph_correct", this.correct_guesses);
			
			//create new incorrect hex graph----------------------------
			this.create_new_graph("darkred","#hexgraph_incorrect", this.incorrect_guesses);
		}
	},
	
	create_new_graph : function(dark_color, selection, data){
			//margins
			var margin = {top: 0, right: 0, bottom: 0, left: 0},
				width = document.documentElement.clientWidth - 20 - margin.left - margin.right,
				height = document.documentElement.clientHeight - 20; - margin.top - margin.bottom;

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
			
			svg.append("g")
			  .selectAll(".hexagon")
				.data(hexbin(data))
			  .enter().append("path")
				.attr("class", "hexagon")
				.attr("d", hexbin.hexagon())
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
				.style("fill", function(d) { return color(d.length); });	
	},
	
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
			//this.mark_correct();
			this.choose_answer();
			this.orb.set_answer(this.answer);
		} else {
			this.incorrect_guesses.push([this.orb.iris_x, this.orb.iris_y]);
			//this.mark_incorrect();
		}
	},
	
/* 	mark_correct : function(){
		this.layer_context.ctx2.fillStyle = "rgba(255,255,255,0.5)";
		this.layer_context.ctx2.beginPath();
		this.layer_context.ctx2.arc(this.orb.iris_x, this.orb.iris_y, 30, 0, 2 * Math.PI);
		this.layer_context.ctx2.fill();
	},
	
	mark_incorrect : function(){
		this.layer_context.ctx2.fillStyle = "rgba(0,0,0,0.5)";
		this.layer_context.ctx2.beginPath();
		this.layer_context.ctx2.arc(this.orb.iris_x, this.orb.iris_y, 30, 0, 2 * Math.PI);
		this.layer_context.ctx2.fill();
	}, */
} 

orb = {};
orb.Orb = function(center_x, center_y, separation, scale, speed, xyratio, rand_bounce){
	this.center_x = center_x;
	this.center_y = center_y;

	this.separation = separation;
	this.scale = scale;

	this.outer_width = scale * 50;
	this.outer_line_width = scale * 2;
	this.iris_width = scale * 20;
	this.iris_line_width = scale * 3;
	this.pupil_width = scale * 4;
	
	this.speed = speed;
	this.speed_x = speed*xyratio[0];
	this.speed_y = speed*xyratio[1];
	this.rand_bounce = rand_bounce;
	
	this.rotation_counter = 0;
	this.rotation_speed = 90; //degrees per second
};

orb.Orb.prototype = {
	center : function(){
		var adjustment = (this.separation / 2) * (-1);
		this.center_x += adjustment;
		this.iris_x += adjustment;
		this.pupil_x += adjustment;
	},
	
	draw : function(ctx){

		ctx.strokeStyle = "rgb(132,0,132)";
		ctx.fillStyle = "rgb(132,0,132)";
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

		ctx.strokeStyle = "rgb(0,129,129)";
		ctx.fillStyle = "rgb(0,129,129)";

		//outer 2
		ctx.beginPath();
		ctx.moveTo((this.center_x + this.separation) + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i <= numberOfSides;i += 1) {
			ctx.lineTo ((this.center_x + this.separation) + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();			   

		//pupil 2
		ctx.beginPath();
		ctx.arc(this.pupil_x + this.separation, this.pupil_y, this.pupil_width/2, 0, 2 * Math.PI);
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
			this.speed_x = (this.speed_x > 0) ? -this.speed : this.speed;
			this.speed_y = (Math.random >= 0.5) ? -Math.random()*this.speed : Math.random()*this.speed;
		} else if (axis === "y") {
			this.speed_x = (Math.random() >= 0.5) ? -Math.random()*this.speed : Math.random()*this.speed;			
			this.speed_y = (this.speed_y > 0) ? -this.speed : this.speed;		
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
		if (this.separation >= 0) {
			if (this.center_x + this.speed_x/TICKS + radius + this.separation >= canvas.width || this.center_x + this.speed_x/TICKS - radius  <= 0 ) {
				if (this.rand_bounce) {
					this.random_bounce("x");
				} else {
					this.bounce("x");
				}
			}		
		} else {
			if (this.center_x + this.speed_x/TICKS + radius  >= canvas.width || this.center_x + this.speed_x/TICKS - radius + this.separation  <= 0 ) {
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
		
		this.pupil_x = this.iris_x + (x_offset * this.scale);
		this.pupil_y = this.iris_y + (y_offset * this.scale);
	},

	random_iris : function() {
		this.iris_x = this.center_x + utilities.randInt((-7)*this.scale, 7*this.scale);
		this.iris_y = this.center_y + utilities.randInt((-7)*this.scale, 7*this.scale);
	},
};