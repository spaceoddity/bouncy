var level = {};

level.Level = function(settings) {
	//settings determined by palette chosen by user
	this.color1 = settings.color1;
	this.color2 = settings.color2;
	this.blendmode = settings.blendmode;

	//html elements
	this.window = $(window);
	this.body = $('body');
	this.level = $("#level");
	this.level.css("background",settings.background);
	this.canvas = $("#canvas")[0];
	this.context = this.canvas.getContext('2d');
	this.countdown = $("#countdown");
	this.pause = $("#pause")
	$("#pause_tabs").tabs();
	this.hits_graph = $("#hits_graph");
	this.misses_graph = $("#misses_graph");
	this.resume_button = $("#resume_button").button().button("enable");
	this.quit_button = $("#quit_button").button();	
	
	//functions that use closures and must be declared in the constructor, not the prototype
	this.update_countdown = (function() {
		var elapsed = 0;
		return function() {
			elapsed += 1;
			var remaining = (GAME_LENGTH*60) - (elapsed/TICKS);
			var minutes = Math.floor(remaining/60);
			var seconds = Math.floor(remaining%60);
			this.countdown.html(minutes + ":" + ("0"+seconds).slice(-2));		
			
			if (elapsed/TICKS >= GAME_LENGTH*60) {
				elapsed = 0;
				this.create_graphs();
				this.pause.show();
				this.resume_button.button("disable");
				this.body.off('keyup');
			}
		};
	})();
}

level.Level.prototype = {

	entered : function() {
		//exapnd the level to fill the browser window
		this.expand();
		
		//set the blend mode, which must be done after expansion
		this.context.globalCompositeOperation = this.blendmode;
		
		//make the level visible
		this.level.css("display","flex");

		//create an orb in the center of the level
		this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2);						   
		this.orb.new_answer();
		
		//add keyboard listeners
		this.add_listeners();
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
		//
		if (this.pause.is(":hidden")) {
			var canvas = this.canvas;
			this.orb.update(canvas);
			this.update_countdown();
		}
	},
	
	draw : function() {
		//clear canvas
		var width = this.canvas.width;
		var height = this.canvas.height;
		this.context.clearRect(0,0,width,height);
		
		//draw orb
		this.orb.draw(this.context, this.color1, this.color2);
	},
	
	expand : function() {
		this.level.width(this.window.width());
		this.level.height(this.window.height());		
		this.canvas.width = this.window.width();
		this.canvas.height = this.window.height();
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
				this.orb.check_answer(guessed);
			}
			if (event.keyCode === 27) {
				this.pause.toggle();
				if (this.pause.is(":visible")) {
					this.create_graphs();
				}
			}
		}).bind(this));
		
		this.resume_button.on("click", (function(){
			this.pause.toggle();
		}).bind(this));
		
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
		
		//create new correct hex graph
		this.hex_graph(HEX_CORRECT_COLOR,"#hits_graph", this.orb.correct_guesses);
		
		//create new incorrect hex graph
		this.hex_graph(HEX_INCORRECT_COLOR,"#misses_graph", this.orb.incorrect_guesses);
	},

	hex_graph : function(color, id, data) {
		//use d3 to create hexbin
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
//TODO: add other page of pause menu
//TODO: make hexes proportional to canvas
//TODO: comment all of the code
};