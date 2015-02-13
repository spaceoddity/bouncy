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
		this.expand();
		this.level.css("display","flex");		
		this.choose_answer();		
		this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2, ORB_SCALE);						   
		this.orb.set_answer(this.answer);
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
			
			var canvas = this.canvas;
			var speed = ORB_SPEED;
			var bounce = ORB_BOUNCE;
			var separation = ORB_SEPARATION;
			var scale = ORB_SCALE;
			
			this.orb.update(canvas, speed, bounce, separation, scale);
			this.update_countdown();
		}
	},
	
	draw : function() {
		var width = this.canvas.width;
		var height = this.canvas.height;
	
		//clear
		this.context.clearRect(0,0,width,height);
		
		var ctx = this.context;
		var color1 = this.settings.color1;
		var color2 = this.settings.color2;
		
		//draw orb
		this.orb.draw(ctx, color1, color2);
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
			this.create_graphs();
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
		var graph_width = this.window.width()*0.65;
		var graph_height = this.window.height()*0.65;
		
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
			this.orb.incorrect_effect();
		}
	},
};