/* globals rdo */

window.rdo = window.rdo || {};

window.rdo.Vector3 = (function(window) {
	'use strict';

	var Vector3 = function(x, y, z) {
		this.x = x === undefined ? 0 : x;
		this.y = y === undefined ? 0 : y;
		this.z = z === undefined ? 0 : z;
	};

	Vector3.prototype.add = function(vector) {
		return new rdo.Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
	};

	Vector3.prototype.length = function() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
	};

	Vector3.prototype.normalize = function() {
		var l = this.length();

		return new rdo.Vector3(this.x / l, this.y / l, this.z / l);
	};

	Vector3.prototype.sub = function(vector) {
		return new rdo.Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
	};

	Vector3.prototype.toString = function(vector) {
		return 'x: ' + this.x + ', y: ' + this.y + ', z: ' + this.z;
	};

	return Vector3;
}(window));