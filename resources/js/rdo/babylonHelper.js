/* globals BABYLON */

window.rdo = window.rdo || {};

window.rdo.babylonHelper = (function(window) {
	'use strict';

	var helper = {};

	helper.createAxesHelper = function(size, scene) {
		var axesMesh = new BABYLON.Mesh("axesHelper", scene);

		var axesX = BABYLON.Mesh.CreateLines("axesX", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(size, 0, 0)
		], scene);

		var axesY = BABYLON.Mesh.CreateLines("axesY", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(0, size, 0)
		], scene);

		var axesZ = BABYLON.Mesh.CreateLines("axesZ", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(0, 0, size)
		], scene);

		axesX.color = new BABYLON.Color3(1, 0, 0);
		axesY.color = new BABYLON.Color3(0, 1, 0);
		axesZ.color = new BABYLON.Color3(0, 0, 1);

		axesX.parent = axesMesh;
		axesY.parent = axesMesh;
		axesZ.parent = axesMesh;

		return axesMesh;
	};

	helper.createGridHelper = function(size, scene) {
		var gridMesh = new BABYLON.Mesh("gridHelper", scene);

		var start =  size / -2;
		var end = start + size;
		var color = new BABYLON.Color3.FromInts(112, 112, 112);

		for (var i = start; i <= end; ++i) {
			var lineX = BABYLON.Mesh.CreateLines('gridHelperLine', [
				new BABYLON.Vector3(start, 0, i),
				new BABYLON.Vector3(end, 0, i)
			], scene);

			var lineZ = BABYLON.Mesh.CreateLines('gridHelperLine', [
				new BABYLON.Vector3(i, 0, start),
				new BABYLON.Vector3(i, 0, end)
			], scene);

			lineX.color = color;
			lineZ.color = color;

			lineX.parent = gridMesh;
			lineZ.parent = gridMesh;
		}

		return gridMesh;
	};

	return helper;
}(window));