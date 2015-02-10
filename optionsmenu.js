var optionsmenu = {};

optionsmenu.OptionsMenu = function() {
};

optionsmenu.OptionsMenu.prototype = {
	
	entered : function() {
		this.get_html_elements();
		this.orb = new optionsmenu.Orb((this.window.width())/2, (this.window.height())/2);		
		this.show();		
		this.bind_events();
		this.update_form();
		this.expand();
		this.update_background();
		this.update_blendmode();
	},

	show : function() {
		this.options_menu.css("display","flex");	
	},
	
	obscuring : function() {},
	
	revealed : function() {},
	
	exiting : function() {
		this.save_form();
		this.release_events();
		this.options_menu.hide();
	},
		
	update : function() {
		var bounce;
		switch(true) {
			case (this.radio_bounce_norm.prop('checked')):
				bounce = ORB_BOUNCE_VALUES.NORMAL;
				break;
			case (this.radio_bounce_horz.prop('checked')):
				bounce = ORB_BOUNCE_VALUES.HORIZONTAL;
				break;
			case (this.radio_bounce_vert.prop('checked')):
				bounce = ORB_BOUNCE_VALUES.VERTICAL;
				break;
		}		
		
		var separation = this.vergence_slider.slider("value")*ORB_SCALE_STEP;
		var speed = this.speed_spinner.spinner("value")*ORB_SPEED_STEP;
		var scale = this.size_spinner.spinner("value");
		
		this.orb.update(this.canvas, speed, bounce, separation, scale);
	},
		
	draw : function() {
		var width = this.canvas.width;
		var height = this.canvas.height;
		
		var color1;
		var color2;
		switch(true) {
			case (this.radio_palette_rb.prop('checked')):
				color1 = utilities.RGB(RED);
				color2 = utilities.RGB(BLUE);
				break;
			case (this.radio_palette_pt.prop('checked')):
				color1 = utilities.RGB(PURPLE);
				color2 = utilities.RGB(TEAL);
				break;
			case (this.radio_palette_rg.prop('checked')):
				color1 = utilities.RGB(RED2);
				color2 = utilities.RGB(GREEN);
		}		
		
		//clear
		this.context.clearRect(0,0,width,height);
		
		//draw orb
		this.orb.draw(this.context, color1, color2);
	},

	expand : function() {
		this.options_menu.width(this.window.width());
		this.options_menu.height(this.window.height());
		this.canvas.width = this.window.width();
		this.canvas.height = this.window.height();
	},
	
	update_background : function() {
		var bg_color;
		switch(true) {
			case (this.radio_palette_rb.prop('checked')):
				bg_color = BLACK;
				break;
			case (this.radio_palette_pt.prop('checked')):
				bg_color = GRAY;
				break;
			case (this.radio_palette_rg.prop('checked')):
				bg_color = ORANGE;
				break;
		}
		this.options_menu.css("background", utilities.RGB(bg_color));
	},
	
	update_blendmode : function() {
		var blend;
		switch(true) {
			case (this.radio_palette_rb.prop('checked')):
				blend = "screen";
				break;
			case (this.radio_palette_pt.prop('checked') || this.radio_palette_rg.prop('checked')):
				blend = "multiply";
				break;
		}
		this.context.globalCompositeOperation = blend;		
	},
	
	get_html_elements : function() {
		this.window = $(window);
		this.body = $('body');
		this.options_menu = $("#options_menu");
		this.canvas = $("#options_canvas")[0];
		this.context = this.canvas.getContext('2d');
		
		$("#palette_radio").buttonset();
		this.radio_palette_rb = $("#pal_rad_1");
		this.radio_palette_pt = $("#pal_rad_2");
		this.radio_palette_rg = $("#pal_rad_3");
		
		$("#bounce_radio").buttonset();
		this.radio_bounce_norm = $("#bounce_rad_1");
		this.radio_bounce_horz = $("#bounce_rad_2");
		this.radio_bounce_vert = $("#bounce_rad_3");
		
		this.time_spinner = $("#time_spinner").minute_spinner();
		this.time_spinner.minute_spinner("option", "min", 1);
		
		this.size_spinner = $("#size_spinner").spinner();
		this.size_spinner.spinner("option", "min", 1);
		this.size_spinner.spinner("option", "max", Math.floor( this.window.height() / (ORB_WIDTH + ORB_LINE_WIDTH/2) ) );
		
		this.speed_spinner = $("#speed_spinner").spinner();
		this.speed_spinner.spinner("option", "min", 0);

		this.vergence_slider = $("#vergence_slider").slider();
		
		this.back_button = $("#options_back_button").button();
	},

	bind_events : function() {
		this.body.on('keyup', function(event){
			if (event.keyCode === 27) {
				game.state_manager.pop_state();
			}
		});
		
		this.vergence_slider.on("slidestop", (function(){
											this.orb.center_x = this.window.width()/2;
											this.orb.center_y = this.window.height()/2;
													}).bind(this)); 
		this.size_spinner.spinner({stop: (function(){
											this.size_slider();
											this.orb.center_x = this.window.width()/2;
											this.orb.center_y = this.window.height()/2;
													}).bind(this)}); 
		this.radio_palette_rb.on("click", (function(){
											this.update_background();
											this.update_blendmode();		 
													 }).bind(this));
		this.radio_palette_pt.on("click", (function(){
											this.update_background();
											this.update_blendmode();
													 }).bind(this));
		this.radio_palette_rg.on("click", (function(){
											this.update_background();
											this.update_blendmode();
													 }).bind(this));
		this.back_button.on("click", function(){game.state_manager.pop_state();});
	},
	
	release_events : function() {
		this.body.off('keyup');
		this.radio_palette_rb.off("click");
		this.radio_palette_pt.off("click");
		this.radio_palette_rg.off("click");
		this.back_button.off("click");		
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
			case "redgreen":
				this.radio_palette_rg.prop('checked', true);
		}
		$("#palette_radio").buttonset("refresh");	

		switch(ORB_BOUNCE) {
			case ORB_BOUNCE_VALUES.NORMAL:
				this.radio_bounce_norm.prop('checked', true);
				break;
			case ORB_BOUNCE_VALUES.HORIZONTAL:
				this.radio_bounce_horz.prop('checked', true);
				break;
			case ORB_BOUNCE_VALUES.VERTICAL:
				this.radio_bounce_vert.prop('checked', true);
				break;
		}
		$("#bounce_radio").buttonset("refresh");
		
		this.time_spinner.minute_spinner("value", GAME_LENGTH);
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
			case (this.radio_palette_rg.prop('checked')):
				PALETTE = "redgreen";
				break;
		}
		
		switch(true) {
			case (this.radio_bounce_norm.prop('checked')):
				ORB_BOUNCE = ORB_BOUNCE_VALUES.NORMAL;
				break;
			case (this.radio_bounce_horz.prop('checked')):
				ORB_BOUNCE = ORB_BOUNCE_VALUES.HORIZONTAL;
				break;
			case (this.radio_bounce_vert.prop('checked')):
				ORB_BOUNCE = ORB_BOUNCE_VALUES.VERTICAL;
				break;
		}
		
		ORB_SCALE = this.size_spinner.spinner("value");
		ORB_SPEED = this.speed_spinner.spinner("value")*ORB_SPEED_STEP;
		GAME_LENGTH = this.time_spinner.minute_spinner("value");
		ORB_SEPARATION = this.vergence_slider.slider("value")*ORB_SCALE_STEP;
	},
};

