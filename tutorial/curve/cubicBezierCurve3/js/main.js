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
		'cubicBezier3v1X': 0,
		'cubicBezier3v1Y': 0,
		'cubicBezier3v1Z': 0,
		'cubicBezier3v2X': 3,
		'cubicBezier3v2Y': 3,
		'cubicBezier3v2Z': 3,
		'cubicBezier3v3X': 6,
		'cubicBezier3v3Y': 3,
		'cubicBezier3v3Z': 6,
		'cubicBezier3v4X': 9,
		'cubicBezier3v4Y': 0,
		'cubicBezier3v4Z': 9,
		'cubicBezier3Points': 3,
		'cubicBezier3Color': '#FFFFFF',
		'cubicBezier3PositionX': 0,
		'cubicBezier3PositionY': 0,
		'cubicBezier3PositionZ': 0,
		'cubicBezier3RotationX': 0,
		'cubicBezier3RotationY': 0,
		'cubicBezier3RotationZ': 0,
		'cubicBezier3ScaleX': 1,
		'cubicBezier3ScaleY': 1,
		'cubicBezier3ScaleZ': 1
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

		this.cubicBezier3 = null;
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
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.cubicBezier3 = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.cubicBezier3Color } )
		);
		this.scene.add(this.cubicBezier3);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var curve = new THREE.CubicBezierCurve3(
			new THREE.Vector3(properties.cubicBezier3v1X, properties.cubicBezier3v1Y, properties.cubicBezier3v1Z),
			new THREE.Vector3(properties.cubicBezier3v2X, properties.cubicBezier3v2Y, properties.cubicBezier3v2Z),
			new THREE.Vector3(properties.cubicBezier3v3X, properties.cubicBezier3v3Y, properties.cubicBezier3v3Z),
			new THREE.Vector3(properties.cubicBezier3v4X, properties.cubicBezier3v4Y, properties.cubicBezier3v4Z)
		);

		this.cubicBezier3.geometry.dispose();
		this.cubicBezier3.geometry = new THREE.Geometry();
		this.cubicBezier3.geometry.vertices = curve.getPoints(properties.cubicBezier3Points);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Cubic Bezier Curve');
		folderGeometry.add(properties, 'cubicBezier3v1X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v1Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v1Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v2X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v2Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v2Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v3X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v3Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v3Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v4X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v4Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3v4Z', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubicBezier3Points', 3, 50).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cubic Bezier Material');
		folderMaterial.addColor(properties, 'cubicBezier3Color').onChange(function(value) {
			self.cubicBezier3.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Cubic Bezier Transformation');
		folderTransformation.add(properties, 'cubicBezier3PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.position.x = value;
		});
		folderTransformation.add(properties, 'cubicBezier3PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.position.y = value;
		});
		folderTransformation.add(properties, 'cubicBezier3PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.position.z = value;
		});
		folderTransformation.add(properties, 'cubicBezier3RotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cubicBezier3.rotation.x = value;
		});
		folderTransformation.add(properties, 'cubicBezier3RotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cubicBezier3.rotation.y = value;
		});
		folderTransformation.add(properties, 'cubicBezier3RotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cubicBezier3.rotation.z = value;
		});
		folderTransformation.add(properties, 'cubicBezier3ScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.scale.x = value;
		});
		folderTransformation.add(properties, 'cubicBezier3ScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.scale.y = value;
		});
		folderTransformation.add(properties, 'cubicBezier3ScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cubicBezier3.scale.z = value;
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