var mainmenu = {};

mainmenu.MainMenu = function() {
};

mainmenu.MainMenu.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.bind_events();
		this.main_menu.css("display","flex");
	},
	
	obscuring : function() {
		this.main_menu.hide();
	},
	
	revealed : function() {
		this.main_menu.show();
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.main_menu = $("#main_menu");
		this.start_button = $("#start_button").button();
		this.options_button = $("#options_button").button();
		this.calibrate_button = $("#calibrate_button").button();
		this.instructions_button = $("#instructions_button").button();
	},

	bind_events : function() {
		this.start_button.bind("click", function(){
			game.state_manager.push_state("level");			
		});
		this.options_button.bind("click", function(){
			game.state_manager.push_state("options_menu");
		});
		this.calibrate_button.bind("click", function(){
			game.state_manager.push_state("calibrate_menu");
		});
	},
};