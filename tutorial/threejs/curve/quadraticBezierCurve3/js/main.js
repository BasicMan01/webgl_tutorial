/* globals dat,rdo,THREE */

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
		'quadraticBezier3v1X': 0,
		'quadraticBezier3v1Y': 0,
		'quadraticBezier3v1Z': 0,
		'quadraticBezier3v2X': 3,
		'quadraticBezier3v2Y': 3,
		'quadraticBezier3v2Z': 3,
		'quadraticBezier3v3X': 5,
		'quadraticBezier3v3Y': 0,
		'quadraticBezier3v3Z': 5,
		'quadraticBezier3Points': 2,
		'quadraticBezier3Color': '#FFFFFF',
		'quadraticBezier3PositionX': 0,
		'quadraticBezier3PositionY': 0,
		'quadraticBezier3PositionZ': 0,
		'quadraticBezier3RotationX': 0,
		'quadraticBezier3RotationY': 0,
		'quadraticBezier3RotationZ': 0,
		'quadraticBezier3ScaleX': 1,
		'quadraticBezier3ScaleY': 1,
		'quadraticBezier3ScaleZ': 1
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.quadraticBezier3 = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

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
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.quadraticBezier3 = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.quadraticBezier3Color } )
		);
		this.scene.add(this.quadraticBezier3);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var curve = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(properties.quadraticBezier3v1X, properties.quadraticBezier3v1Y, properties.quadraticBezier3v1Z),
			new THREE.Vector3(properties.quadraticBezier3v2X, properties.quadraticBezier3v2Y, properties.quadraticBezier3v2Z),
			new THREE.Vector3(properties.quadraticBezier3v3X, properties.quadraticBezier3v3Y, properties.quadraticBezier3v3Z)
		);

		this.quadraticBezier3.geometry.dispose();
		this.quadraticBezier3.geometry = new THREE.Geometry();
		this.quadraticBezier3.geometry.vertices = curve.getPoints(properties.quadraticBezier3Points);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Quadratic Bezier Curve');
		folderGeometry.add(properties, 'quadraticBezier3v1X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v1Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v1Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v2X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v2Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v2Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v3X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v3Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3v3Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'quadraticBezier3Points', 2, 50).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Quadratic Bezier Material');
		folderMaterial.addColor(properties, 'quadraticBezier3Color').onChange(function(value) {
			self.quadraticBezier3.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Quadratic Bezier Transformation');
		folderTransformation.add(properties, 'quadraticBezier3PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.position.x = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.position.y = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.position.z = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3RotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.quadraticBezier3.rotation.x = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3RotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.quadraticBezier3.rotation.y = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3RotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.quadraticBezier3.rotation.z = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3ScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.scale.x = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3ScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.scale.y = value;
		});
		folderTransformation.add(properties, 'quadraticBezier3ScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.quadraticBezier3.scale.z = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));