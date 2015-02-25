var game_manager = {
	scene_stack : [],
	scenes : {},
	ticks : undefined,
	
	start : function(scene, ticks){	
		//callback?
		this.ticks = ticks;
		this.push_scene(scene);
		setInterval(this.update.bind(this), 1000.0/this.ticks);
		requestAnimationFrame(this.draw.bind(this));
	},

	push_scene : function(scene){
		if (this.scene_stack.length > 0) {
			this.scene_stack[this.scene_stack.length-1].obscuring();
		}
		this.scene_stack.push(this.scenes[scene]);
		this.scene_stack[this.scene_stack.length-1].init();		
		this.scene_stack[this.scene_stack.length-1].entered();
	},

	pop_scene : function(){
		this.scene_stack[this.scene_stack.length-1].exiting();		
		this.scene_stack.pop();
		this.scene_stack[this.scene_stack.length-1].revealed();	
	},
	
	change_scene : function(){},
	
	new_scene : function(name){	
		this.scenes[name] = Object.create(this._BasicScene).base_init(name);
		return this.scenes[name];
	},
	
	draw : function(){
		requestAnimationFrame(this.draw.bind(this));	
		this.scene_stack[this.scene_stack.length-1].draw();		
	},
	
	update : function(){
		this.scene_stack[this.scene_stack.length-1].update(this.ticks);
	},
	
	_BasicScene : {
		base_init : function(name){
			this.name = name;
			return this;
		},
		init : function(){},
		entered : function(){},
		obscuring : function(){},
		revealed : function(){},
		exiting : function(){},
		update : function(){},
		draw : function(){},		
	},

};