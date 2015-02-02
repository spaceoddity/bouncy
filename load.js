var load = {};

load.Load = function(layers, options) {
};

load.Load.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.load_menu.css("display","flex");
		game.state_manager.push_state("level");
	},
	
	obscuring : function() {
		this.load_menu.hide();
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.load_menu = $("#loading");
	},
};