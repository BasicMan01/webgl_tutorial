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
		'torusDiameter': 5,
		'torusThickness': 1,
		'torusTessellation': 15,
		'torusMaterialColor': '#156289',
		'torusWireframeColor': '#FFFFFF',
		'torusPositionX': 0,
		'torusPositionY': 0,
		'torusPositionZ': 0,
		'torusRotationX': 0,
		'torusRotationY': 0,
		'torusRotationZ': 0,
		'torusScaleX': 1,
		'torusScaleY': 1,
		'torusScaleZ': 1,
		'torusWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.torus = null;
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

		this.torus = new BABYLON.Mesh("torus", this.scene);

		var torusChild1 = new BABYLON.Mesh('torusChild1', this.scene);
		var torusChild2 = new BABYLON.Mesh('torusChild1', this.scene);

		torusChild1.material = new BABYLON.StandardMaterial("materialTorusChild1", this.scene);
		torusChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.torusMaterialColor);
		torusChild1.parent = this.torus;

		torusChild2.material = new BABYLON.StandardMaterial("materialTorusChild2", this.scene);
		torusChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.torusWireframeColor);
		torusChild2.material.wireframe = true;
		torusChild2.parent = this.torus;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateTorus({
			'diameter': properties.torusDiameter,
			'thickness': properties.torusThickness,
			'tessellation': properties.torusTessellation,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.torus.getChildren()[0], true);
		vertexData.applyToMesh(this.torus.getChildren()[1], true);
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

		var folderGeometry = this.gui.addFolder('Torus Geometry');
		folderGeometry.add(properties, 'torusWireframe').onChange(function(value) {
			self.torus.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'torusDiameter', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusThickness', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusTessellation', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Torus Material');
		folderMaterial.addColor(properties, 'torusMaterialColor').onChange(function(value) {
			self.torus.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'torusWireframeColor').onChange(function(value) {
			self.torus.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Torus Transformation');
		folderTransformation.add(properties, 'torusPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.x = value;
		});
		folderTransformation.add(properties, 'torusPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.y = value;
		});
		folderTransformation.add(properties, 'torusPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.z = value;
		});
		folderTransformation.add(properties, 'torusRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.x = value;
		});
		folderTransformation.add(properties, 'torusRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.y = value;
		});
		folderTransformation.add(properties, 'torusRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.z = value;
		});
		folderTransformation.add(properties, 'torusScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scaling.x = value;
		});
		folderTransformation.add(properties, 'torusScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scaling.y = value;
		});
		folderTransformation.add(properties, 'torusScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scaling.z = value;
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