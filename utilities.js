var i = 0;

var TICKS = 60;
var GRAY = [127,127,127];
var BLUE = [0,0,255];

var PALETTE = "redblue";  // purpteal, redblue
var PURPLE = [132,0,132];
var TEAL = [0,129,129];
var RED = [255,0,0];
var BLACK = [0,0,0];

var utilities = {};

utilities.randInt = function (min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

utilities.RGB = function (color) {
	return "rgb("+color[0]+","+color[1]+","+color[2]+")";
};