optionsmenu.Orb = function(center_x, center_y){
	this.center_x = center_x;
	this.center_y = center_y;
	
	this.rotation_counter = 0;
	this.x_dir = 1;
	this.y_dir = 1;
};

optionsmenu.Orb.prototype = {	
	draw : function(ctx, color1, color2){

		ctx.strokeStyle = color1;
		ctx.fillStyle = color1;
		var numberOfSides = 6;
		var rot = this.rotation_counter * Math.PI/180;
		
		//outer 1
		ctx.beginPath();
		ctx.moveTo((this.center_x + this.separation/2) + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i < numberOfSides;i += 1) {
			ctx.lineTo ((this.center_x + this.separation/2) + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		ctx.closePath();
		
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();				  	  

		//-------------------------------------------

		ctx.strokeStyle = color2;
		ctx.fillStyle = color2;

		//outer 2
		ctx.beginPath();
		ctx.moveTo((this.center_x - this.separation/2) + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i < numberOfSides;i += 1) {
			ctx.lineTo ((this.center_x - this.separation/2) + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		ctx.closePath();
		
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();
	},

	bounce : function(axis) {
		if (axis === "x") {
			this.x_dir = this.x_dir * (-1);
		} else if (axis === "y") {
			this.y_dir = this.y_dir * (-1);
		}
	},
	
	update : function(canvas, speed, bounce, separation, scale) {
		this.speed_x = speed*bounce[0] * this.x_dir;
		this.speed_y = speed*bounce[1] * this.y_dir;
		this.separation = separation;
		this.outer_width = scale * ORB_WIDTH;
		this.outer_line_width = scale * ORB_LINE_WIDTH;
		
		this.check_bounds(canvas);
		
		this.rotation_counter += ORB_ROTATION_SPEED/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		this.move();
	},
	
	check_bounds : function(canvas) {
		var radius = ((this.outer_width/2)+this.outer_line_width/2);
		if (this.center_x + this.speed_x/TICKS + radius + this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS + radius - this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS - radius - this.separation/2  <= 0 ||
			this.center_x + this.speed_x/TICKS - radius + this.separation/2  <= 0){
				this.bounce("x");
		}
		if (this.center_y + this.speed_y/TICKS + radius >= canvas.height || this.center_y + this.speed_y/TICKS - radius <= 0) {
			this.bounce("y");
		}	
	},
	
	move : function() {
		this.center_x += this.speed_x/TICKS;
		this.center_y += this.speed_y/TICKS;
	},
};