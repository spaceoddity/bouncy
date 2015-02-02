var i = 0; // counter to use in loops

var TICKS = 60;

var BLACK = [0,0,0];

var utilities = {};

utilities.randInt = function (min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};