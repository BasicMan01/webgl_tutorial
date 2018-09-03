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
		'planeWidth': 5,
		'planeHeight': 5,
		'planeMaterialColor': '#156289',
		'planeWireframeColor': '#FFFFFF',
		'planePositionX': 0,
		'planePositionY': 0,
		'planePositionZ': 0,
		'planeRotationX': 0,
		'planeRotationY': 0,
		'planeRotationZ': 0,
		'planeScaleX': 1,
		'planeScaleY': 1,
		'planeWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.plane = null;
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

		this.plane = new BABYLON.Mesh("plane", this.scene);

		var planeChild1 = new BABYLON.Mesh('planeChild1', this.scene);
		var planeChild2 = new BABYLON.Mesh('planeChild2', this.scene);

		planeChild1.material = new BABYLON.StandardMaterial("materialPlaneChild1", this.scene);
		planeChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.planeMaterialColor);
		planeChild1.parent = this.plane;

		planeChild2.material = new BABYLON.StandardMaterial("materialPlaneChild2", this.scene);
		planeChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.planeWireframeColor);
		planeChild2.material.wireframe = true;
		planeChild2.parent = this.plane;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreatePlane({
			'height': properties.planeHeight,
			'width': properties.planeWidth,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.plane.getChildren()[0], true);
		vertexData.applyToMesh(this.plane.getChildren()[1], true);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.setEnabled(value);
		});

		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.setEnabled(value);
		});

		var folderGeometry = this.gui.addFolder('Plane Geometry');
		folderGeometry.add(properties, 'planeWireframe').onChange(function(value) {
			self.plane.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'planeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Plane Material');
		folderMaterial.addColor(properties, 'planeMaterialColor').onChange(function(value) {
			self.plane.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'planeWireframeColor').onChange(function(value) {
			self.plane.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Plane Transformation');
		folderTransformation.add(properties, 'planePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.x = value;
		});
		folderTransformation.add(properties, 'planePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.y = value;
		});
		folderTransformation.add(properties, 'planePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.z = value;
		});
		folderTransformation.add(properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.x = value;
		});
		folderTransformation.add(properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.y = value;
		});
		folderTransformation.add(properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.z = value;
		});
		folderTransformation.add(properties, 'planeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scaling.x = value;
		});
		folderTransformation.add(properties, 'planeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scaling.y = value;
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