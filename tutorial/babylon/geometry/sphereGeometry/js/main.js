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
		'sphereDiameter': 5,
		'sphereSegments': 8,
		'sphereArc': 1,
		'sphereSlice': 1,
		'sphereMaterialColor': '#156289',
		'sphereWireframeColor': '#FFFFFF',
		'spherePositionX': 0,
		'spherePositionY': 0,
		'spherePositionZ': 0,
		'sphereRotationX': 0,
		'sphereRotationY': 0,
		'sphereRotationZ': 0,
		'sphereScaleX': 1,
		'sphereScaleY': 1,
		'sphereScaleZ': 1,
		'sphereWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.sphere = null;
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

		this.sphere = new BABYLON.Mesh("sphere", this.scene);

		var sphereChild1 = new BABYLON.Mesh('sphereChild1', this.scene);
		var sphereChild2 = new BABYLON.Mesh('sphereChild1', this.scene);

		sphereChild1.material = new BABYLON.StandardMaterial("materialsphereChild1", this.scene);
		sphereChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.sphereMaterialColor);
		sphereChild1.parent = this.sphere;

		sphereChild2.material = new BABYLON.StandardMaterial("materialsphereChild2", this.scene);
		sphereChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.sphereWireframeColor);
		sphereChild2.material.wireframe = true;
		sphereChild2.parent = this.sphere;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateSphere({
			'diameter': properties.sphereDiameter,
			'segments': properties.sphereSegments,
			'arc': properties.sphereArc,
			'slice': properties.sphereSlice,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.sphere.getChildren()[0], true);
		vertexData.applyToMesh(this.sphere.getChildren()[1], true);
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

		var folderGeometry = this.gui.addFolder('Sphere Geometry');
		folderGeometry.add(properties, 'sphereWireframe').onChange(function(value) {
			self.sphere.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'sphereDiameter', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Sphere Material');
		folderMaterial.addColor(properties, 'sphereMaterialColor').onChange(function(value) {
			self.sphere.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'sphereWireframeColor').onChange(function(value) {
			self.sphere.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderGeometry.add(properties, 'sphereSegments', 1, 32).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereArc', 0.01, 1).step(0.01).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereSlice', 0.01, 1).step(0.01).onChange(function(value) {
			self.createGeometry();
		});

		var folderTransformation = this.gui.addFolder('Sphere Transformation');
		folderTransformation.add(properties, 'spherePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.x = value;
		});
		folderTransformation.add(properties, 'spherePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.y = value;
		});
		folderTransformation.add(properties, 'spherePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.z = value;
		});
		folderTransformation.add(properties, 'sphereRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.x = value;
		});
		folderTransformation.add(properties, 'sphereRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.y = value;
		});
		folderTransformation.add(properties, 'sphereRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.z = value;
		});
		folderTransformation.add(properties, 'sphereScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scaling.x = value;
		});
		folderTransformation.add(properties, 'sphereScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scaling.y = value;
		});
		folderTransformation.add(properties, 'sphereScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scaling.z = value;
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