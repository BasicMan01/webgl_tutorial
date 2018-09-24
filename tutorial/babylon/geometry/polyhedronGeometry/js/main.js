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
		'polyhedronType': 'Tetrahedron',
		'polyhedronSizeX': 3,
		'polyhedronSizeY': 3,
		'polyhedronSizeZ': 3,
		'polyhedronMaterialColor': '#156289',
		'polyhedronWireframeColor': '#FFFFFF',
		'polyhedronPositionX': 0,
		'polyhedronPositionY': 0,
		'polyhedronPositionZ': 0,
		'polyhedronRotationX': 0,
		'polyhedronRotationY': 0,
		'polyhedronRotationZ': 0,
		'polyhedronScaleX': 1,
		'polyhedronScaleY': 1,
		'polyhedronScaleZ': 1,
		'polyhedronWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.polyhedron = null;
		this.polyhedronContainer = {
			'Tetrahedron': 0,
			'Octahedron': 1,
			'Dodecahedron': 2,
			'Icosahedron': 3,
			'Rhombicuboctahedron': 4,
			'Triangular Prism': 5,
			'Pentagonal Prism': 6,
			'Hexagonal Prism': 7,
			'Square Pyramid (J1)': 8,
			'Pentagonal Pyramid (J2)': 9,
			'Triangular Dipyramid (J12)': 10,
			'Pentagonal Dipyramid (J13)': 11,
			'Elongated Square_dipyramid (J15)': 12,
			'Elongated Pentagonal Dipyramid (J16)': 13,
			'Elongated Pentagonal Cupola (J20)': 14
		};
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

		this.polyhedron = new BABYLON.Mesh("polyhedron", this.scene);

		var polyhedronChild1 = new BABYLON.Mesh('polyhedronChild1', this.scene);
		var polyhedronChild2 = new BABYLON.Mesh('polyhedronChild2', this.scene);

		polyhedronChild1.material = new BABYLON.StandardMaterial("materialPolyhedronChild1", this.scene);
		polyhedronChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.polyhedronMaterialColor);
		polyhedronChild1.parent = this.polyhedron;

		polyhedronChild2.material = new BABYLON.StandardMaterial("materialPolyhedronChild2", this.scene);
		polyhedronChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(properties.polyhedronWireframeColor);
		polyhedronChild2.material.wireframe = true;
		polyhedronChild2.parent = this.polyhedron;

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreatePolyhedron({
			'sizeX': properties.polyhedronSizeX,
			'sizeY': properties.polyhedronSizeY,
			'sizeZ': properties.polyhedronSizeZ,
			'flat': true,
			'type': this.polyhedronContainer[properties.polyhedronType],
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this.polyhedron.getChildren()[0], true);
		vertexData.applyToMesh(this.polyhedron.getChildren()[1], true);
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
		
		Object.keys(this.polyhedronContainer)
		this.gui.add(properties, 'polyhedronType', Object.keys(this.polyhedronContainer)).onChange(function(value) {
			self.createGeometry();
		});

		var folderGeometry = this.gui.addFolder('Polyhedron Geometry');
		folderGeometry.add(properties, 'polyhedronWireframe').onChange(function(value) {
			self.polyhedron.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(properties, 'polyhedronSizeX', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'polyhedronSizeY', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'polyhedronSizeZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Polyhedron Material');
		folderMaterial.addColor(properties, 'polyhedronMaterialColor').onChange(function(value) {
			self.polyhedron.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(properties, 'polyhedronWireframeColor').onChange(function(value) {
			self.polyhedron.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		var folderTransformation = this.gui.addFolder('Polyhedron Transformation');
		folderTransformation.add(properties, 'polyhedronPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.polyhedron.position.x = value;
		});
		folderTransformation.add(properties, 'polyhedronPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.polyhedron.position.y = value;
		});
		folderTransformation.add(properties, 'polyhedronPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.polyhedron.position.z = value;
		});
		folderTransformation.add(properties, 'polyhedronRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.polyhedron.rotation.x = value;
		});
		folderTransformation.add(properties, 'polyhedronRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.polyhedron.rotation.y = value;
		});
		folderTransformation.add(properties, 'polyhedronRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.polyhedron.rotation.z = value;
		});
		folderTransformation.add(properties, 'polyhedronScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.polyhedron.scaling.x = value;
		});
		folderTransformation.add(properties, 'polyhedronScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.polyhedron.scaling.y = value;
		});
		folderTransformation.add(properties, 'polyhedronScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.polyhedron.scaling.z = value;
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