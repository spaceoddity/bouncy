var game = {};

game.load_layers = function() {
	game.layers = {};
	game.layers.canvas = {
		canvas0 : $("#canvas0")[0],
		canvas1 : $("#canvas1")[0],
		canvas2 : $("#canvas2")[0],
	};
	game.layers.context = {
		ctx0 : game.layers.canvas.canvas0.getContext('2d'),
		ctx1 : game.layers.canvas.canvas1.getContext('2d'),
		ctx2 : game.layers.canvas.canvas2.getContext('2d'),
	};
};

game.state_manager = {
	state_stack : [],
	push_state : function(state) {
		if (this.state_stack.length > 0) {
			this.state_stack[this.state_stack.length-1].obscuring();
		}
		this.state_stack.push(game.create_state(state));
		this.state_stack[this.state_stack.length-1].entered();
	},
	pop_state : function() {
		this.state_stack[this.state_stack.length-1].exiting();		
		this.state_stack.pop();
		this.state_stack[this.state_stack.length-1].revealed();
	}
};

game.update = function () {
	game.state_manager.state_stack[game.state_manager.state_stack.length-1].update(TICKS);
};

game.draw = function () {
		requestAnimationFrame(game.draw);	
		game.state_manager.state_stack[game.state_manager.state_stack.length-1].draw();
};

game.settings = { load         : function(){ return {background : BLACK}; },

				  main_menu    : function(){ return {background : BLACK}; },
				  
				  level		   : function(){ 
									return {
										separation : 0,
										scale : 7,
										speed : 30, // pixels per second
										xyratio : [1, 1],
										rand_bounce : false,
										rotation_speed : 90, // degrees per second
									};
								 },
/*				  
				  options_menu : function(){ return {background : BLACK}; },
				  
				  calibrate_menu: function(){ return {background : BLACK}; },
				  
				  calibrate_rb : function(){ return {background : BLACK}; },
				  
				  calibrate_pt : function(){ return {background : BLACK}; },
				  
				  instructions : function(){ return {background : BLACK}; },
				  
				  level : {  settings : function(speed) {
											var BASE_PLAYER_SPEED = 150;
											var CHANGE_ENEMY = 4;
											var ENEMIESONSCREEN = 8;
											
											var enemy_speed = speed * 20 + 30; // lowest speed is 50, increases by 20
											var player_speed;
												if (BASE_PLAYER_SPEED > enemy_speed) {
													player_speed = BASE_PLAYER_SPEED;
												} else {
													player_speed = enemy_speed;
												}
											var enemy_fall_change_rate = 600/enemy_speed*CHANGE_ENEMY;
											var enemy_create_rate = ENEMIESONSCREEN / (600 / enemy_speed);
											
											return {
												enemy_speed : enemy_speed,								
												player_speed : player_speed,											    
											    enemy_fall_change_rate : enemy_fall_change_rate,							   
											    enemy_create_rate : enemy_create_rate,
												gem_speed : enemy_speed,
											    gem_create_rate : enemy_create_rate/2,
											    gem_fall_change_rate : enemy_fall_change_rate,
												 
											    blink_duration         : 1   , // seconds
											    blink_rate             : 10  , // blinks per second
												 
											    combo_initial          : 10  , // squares
											};
										},
						   palette : { REDBLUE : function(){
												return {
												 images                 : graphics.screens.hidden.rb,
												 bg_color               : storage.get("BLACKISH"),
											     menu_color             : WHITE,
												 };
												},
									   PURPTEAL : function(){
												return {
												 images                 : graphics.screens.hidden.pt,
												 bg_color               : GRAY,
												 menu_color             : BLACK,											 
												 };
												},
									 },
								
						   lens : { BOTH : function(){ return ["canvas1", "canvas2", "canvas3"]; },
						            RED  : function(){ return ["canvas1", "canvas1", "canvas3"]; },
									BLUE : function(){ return ["canvas2", "canvas2", "canvas3"]; },
						          },						  
						  
						   length : function(){ return storage.get("LENGTH");} */
};

game.create_state = function(state) {
	switch (state) {
		case "load":
			return new load.Load(game.layers, game.settings.load() );
/* 		case "main_menu":
			return new menu.MainMenu(game.layers, game.settings.main_menu() );
		case "options_menu":
			return new optionsmenu.OptionsMenu(graphics.screens.layers, game.settings.options_menu() );
		case "calibrate_menu":
			return new calibratemenu.CalibrateMenu(graphics.screens.layers, game.settings.calibrate_menu() );
		case "calibrate_rb":
			return new calibraterb.CalibrateRB(graphics.screens.layers, game.settings.calibrate_rb() );
		case "calibrate_pt":
			return new calibratept.CalibratePT(graphics.screens.layers, game.settings.calibrate_pt() ); */
		case "level":
			return new level.Level(game.layers, game.settings.level() );
/* 		case "pause":
			return new pause.Pause(graphics.screens.layers);
		case "end":
			return new end.End(graphics.screens.layers);
		case "instructions":
			return new instructions.Instructions(graphics.screens.layers, game.settings.instructions() ); */
	}
};

game.start = function () {
	game.load_layers();
	game.state_manager.push_state("load");
	setInterval(game.update, 1000.0 / TICKS);
	requestAnimationFrame(game.draw);	
};