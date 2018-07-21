window.rdo = window.rdo || {};

window.rdo.helper = (function(window) {
	'use strict';

	var helper = {};

	helper.addOutput = function(htmlLine) {
		var output = document.getElementById('output');

		htmlLine = htmlLine.replace(/ /g, '&nbsp;');

		output.innerHTML += '<div>' + htmlLine + '</div>';
	};

	helper.cssColorToHex = function(cssColor) {
		return cssColor.replace('#', '0x');
	};

	helper.cssColorToRgb = function(cssColor) {
		var colorInt = parseInt(cssColor.replace('#', ''), 16);

		return {
			r: (colorInt >> 16) & 255,
			g: (colorInt >> 8) & 255,
			b: colorInt & 255
		};
	};

	helper.resetOutput = function() {
		document.getElementById('output').innerHTML = '';
	};

	helper.roundDecimal = function(value, decimalPlace) {
		var factor = Math.pow(10, decimalPlace);

		return Math.round(value * factor) / factor;
	};

	helper.vectorToString = function(vector) {
		var result = helper.roundDecimal(vector.x, 6).toFixed(6) + ', '
				   + helper.roundDecimal(vector.y, 6).toFixed(6) + ', '
				   + helper.roundDecimal(vector.z, 6).toFixed(6);

		return result;
	};

	return helper;
}(window));