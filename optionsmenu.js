var optionsmenu = {};

optionsmenu.OptionsMenu = function() {
};

optionsmenu.OptionsMenu.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.bind_events();
		this.options_menu.css("display","flex");
	},
	
	obscuring : function() {},
	
	revealed : function() {},
	
	exiting : function() {
		this.release_events();
		this.options_menu.hide();
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.options_menu = $("#options_menu");
		$("#palette_radio").buttonset();
	},

	bind_events : function() {
		$('body').on('keyup', function(event){
			if (event.keyCode === 27) {
				game.state_manager.pop_state();
			}
		});
	},
	
	release_events : function() {
		$('body').off('keyup');
	},
};