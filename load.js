var load = {};

load.Load = function() {
};

load.Load.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.load_menu.css("display","flex");
		this.expand();
		
		game.state_manager.push_state("main_menu");
	},
	
	obscuring : function() {
		this.load_menu.hide();
		//this.contract();
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.window = $(window);
		this.viewport = $("#viewport");
		this.load_menu = $("#loading");
	},
	
	expand : function() {
		if (this.window.height() > this.load_menu.height()) {
			this.viewport.height(this.window.height());
		}
	},
};