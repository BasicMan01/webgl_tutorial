// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_125/build/three.module.js';
import { GUI } from '../../../../../lib/threejs_125/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../../../../lib/threejs_125/examples/jsm/controls/OrbitControls.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'circleRadius': 3,
		'circleSegments': 8,
		'circleThetaStart': 0,
		'circleThetaLength': 2 * Math.PI,
		'circleMaterialColor': '#156289',
		'circleWireframeColor': '#FFFFFF',
		'circlePositionX': 0,
		'circlePositionY': 0,
		'circlePositionZ': 0,
		'circleRotationX': 0,
		'circleRotationY': 0,
		'circleRotationZ': 0,
		'circleScaleX': 1,
		'circleScaleY': 1,
		'circleWireframe': false
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

		this.circle = null;
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

		this.circle = new THREE.Object3D();
		this.scene.add(this.circle);

		this.circle.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.circleMaterialColor, side: THREE.DoubleSide } )
		));

		this.circle.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.circleWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.CircleGeometry(
			properties.circleRadius,
			properties.circleSegments,
			properties.circleThetaStart,
			properties.circleThetaLength
		);

		this.circle.children[0].geometry.dispose();
		this.circle.children[0].geometry = geometry;

		this.circle.children[1].geometry.dispose();
		this.circle.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Circle Geometry');
		folderGeometry.add(properties, 'circleWireframe').onChange(function(value) {
			self.circle.children[0].visible = !value;
			/*
				self.circle.children[0].material.wireframe = value;
				self.circle.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'circleRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'circleSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'circleThetaStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'circleThetaLength', 0.1, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Circle Material');
		folderMaterial.addColor(properties, 'circleMaterialColor').onChange(function(value) {
			self.circle.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'circleWireframeColor').onChange(function(value) {
			self.circle.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Circle Transformation');
		folderTransformation.add(properties, 'circlePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.x = value;
		});
		folderTransformation.add(properties, 'circlePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.y = value;
		});
		folderTransformation.add(properties, 'circlePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.circle.position.z = value;
		});
		folderTransformation.add(properties, 'circleRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.x = value;
		});
		folderTransformation.add(properties, 'circleRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.y = value;
		});
		folderTransformation.add(properties, 'circleRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.circle.rotation.z = value;
		});
		folderTransformation.add(properties, 'circleScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.circle.scale.x = value;
		});
		folderTransformation.add(properties, 'circleScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.circle.scale.y = value;
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