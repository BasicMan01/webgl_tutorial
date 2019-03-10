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
		'ellipseCurveCenterX': 0,
		'ellipseCurveCenterY': 0,
		'ellipseCurveRadiusX': 5,
		'ellipseCurveRadiusY': 5,
		'ellipseCurveStartAngle': 0,
		'ellipseCurveEndAngle': 2 * Math.PI,
		'ellipseCurveClockwise': false,
		'ellipseCurveRotation': 0,
		'ellipseCurvePoints': 25,
		'ellipseCurveColor': '#FFFFFF',
		'ellipseCurvePositionX': 0,
		'ellipseCurvePositionY': 0,
		'ellipseCurvePositionZ': 0,
		'ellipseCurveRotationX': 0,
		'ellipseCurveRotationY': 0,
		'ellipseCurveRotationZ': 0,
		'ellipseCurveScaleX': 1,
		'ellipseCurveScaleY': 1
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

		this.ellipseCurve = null;
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

		this.ellipseCurve = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.ellipseCurveColor } )
		);
		this.scene.add(this.ellipseCurve);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var curve = new THREE.EllipseCurve(
			properties.ellipseCurveCenterX,
			properties.ellipseCurveCenterY,
			properties.ellipseCurveRadiusX,
			properties.ellipseCurveRadiusY,
			properties.ellipseCurveStartAngle,
			properties.ellipseCurveEndAngle,
			properties.ellipseCurveClockwise,
			properties.ellipseCurveRotation
		);

		this.ellipseCurve.geometry.dispose();
		this.ellipseCurve.geometry = new THREE.Geometry().setFromPoints(curve.getPoints(properties.ellipseCurvePoints));
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Ellipse Curve');
		folderGeometry.add(properties, 'ellipseCurveCenterX', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveCenterY', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveRadiusX', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveRadiusY', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveStartAngle', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveEndAngle', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveClockwise').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurveRotation', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ellipseCurvePoints', 3, 50).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Ellipse Curve Material');
		folderMaterial.addColor(properties, 'ellipseCurveColor').onChange(function(value) {
			self.ellipseCurve.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Ellipse Curve Transformation');
		folderTransformation.add(properties, 'ellipseCurvePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.ellipseCurve.position.x = value;
		});
		folderTransformation.add(properties, 'ellipseCurvePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.ellipseCurve.position.y = value;
		});
		folderTransformation.add(properties, 'ellipseCurvePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.ellipseCurve.position.z = value;
		});
		folderTransformation.add(properties, 'ellipseCurveRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ellipseCurve.rotation.x = value;
		});
		folderTransformation.add(properties, 'ellipseCurveRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ellipseCurve.rotation.y = value;
		});
		folderTransformation.add(properties, 'ellipseCurveRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ellipseCurve.rotation.z = value;
		});
		folderTransformation.add(properties, 'ellipseCurveScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.ellipseCurve.scale.x = value;
		});
		folderTransformation.add(properties, 'ellipseCurveScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.ellipseCurve.scale.y = value;
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