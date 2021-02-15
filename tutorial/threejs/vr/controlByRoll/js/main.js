// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_125/build/three.module.js';
import { GUI } from '../../../../../lib/threejs_125/examples/jsm/libs/dat.gui.module.js';

import { VRButton } from '../../../../../lib/threejs_125/examples/jsm/webxr/VRButton.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'cubeMaterialColor': '#156289',
		'cubeWireframeColor': '#FFFFFF',
		'cubePositionX': 0,
		'cubePositionY': 0,
		'cubePositionZ': 0,
		'cubeRotationX': 0,
		'cubeRotationY': 0,
		'cubeRotationZ': 0,
		'cubeScaleX': 1,
		'cubeScaleY': 1,
		'cubeScaleZ': 1
	};



	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.clock = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cube = null;

		this.deviceOrientationData = null;
		this.currentScreenOrientation = window.orientation || 0;
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);

		this.cameraGroup = new THREE.Group();
		this.cameraGroup.add(this.camera);
		this.cameraGroup.position.set(0, 1.7, 20);

		this.scene.add(this.cameraGroup);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
		this.renderer.xr.enabled = true;

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);
		this.canvas.appendChild(VRButton.createButton(this.renderer));

		this.gui = new GUI({ width: 400 });
		this.gui.close();

		// https://kostasbariotis.com/removeeventlistener-and-this/
		this.deviceorientationHandler = this.onDeviceOrientationHandler.bind(this);
		this.orientationChangeHandler = this.onOrientationChangeHandler.bind(this);

		window.addEventListener('deviceorientation', this.deviceorientationHandler, true);
		window.addEventListener('orientationchange', this.orientationChangeHandler, false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		// For WebVR-Projects use this here
		this.renderer.setAnimationLoop(this.render.bind(this));
	};

	Main.prototype.createObject = function() {
		let geometry = new THREE.BoxGeometry(5, 5, 5);

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.cube = new THREE.Object3D();
		this.scene.add(this.cube);

		this.cube.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: properties.cubeMaterialColor } )
		));

		this.cube.add(new THREE.LineSegments(
			geometry,
			new THREE.LineBasicMaterial( { color: properties.cubeWireframeColor } )
		));
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderMaterial = this.gui.addFolder('Cube Material');
		folderMaterial.addColor(properties, 'cubeMaterialColor').onChange(function(value) {
			self.cube.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'cubeWireframeColor').onChange(function(value) {
			self.cube.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Cube Transformation');
		folderTransformation.add(properties, 'cubePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.x = value;
		});
		folderTransformation.add(properties, 'cubePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.y = value;
		});
		folderTransformation.add(properties, 'cubePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.z = value;
		});
		folderTransformation.add(properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.x = value;
		});
		folderTransformation.add(properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.y = value;
		});
		folderTransformation.add(properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.z = value;
		});
		folderTransformation.add(properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.x = value;
		});
		folderTransformation.add(properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.y = value;
		});
		folderTransformation.add(properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.z = value;
		});
	};

	Main.prototype.render = function() {
		let betaSin = 0;
		let clockDelta = this.clock.getDelta();

		if (this.deviceOrientationData !== null && this.deviceOrientationData.gamma) {
			betaSin = Math.sin(THREE.Math.degToRad(this.deviceOrientationData.beta));
		}

		this.cameraGroup.position.x += betaSin * clockDelta * 15;
		this.cameraGroup.position.z -= clockDelta * 10;

		// reset camera position to start
		if (this.cameraGroup.position.z < -25) {
			this.cameraGroup.position.z = 25
		}

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onDeviceOrientationHandler = function(event) {
		if (!event.alpha) {
			return;
		}

		this.deviceOrientationData = event;
	};

	Main.prototype.onOrientationChangeHandler = function(event) {
		this.currentScreenOrientation = window.orientation;
	};

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