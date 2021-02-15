// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_125/build/three.module.js';

import { DeviceOrientationControls } from '../../../../../lib/threejs_125/examples/jsm/controls/DeviceOrientationControls.js';
import { OrbitControls } from '../../../../../lib/threejs_125/examples/jsm/controls/OrbitControls.js';
import { VRButton } from '../../../../../lib/threejs_125/examples/jsm/webxr/VRButton.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 75,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};



	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.clock = null;
		this.controls = null;
		this.renderer = null;
		this.scene = null;

		this.sphere = null;
		this.texture = null;
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.target = new THREE.Vector3(0, 0, 0);
		this.camera.position.set(5, 0, 0);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
		this.renderer.xr.enabled = true;
		this.renderer.xr.setReferenceSpaceType('local');

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.2;
		this.controls.enableZoom = false;
		this.controls.rotateSpeed = -0.2;

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);
		this.canvas.appendChild(VRButton.createButton(this.renderer));

		this.onDeviceOrientationHandler = this.onDeviceOrientationHandler.bind(this);

		window.addEventListener('deviceorientation', this.onDeviceOrientationHandler, false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);
		window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
		window.addEventListener('vrdisplaypresentchange', function (event) {
			// Maintain viewing direction when switching to VR and back
			if(event.display.isPresenting){
				this.controls.enabled = false;
			}
		}.bind(this), false);

		this.createObject();

		this.renderer.setAnimationLoop(this.render.bind(this));
	};

	Main.prototype.createObject = function() {
		this.texture = new THREE.TextureLoader().load( "../../../../resources/texture/image360_4k.jpg");

		this.sphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry(100, 60, 40),
			new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: this.texture })
		);

		this.scene.add(this.sphere);
	};

	Main.prototype.render = function() {
		this.controls.update(this.clock.getDelta());

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onDeviceOrientationHandler = function(event) {
		if(!event.alpha) {
			return;
		}

		this.controls = new DeviceOrientationControls(this.camera);
		this.controls.connect();
		this.controls.update();

		window.removeEventListener('deviceorientation', this.onDeviceOrientationHandler, false);
	};

	Main.prototype.onMouseWheel = function(event) {
		let fov = this.camera.fov + event.deltaY * 0.01;

		this.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
		this.camera.updateProjectionMatrix();
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