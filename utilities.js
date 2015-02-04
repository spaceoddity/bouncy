var i = 0;

var TICKS = 60;
var GRAY = [127,127,127];
var BLUE = [0,0,255];

var ORB_WIDTH = 50;
var ORB_LINE_WIDTH = 2;
var ORB_IRIS_WIDTH = 20;
var ORB_IRIS_LINE_WIDTH = 3;
var ORB_PUPIL_WIDTH = 4;
var ORB_SPEED_STEP = 20;
var ORB_SCALE_STEP = 15;

var ORB_SEPARATION = 60;
var ORB_SCALE = 7;
var ORB_SPEED = 60; //pixels per second
var PALETTE = "purpteal";  // purpteal, redblue
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