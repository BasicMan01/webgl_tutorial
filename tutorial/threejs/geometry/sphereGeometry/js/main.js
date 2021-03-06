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
		'sphereRadius': 2.5,
		'sphereWidthSegments': 16,
		'sphereHeightSegments': 12,
		'spherePhiStart': 0,
		'spherePhiLength': 2*Math.PI,
		'sphereThetaStart': 0,
		'sphereThetaLength': Math.PI,
		'sphereMaterialColor': '#156289',
		'sphereWireframeColor': '#FFFFFF',
		'spherePositionX': 0,
		'spherePositionY': 0,
		'spherePositionZ': 0,
		'sphereRotationX': 0,
		'sphereRotationY': 0,
		'sphereRotationZ': 0,
		'sphereScaleX': 1,
		'sphereScaleY': 1,
		'sphereScaleZ': 1,
		'sphereWireframe': false
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

		this.sphere = null;
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

		this.sphere = new THREE.Object3D();
		this.scene.add(this.sphere);

		this.sphere.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.sphereMaterialColor, side: THREE.DoubleSide } )
		));

		this.sphere.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.sphereWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.SphereGeometry(
			properties.sphereRadius,
			properties.sphereWidthSegments,
			properties.sphereHeightSegments,
			properties.spherePhiStart,
			properties.spherePhiLength,
			properties.sphereThetaStart,
			properties.sphereThetaLength
		);

		this.sphere.children[0].geometry.dispose();
		this.sphere.children[0].geometry = geometry;

		this.sphere.children[1].geometry.dispose();
		this.sphere.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Sphere Geometry');
		folderGeometry.add(properties, 'sphereWireframe').onChange(function(value) {
			self.sphere.children[0].visible = !value;
			/*
				self.sphere.children[0].material.wireframe = value;
				self.sphere.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'sphereRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereWidthSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereHeightSegments', 2, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'spherePhiStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'spherePhiLength', 0.1, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereThetaStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereThetaLength', 0.1, Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Sphere Material');
		folderMaterial.addColor(properties, 'sphereMaterialColor').onChange(function(value) {
			self.sphere.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'sphereWireframeColor').onChange(function(value) {
			self.sphere.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Sphere Transformation');
		folderTransformation.add(properties, 'spherePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.x = value;
		});
		folderTransformation.add(properties, 'spherePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.y = value;
		});
		folderTransformation.add(properties, 'spherePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.z = value;
		});
		folderTransformation.add(properties, 'sphereRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.x = value;
		});
		folderTransformation.add(properties, 'sphereRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.y = value;
		});
		folderTransformation.add(properties, 'sphereRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.sphere.rotation.z = value;
		});
		folderTransformation.add(properties, 'sphereScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scale.x = value;
		});
		folderTransformation.add(properties, 'sphereScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scale.y = value;
		});
		folderTransformation.add(properties, 'sphereScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.sphere.scale.z = value;
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