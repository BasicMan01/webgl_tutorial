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
		'circleRadius': 2.5,
		'circleTessellation': 8,
		'circleArc': 1,
		'circleMaterialColor': '#156289',
		'circleWireframeColor': '#FFFFFF',
		'circlePositionX': 0,
		'circlePositionY': 0,
		'circlePositionZ': 0,
		'circleRotationX': 0,
		'circleRotationY': 0,
		'circleRotationZ': 0,
		'circleScaleX': 1,
		'circleScaleY': 1,
		'circleWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.circle = null;
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

		this.circle = new BABYLON.Mesh("circle", this.scene);

		var circleChild1 = new BABYLON.Mesh('circleChild1', this.scene);
		var circleChild2 = new BABYLON.Mesh('circleChild1', this.scene);

		circleChild1.material = new BABYLON.StandardMaterial("materialCircleChild1", this.scene);
		circleChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.circleMaterialColor);
		circleChild1.parent = this.circle;

		circleChild2.material = new BABYLON.StandardMaterial("materialCircleChild2", this.scene);
		circleChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.circleWireframeColor);
		circleChild2.material.wireframe = true;
		circleChild2.parent = this.circle;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateDisc({
			'radius': properties.circleRadius,
			'tessellation': properties.circleTessellation,
			'arc': properties.circleArc,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.circle.getChildren()[0], true);
		vertexData.applyToMesh(this.circle.getChildren()[1], true);
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

		var folderGeometry = this.gui.addFolder('Circle Geometry');
		folderGeometry.add(properties, 'circleWireframe').onChange(function(value) {
			self.circle.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'circleRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'circleTessellation', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'circleArc', 0.01, 1).step(0.01).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Circle Material');
		folderMaterial.addColor(properties, 'circleMaterialColor').onChange(function(value) {
			self.circle.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'circleWireframeColor').onChange(function(value) {
			self.circle.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Circle Transformation');
		folderTransformation.add(properties, 'circlePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.x = value;
		});
		folderTransformation.add(properties, 'circlePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.y = value;
		});
		folderTransformation.add(properties, 'circlePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.z = value;
		});
		folderTransformation.add(properties, 'circleRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.x = value;
		});
		folderTransformation.add(properties, 'circleRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.y = value;
		});
		folderTransformation.add(properties, 'circleRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.z = value;
		});
		folderTransformation.add(properties, 'circleScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.circle.scaling.x = value;
		});
		folderTransformation.add(properties, 'circleScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.circle.scaling.y = value;
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