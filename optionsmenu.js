var optionsmenu = {};

optionsmenu.OptionsMenu = function() {
};

optionsmenu.OptionsMenu.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.bind_events();
		this.update_form();
		this.options_menu.css("display","flex");
	},
	
	obscuring : function() {},
	
	revealed : function() {},
	
	exiting : function() {
		this.save_form();
		this.release_events();
		this.options_menu.hide();
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.window = $(window);
		this.options_menu = $("#options_menu");
		$("#palette_radio").buttonset();
		this.radio_palette_rb = $("#pal_rad_1");
		this.radio_palette_pt = $("#pal_rad_2");
		
		this.size_spinner = $("#size_spinner").spinner();
		this.size_spinner.spinner("option", "min", 1);
		this.size_spinner.spinner("option", "max", Math.floor( this.window.height() / (ORB_WIDTH + ORB_LINE_WIDTH/2) ) );
		
		this.speed_spinner = $("#speed_spinner").spinner();
		this.speed_spinner.spinner("option", "min", 0);

		this.vergence_slider = $("#vergence_slider").slider();
		
		this.back_button = $("#options_back_button").button();
	},

	bind_events : function() {
		$('body').on('keyup', function(event){
			if (event.keyCode === 27) {
				game.state_manager.pop_state();
			}
		});

		this.size_spinner.spinner({stop: (function(){ this.size_slider(); }).bind(this)}); 
		
		this.back_button.on("click", function(){game.state_manager.pop_state();})
	},
	
	release_events : function() {
		$('body').off('keyup');
	},
	
	size_slider : function() {
		var old_value = this.vergence_slider.slider("value");
		
		this.vergence_slider.slider("destroy");
		this.vergence_slider = $("#vergence_slider").slider();
		var max_separation = Math.floor( (this.window.width() - (ORB_WIDTH*this.size_spinner.spinner("value") + ORB_LINE_WIDTH*this.size_spinner.spinner("value")) - ORB_LINE_WIDTH*this.size_spinner.spinner("value")) / ORB_SCALE_STEP);	
		this.vergence_slider.slider({min: -max_separation, max: max_separation})
							.slider('pips', {first: 'pip', last: 'pip', step: max_separation})
							.slider('float', {formatLabel: function(val){ if (val<0) {
																		      return val*(-1);  
																		  } else {
																		      return val;
																		  } } } );

		if (old_value > max_separation) {
			old_value = max_separation;
		} else if (old_value < -max_separation) {
			old_value = -max_separation;
		}
		this.vergence_slider.slider("value", old_value);
	},
	
	update_form : function() {
		switch(PALETTE) {
			case "redblue":
				this.radio_palette_rb.prop('checked', true);
				break;
			case "purpteal":
				this.radio_palette_pt.prop('checked', true);
				break;
		}
		$("#palette_radio").buttonset("refresh");	

		this.size_spinner.spinner("value", ORB_SCALE);
		this.speed_spinner.spinner("value", Math.floor(ORB_SPEED/ORB_SPEED_STEP));
		this.vergence_slider.slider("value", Math.floor(ORB_SEPARATION/ORB_SCALE_STEP));
		this.size_slider();		
	},
	
	save_form : function() {
		switch(true) {
			case (this.radio_palette_rb.prop('checked')):
				PALETTE = "redblue";
				break;
			case (this.radio_palette_pt.prop('checked')):
				PALETTE = "purpteal";
				break;
		}
		
		ORB_SCALE = this.size_spinner.spinner("value");
		ORB_SPEED = this.speed_spinner.spinner("value")*ORB_SPEED_STEP;
		ORB_SEPARATION = this.vergence_slider.slider("value")*ORB_SCALE_STEP;
	},
};