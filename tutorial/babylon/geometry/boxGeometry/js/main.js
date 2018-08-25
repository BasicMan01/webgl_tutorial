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
		'cubeWidth': 5,
		'cubeHeight': 5,
		'cubeDepth': 5,
		'cubeMaterialColor': '#156289',
		'cubeWireframeColor': '#FFFFFF',
		'cubePositionX': 0,
		'cubePositionY': 0,
		'cubePositionZ': 0,
		'cubeRotationX': 0,
		'cubeRotationY': 0,
		'cubeRotationZ': 0,
		'cubeScaleX': 1,
		'cubeScaleY': 1,
		'cubeScaleZ': 1,
		'cubeWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cube = null;
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

		this.cube = new BABYLON.Mesh("cube", this.scene);

		var cubeChild1 = new BABYLON.Mesh('cubeChild1', this.scene);
		var cubeChild2 = new BABYLON.Mesh('cubeChild2', this.scene);

		cubeChild1.material = new BABYLON.StandardMaterial("materialCubeChild1", this.scene);
		cubeChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.cubeMaterialColor);
		cubeChild1.parent = this.cube;

		cubeChild2.material = new BABYLON.StandardMaterial("materialCubeChild2", this.scene);
		cubeChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.cubeWireframeColor);
		cubeChild2.material.wireframe = true;
		cubeChild2.parent = this.cube;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateBox({
			'depth': properties.cubeDepth,
			'height': properties.cubeHeight,
			'width': properties.cubeWidth,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.cube.getChildren()[0], true);
		vertexData.applyToMesh(this.cube.getChildren()[1], true);
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

		var folderGeometry = this.gui.addFolder('Cube Geometry');
		folderGeometry.add(properties, 'cubeWireframe').onChange(function(value) {
			self.cube.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'cubeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeDepth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cube Material');
		folderMaterial.addColor(properties, 'cubeMaterialColor').onChange(function(value) {
			self.cube.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'cubeWireframeColor').onChange(function(value) {
			self.cube.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Cube Transformation');
		folderTransformation.add(properties, 'cubePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.x = value;
		});
		folderTransformation.add(properties, 'cubePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.y = value;
		});
		folderTransformation.add(properties, 'cubePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.z = value;
		});
		folderTransformation.add(properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.x = value;
		});
		folderTransformation.add(properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.y = value;
		});
		folderTransformation.add(properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.z = value;
		});
		folderTransformation.add(properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scaling.x = value;
		});
		folderTransformation.add(properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scaling.y = value;
		});
		folderTransformation.add(properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scaling.z = value;
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