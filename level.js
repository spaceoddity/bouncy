var level = {};
//TODO: Pass colors through draw, not constructor
level.Level = function(settings) {
	this.settings = settings;
	
	this.answer = "";
	this.correct_guesses = [];
	this.incorrect_guesses = [];
}

level.Level.prototype = {

	entered : function() {
		this.get_html_elements();
		this.expand();
		this.level.css("display","flex");		
		this.choose_answer();		
		this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2,
							   this.settings.color1, this.settings.color2);						   
		this.orb.set_answer(this.answer);
		this.orb.center();
		this.add_listeners();
		this.elapsed = 0;
	},

	get_html_elements : function() {
		this.window = $(window);
		this.body = $('body');
		this.level = $("#level");
		this.level.css("background",this.settings.background);
		this.canvas = $("#canvas")[0];
		this.context = this.canvas.getContext('2d');
		this.countdown = $("#countdown");
		
		this.pause = $("#pause")
		$("#pause_tabs").tabs();
		this.hits_graph = $("#hits_graph");
		this.misses_graph = $("#misses_graph");
		
		this.resume_button = $("#resume_button").button().button("enable");
		this.quit_button = $("#quit_button").button();
	},
		
	obscuring : function() {
		this.remove_listners();
	},

	revealed : function() {
		this.add_listeners();
	},

	exiting : function() {
		this.remove_listners();
		this.level.hide();
	},

	update : function() {
		if (this.pause.is(":hidden")) {
			this.orb.update(this.canvas);
			this.update_countdown();
		}
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
		this.level.width(this.window.width());
		this.level.height(this.window.height());		
		this.canvas.width = this.window.width();
		this.canvas.height = this.window.height();
		this.context.globalCompositeOperation = this.settings.blendmode;
	},

	update_countdown : function() {
		this.elapsed += 1;

		var remaining = (GAME_LENGTH*60) - (this.elapsed/TICKS);
		
		var minutes = Math.floor(remaining/60);
		var seconds = Math.floor(remaining%60);
		this.countdown.html(minutes + ":" + ("0"+seconds).slice(-2));		
		
		if (this.elapsed/TICKS >= GAME_LENGTH*60) {
			this.pause.show();
			this.resume_button.button("disable");
			this.body.off('keyup');
		}
	},
	
	add_listeners : function() {
		this.body.on('keyup', (function(event){
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
				this.pause.toggle();
				if (this.pause.is(":visible")) {
					this.create_graphs();
				}
			}
		}).bind(this));
		
		this.resume_button.on("click", (function(){this.pause.toggle();}).bind(this));
		this.quit_button.on("click", (function(){
			this.pause.toggle();
			game.state_manager.pop_state();
		}).bind(this));
	},
	
	remove_listners : function() {
		this.body.off('keyup');
		this.resume_button.off("click");
		this.quit_button.off("click");
	},

	create_graphs : function(){
		//destroy old hex graph
		this.hits_graph.empty();
		this.misses_graph.empty();
		
		
		//create new correct hex graph------------------------------
		this.hex_graph("darkgreen","#hits_graph", this.correct_guesses);
		
		//create new incorrect hex graph----------------------------
		this.hex_graph("darkred","#misses_graph", this.incorrect_guesses);
	},

	hex_graph : function(color, id, data) {
		var graph_width = this.window.width()*0.50;
		var graph_height = this.window.height()*0.50;
		
		var data_width = this.window.width();
		var data_height = this.window.height();

		var x = d3.scale.linear()
			.domain([0, data_width])
			.range([0, graph_width]);

		var y = d3.scale.linear()
			.domain([0, data_height])
			.range([0, graph_height]);		

		var points = data.map(function(xy){
				return [x(xy[0]),y(xy[1])];
		});

		var color = d3.scale.linear()
			.domain([0, 3])
			.range(["white", color])
			.interpolate(d3.interpolateLab);

		var hexbin = d3.hexbin()
			.size([graph_width, graph_height])
			.radius(25);

		var svg = d3.select(id).append("svg")
			.attr("width", graph_width)
			.attr("height", graph_height)
		  .append("g");

		svg.append("clipPath")
			.attr("id", "clip")
		  .append("rect")
			.attr("class", "mesh")
			.attr("width", graph_width)
			.attr("height", graph_height);
			
		svg.append("g")
			.attr("clip-path", "url(#clip)")
		  .selectAll(".hexagon")
			.data(hexbin(points))
		  .enter().append("path")
			.attr("class", "hexagon")
			.attr("d", hexbin.hexagon())
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.style("fill", function(d) { return color(d.length); });

		svg.append("svg:path")
			.attr("clip-path", "url(#clip)")
            .attr("d",hexbin.mesh())
            .style("stroke-width", 0.1)
            .style("stroke", "gray")
            .style("fill", "none");			
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
			this.choose_answer();
			this.orb.set_answer(this.answer);
		} else {
			this.incorrect_guesses.push([this.orb.iris_x, this.orb.iris_y]);
		}
	},
} 

orb = {};
orb.Orb = function(center_x, center_y, color1, color2){
	this.center_x = center_x;
	this.center_y = center_y;

	this.outer_width = ORB_SCALE * ORB_WIDTH;
	this.outer_line_width = ORB_SCALE * ORB_LINE_WIDTH;
	this.iris_width = ORB_SCALE * ORB_IRIS_WIDTH;
	this.iris_line_width = ORB_SCALE * ORB_IRIS_LINE_WIDTH;
	this.pupil_width = ORB_SCALE * ORB_PUPIL_WIDTH;
	
	this.speed_x = ORB_SPEED*ORB_BOUNCE[0];
	this.speed_y = ORB_SPEED*ORB_BOUNCE[1];
	
	this.color1 = color1;
	this.color2 = color2;
	
	this.rotation_counter = 0;
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
	
/* 	random_bounce : function(axis) {
		if (axis === "x") {
			this.speed_x = (this.speed_x > 0) ? -ORB_SPEED : ORB_SPEED;
			this.speed_y = (Math.random >= 0.5) ? -Math.random()*ORB_SPEED : Math.random()*ORB_SPEED;
		} else if (axis === "y") {
			this.speed_x = (Math.random() >= 0.5) ? -Math.random()*ORB_SPEED : Math.random()*ORB_SPEED;			
			this.speed_y = (this.speed_y > 0) ? -ORB_SPEED : ORB_SPEED;		
		}
	}, */
	
	update : function(canvas) {
		this.check_bounds(canvas);
		
		this.rotation_counter += ORB_ROTATION_SPEED/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		this.move();
	},
	
	check_bounds : function(canvas) {
		var radius = ((this.outer_width/2)+this.outer_line_width/2);
		if (ORB_SEPARATION >= 0) {
			if (this.center_x + this.speed_x/TICKS + radius + ORB_SEPARATION >= canvas.width || this.center_x + this.speed_x/TICKS - radius  <= 0 ) {
				this.bounce("x");
			}
		} else {
			if (this.center_x + this.speed_x/TICKS + radius  >= canvas.width || this.center_x + this.speed_x/TICKS - radius + ORB_SEPARATION  <= 0 ) {
				this.bounce("x");
			}		
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