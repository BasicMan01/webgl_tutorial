/* globals dat,rdo,BABYLON */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'torusKnotRadius': 3,
		'torusKnotTube': 0.5,
		'torusKnotRadialSegments': 32,
		'torusKnotTubularSegments': 32,
		'torusKnotP': 2,
		'torusKnotQ': 3,
		'torusKnotMaterialColor': '#156289',
		'torusKnotWireframeColor': '#FFFFFF',
		'torusKnotPositionX': 0,
		'torusKnotPositionY': 0,
		'torusKnotPositionZ': 0,
		'torusKnotRotationX': 0,
		'torusKnotRotationY': 0,
		'torusKnotRotationZ': 0,
		'torusKnotScaleX': 1,
		'torusKnotScaleY': 1,
		'torusKnotScaleZ': 1,
		'torusKnotWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.torusKnot = null;
	};

	Main.prototype.init = function() {
		this.engine = new BABYLON.Engine(this.canvas, true);

		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
		this.scene.useRightHandedSystem = true;

		this.camera = new BABYLON.ArcRotateCamera('arcRotateCamera', 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
		this.camera.setPosition(new BABYLON.Vector3(0, 10, 20));
		this.camera.attachControl(this.canvas, false);
		this.camera.lowerRadiusLimit = 0.01;

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = rdo.babylonHelper.createAxesHelper(25, this.scene);
		this.gridHelper = rdo.babylonHelper.createGridHelper(50, this.scene);

		this.torusKnot = new BABYLON.Mesh("torusKnot", this.scene);

		var torusKnotChild1 = new BABYLON.Mesh('torusKnotChild1', this.scene);
		var torusKnotChild2 = new BABYLON.Mesh('torusKnotChild1', this.scene);

		torusKnotChild1.material = new BABYLON.StandardMaterial("materialTorusKnotChild1", this.scene);
		torusKnotChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.torusKnotMaterialColor);
		torusKnotChild1.parent = this.torusKnot;

		torusKnotChild2.material = new BABYLON.StandardMaterial("materialTorusKnotChild2", this.scene);
		torusKnotChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.torusKnotWireframeColor);
		torusKnotChild2.material.wireframe = true;
		torusKnotChild2.parent = this.torusKnot;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateTorusKnot({
			'radius': properties.torusKnotRadius,
			'tube': properties.torusKnotTube,
			'tubularSegments': properties.torusKnotTubularSegments,
			'radialSegments': properties.torusKnotRadialSegments,
			'p': properties.torusKnotP,
			'q': properties.torusKnotQ,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.torusKnot.getChildren()[0], true);
		vertexData.applyToMesh(this.torusKnot.getChildren()[1], true);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
			self.axesHelper.setEnabled(value);
		});

		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.setEnabled(value);
		});

		var folderGeometry = this.gui.addFolder('TorusKnot Geometry');
		folderGeometry.add(properties, 'torusKnotWireframe').onChange(function(value) {
			self.torusKnot.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'torusKnotRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotTube', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotRadialSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotTubularSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotP', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotQ', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('TorusKnot Material');
		folderMaterial.addColor(properties, 'torusKnotMaterialColor').onChange(function(value) {
			self.torusKnot.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'torusKnotWireframeColor').onChange(function(value) {
			self.torusKnot.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('TorusKnot Transformation');
		folderTransformation.add(properties, 'torusKnotPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.x = value;
		});
		folderTransformation.add(properties, 'torusKnotPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.y = value;
		});
		folderTransformation.add(properties, 'torusKnotPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.z = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.x = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.y = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.z = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scaling.x = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scaling.y = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scaling.z = value;
		});
	};

	Main.prototype.render = function() {
		var self = this;

		this.engine.runRenderLoop(function() {
			self.scene.render();
		});
	};

	Main.prototype.onResizeHandler = function(event) {
		this.engine.resize();
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));