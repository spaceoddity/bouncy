var calibratemenu = {};

calibratemenu.CalibrateMenu = function() {
};

calibratemenu.CalibrateMenu.prototype = {
	
	entered : function() {
		this.get_html_elements();
		
		//create dialog object
		this.dialog = new calibratemenu.CalibrateDialog();
		
		this.bind_events();
		this.calibrate_menu.show();
	},
	
	obscuring : function() {
		this.calibrate_menu.hide();
		this.release_events();
	},
	
	revealed : function() {
		this.calibrate_menu.show();
		this.bind_events();
	},
	
	exiting : function() {
		this.calibrate_menu.hide();
		this.release_events();		
	},
		
	update : function(ticks) {},
		
	draw : function() {},
	
	get_html_elements : function() {
		this.body = $('body');
		this.calibrate_menu = $("#calibrate_menu");
		this.rb_button = $("#cal_rb_button").button();
		this.pt_button = $("#cal_pt_button").button();
		this.rg_button = $("#cal_rg_button").button();
	},

	bind_events : function() {
		this.body.on('keyup', function(event){
			if (event.keyCode === 27) {
				game.state_manager.pop_state();
			}
		});
		this.rb_button.on('click', (function(){
			this.dialog.set_state("rb");
			this.dialog.step_one();
		}).bind(this));
		this.pt_button.on('click', (function(){
			this.dialog.set_state("pt");
			this.dialog.step_one();
		}).bind(this));
		this.rg_button.on('click', (function(){
			this.dialog.set_state("rg");
			this.dialog.step_one();
		}).bind(this));
	},
	
	release_events : function() {
		this.body.off('keyup');
		this.rb_button.off('click');
		this.pt_button.off('click');
		this.rg_button.off('click');
	},
	
};

calibratemenu.CalibrateDialog = function() {	
	//get html elements
	this.dialog = $("#cal_dialog").dialog({
		modal : true,
		resizable : false,
		autoOpen : false,
		height : "auto",
		width : "auto"
	});
	this.span = $("#calib_span");
	this.slider = $("#calib_slider").slider();
	this.button = $("#cal_button").button();
	this.canvas = $("#cal_canvas")[0];
	this.context = this.canvas.getContext('2d');
	
	//variables used
	this.slider1_result = undefined;
};

calibratemenu.CalibrateDialog.prototype = {
	set_state : function(colors) {
		//dialog settings for different palettes
		var states = {
			rb : {
				step1 : {
					minmax : function(){return [0,127];},
					start : function(){return 127;},
					bg : function(){return BLUE;},
					color : function(result){return [result,result,result];},
				},
				step2 : {
					minmax : function(){return [0,255];},
					start : function(){return 255;},
					bg : function(color1){return color1;},
					color : function(result){return [result,0,0];},
					save : function(color1, color2){BLACK=color1; RED=color2;},					
				},
			},
			pt : {
				step1 : {
					minmax : function(){return [0,255];},
					start : function(){return 255;},
					bg : function(){return GRAY;},
					color : function(result){return [result,0,result];},
				},
				step2 : {
					minmax : function(){return [0,255];},
					start : function(){return 255;},
					bg : function(){return GRAY;},
					color : function(result){return [0,result,result];},
					save : function(color1, color2){PURPLE = color1; TEAL=color2;},
				},
			},
			rg : {
			},
		};
	
		//set the state depending on which palette was chosen
		this.state = states[colors];		
	},
	
	step_one : function() {
		this.span.html("&nbsp;RED&nbsp;");
		this.span.css("background","rgb(255,0,0)");

		this.slider.slider("option", {
			"min" : this.state.step1.minmax()[0],
			"max" : this.state.step1.minmax()[1],
			"value" : this.state.step1.start(),
		});	
		this.slider.off("slide");
		this.slider.on("slide", (function(){
			this.draw( utilities.RGB(this.state.step1.bg()), utilities.RGB(this.state.step1.color(this.slider.slider("value"))));
		}).bind(this));
		this.slider.trigger("slide");
	
		this.button.off("click");
		this.button.button("option", "label", "Next");
		this.button.on("click", (function(){
			this.step1_result = this.state.step1.color(this.slider.slider("value"));
			this.step_two();
		}).bind(this));
		
		this.dialog.dialog("open");
	},
	
	step_two : function() {
		this.span.html("&nbsp;GREEN/BLUE&nbsp;");
		this.span.css("background","rgb(0,0,255)");
	
		this.slider.slider("option", {
			"min" : this.state.step2.minmax()[0],
			"max" : this.state.step2.minmax()[1],
			"value" : this.state.step2.start(),
		});
		this.slider.off("slide");
		this.slider.on("slide", (function(){
			this.draw(utilities.RGB(this.state.step2.bg(this.step1_result)), utilities.RGB(this.state.step2.color(this.slider.slider("value"))));
		}).bind(this));
		this.slider.trigger("slide");
		
		this.button.off("click");
		this.button.button("option", "label", "Save");
		this.button.blur();
		this.button.on("click", (function(){
			step2_result = this.state.step2.color(this.slider.slider("value"));
			this.state.step2.save(this.step1_result, step2_result);
			this.dialog.dialog("close");
		}).bind(this));	
	},

	draw : function(bg,fg) {
		var ctx = this.context;
		var canvas = this.canvas;
		
		//ctx.clearRect(0,0, canvas.width, canvas.height);
		
		ctx.fillStyle = bg;
		ctx.fillRect(0,0, canvas.width, canvas.height);		
		
		ctx.strokeStyle = fg;		
		ctx.beginPath();		
		ctx.lineWidth = "4";		
		ctx.rect(35,20,30,30);
		ctx.rect(335,20,30,30);		
		ctx.stroke();		
		
		ctx.beginPath();
		ctx.lineWidth = "6";	
		ctx.rect(95,20,30,30);
		ctx.rect(275,20,30,30);
		ctx.stroke();	

		ctx.beginPath();		
		ctx.lineWidth = "8";		
		ctx.rect(155,20,30,30);	
		ctx.rect(215,20,30,30);		
		ctx.stroke();		
	},
};