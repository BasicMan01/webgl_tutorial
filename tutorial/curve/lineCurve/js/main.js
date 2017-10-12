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
		'linev1X': 0,
		'linev1Y': 0,
		'linev2X': 3,
		'linev2Y': 3,
		'lineColor': '#FFFFFF',
		'linePositionX': 0,
		'linePositionY': 0,
		'linePositionZ': 0,
		'lineRotationX': 0,
		'lineRotationY': 0,
		'lineRotationZ': 0,
		'lineScaleX': 1,
		'lineScaleY': 1
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

		this.line = null;
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

		this.line = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.lineColor } )
		);
		this.scene.add(this.line);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var curve = new THREE.LineCurve(
			new THREE.Vector3(properties.linev1X, properties.linev1Y),
			new THREE.Vector3(properties.linev2X, properties.linev2Y)
		);

		var path = new THREE.Path(curve.getPoints(1));

		this.line.geometry.dispose();
		this.line.geometry = path.createPointsGeometry(1);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Line Curve');
		folderGeometry.add(properties, 'linev1X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'linev1Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'linev2X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'linev2Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Line Material');
		folderMaterial.addColor(properties, 'lineColor').onChange(function(value) {
			self.line.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Line Transformation');
		folderTransformation.add(properties, 'linePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.line.position.x = value;
		});
		folderTransformation.add(properties, 'linePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.line.position.y = value;
		});
		folderTransformation.add(properties, 'linePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.line.position.z = value;
		});
		folderTransformation.add(properties, 'lineRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.line.rotation.x = value;
		});
		folderTransformation.add(properties, 'lineRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.line.rotation.y = value;
		});
		folderTransformation.add(properties, 'lineRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.line.rotation.z = value;
		});
		folderTransformation.add(properties, 'lineScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.line.scale.x = value;
		});
		folderTransformation.add(properties, 'lineScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.line.scale.y = value;
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