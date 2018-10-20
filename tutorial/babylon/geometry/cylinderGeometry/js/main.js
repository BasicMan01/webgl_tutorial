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
		'cylinderDiameterTop': 6,
		'cylinderDiameterBottom': 6,
		'cylinderHeight': 5,
		'cylinderTessellation': 8,
		'cylinderSubdivisions': 1,
		'cylinderArc': 1,
		'cylinderEnclose': false,
		'cylinderMaterialColor': '#156289',
		'cylinderWireframeColor': '#FFFFFF',
		'cylinderPositionX': 0,
		'cylinderPositionY': 0,
		'cylinderPositionZ': 0,
		'cylinderRotationX': 0,
		'cylinderRotationY': 0,
		'cylinderRotationZ': 0,
		'cylinderScaleX': 1,
		'cylinderScaleY': 1,
		'cylinderScaleZ': 1,
		'cylinderWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cylinder = null;
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

		this.cylinder = new BABYLON.Mesh('cylinder', this.scene);

		var cylinderChild1 = new BABYLON.Mesh('cylinderChild1', this.scene);
		var cylinderChild2 = new BABYLON.Mesh('cylinderChild1', this.scene);

		cylinderChild1.material = new BABYLON.StandardMaterial('materialCylinderChild1', this.scene);
		cylinderChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.cylinderMaterialColor);
		cylinderChild1.parent = this.cylinder;

		cylinderChild2.material = new BABYLON.StandardMaterial('materialCylinderChild2', this.scene);
		cylinderChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.cylinderWireframeColor);
		cylinderChild2.material.wireframe = true;
		cylinderChild2.parent = this.cylinder;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateCylinder({
			'diameterTop': properties.cylinderDiameterTop,
			'diameterBottom': properties.cylinderDiameterBottom,
			'height': properties.cylinderHeight,
			'tessellation': properties.cylinderTessellation,
			'subdivisions': properties.cylinderSubdivisions,
			'arc': properties.cylinderArc,
			'enclose': properties.cylinderEnclose,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.cylinder.getChildren()[0], true);
		vertexData.applyToMesh(this.cylinder.getChildren()[1], true);
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

		var folderGeometry = this.gui.addFolder('Cylinder Geometry');
		folderGeometry.add(properties, 'cylinderWireframe').onChange(function(value) {
			self.cylinder.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'cylinderEnclose').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderDiameterTop', 0.1, 20).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderDiameterBottom', 0.1, 20).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderTessellation', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderSubdivisions', 1, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderArc', 0.01, 1).step(0.01).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cylinder Material');
		folderMaterial.addColor(properties, 'cylinderMaterialColor').onChange(function(value) {
			self.cylinder.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'cylinderWireframeColor').onChange(function(value) {
			self.cylinder.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Cylinder Transformation');
		folderTransformation.add(properties, 'cylinderPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.x = value;
		});
		folderTransformation.add(properties, 'cylinderPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.y = value;
		});
		folderTransformation.add(properties, 'cylinderPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.z = value;
		});
		folderTransformation.add(properties, 'cylinderRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.x = value;
		});
		folderTransformation.add(properties, 'cylinderRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.y = value;
		});
		folderTransformation.add(properties, 'cylinderRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.z = value;
		});
		folderTransformation.add(properties, 'cylinderScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scaling.x = value;
		});
		folderTransformation.add(properties, 'cylinderScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scaling.y = value;
		});
		folderTransformation.add(properties, 'cylinderScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scaling.z = value;
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