// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_119/build/three.module.js';
import { GUI } from '../../../../../lib/threejs_119/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../../../../lib/threejs_119/examples/jsm/controls/OrbitControls.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
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



	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
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
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new GUI({ width: 400 });
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

		this.line = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.lineColor } )
		);
		this.scene.add(this.line);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let curve = new THREE.LineCurve(
			new THREE.Vector3(properties.linev1X, properties.linev1Y),
			new THREE.Vector3(properties.linev2X, properties.linev2Y)
		);

		this.line.geometry.dispose();
		this.line.geometry = new THREE.Geometry().setFromPoints(curve.getPoints(1));
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Line Curve');
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

		let folderMaterial = this.gui.addFolder('Line Material');
		folderMaterial.addColor(properties, 'lineColor').onChange(function(value) {
			self.line.material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Line Transformation');
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

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));