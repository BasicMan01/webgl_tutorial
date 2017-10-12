/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axisHelperVisible': true,
		'gridHelperVisible': true,
		'dodecahedronRadius': 3,
		'dodecahedronDetail': 0,
		'dodecahedronMaterialColor': '#156289',
		'dodecahedronWireframeColor': '#FFFFFF',
		'dodecahedronPositionX': 0,
		'dodecahedronPositionY': 0,
		'dodecahedronPositionZ': 0,
		'dodecahedronRotationX': 0,
		'dodecahedronRotationY': 0,
		'dodecahedronRotationZ': 0,
		'dodecahedronScaleX': 1,
		'dodecahedronScaleY': 1,
		'dodecahedronScaleZ': 1,
		'dodecahedronWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axisHelper = null;
		this.gridHelper = null;

		this.dodecahedron = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.dodecahedron = new THREE.Object3D();
		this.scene.add(this.dodecahedron);

		this.dodecahedron.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.dodecahedronMaterialColor } )
		));

		this.dodecahedron.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.dodecahedronWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.DodecahedronGeometry(
			properties.dodecahedronRadius,
			properties.dodecahedronDetail
		);

		this.dodecahedron.children[0].geometry.dispose();
		this.dodecahedron.children[0].geometry = geometry;

		this.dodecahedron.children[1].geometry.dispose();
		this.dodecahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Dodecahedron Geometry');
		folderGeometry.add(properties, 'dodecahedronWireframe').onChange(function(value) {
			self.dodecahedron.children[0].visible = !value;
			/*
				self.dodecahedron.children[0].material.wireframe = value;
				self.dodecahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'dodecahedronRadius', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'dodecahedronDetail', 0, 5).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Dodecahedron Material');
		folderMaterial.addColor(properties, 'dodecahedronMaterialColor').onChange(function(value) {
			self.dodecahedron.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'dodecahedronWireframeColor').onChange(function(value) {
			self.dodecahedron.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Dodecahedron Transformation');
		folderTransformation.add(properties, 'dodecahedronPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.z = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.z = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.z = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getGameAreaHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getGameAreaWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getGameAreaWidth() / this.getGameAreaHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));