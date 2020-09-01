// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_119/build/three.module.js';

import { DeviceOrientationControls } from '../../../../../lib/threejs_119/examples/jsm/controls/DeviceOrientationControls.js';
import { OrbitControls } from '../../../../../lib/threejs_119/examples/jsm/controls/OrbitControls.js';
import { VRButton } from '../../../../../lib/threejs_119/examples/jsm/webxr/VRButton.js';


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
		this.video = null;
		this.videoTexture = null;

		this.isMouseDown = false;
		this.lon = 0;
		this.lat = 0;
		this.phi = 0;
		this.theta = 0;
		this.mouseDownLon = 0;
		this.mouseDownLat = 0;
		this.mouseMoveStart = new THREE.Vector2();
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.target = new THREE.Vector3(0, 0, 0);
		//this.camera.layers.enable(1);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
		this.renderer.xr.enabled = true;
		this.renderer.xr.setReferenceSpaceType('local');

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);
		this.canvas.appendChild(VRButton.createButton(this.renderer));

		this.onDeviceOrientationHandler = this.onDeviceOrientationHandler.bind(this);

		this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);

		window.addEventListener('deviceorientation', this.onDeviceOrientationHandler, false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);
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
		this.video = document.createElement('video');
		this.video.crossOrigin = 'anonymous';
		this.video.loop = true;
		this.video.muted = true;
		this.video.src = this.canvas.dataset.src;
		this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');

		this.videoTexture = new THREE.VideoTexture(this.video);
		this.videoTexture.minFilter = THREE.LinearFilter;
		this.videoTexture.maxFilter = THREE.LinearFilter;
		this.videoTexture.format = THREE.RGBFormat;

		this.sphere = new THREE.Mesh(
			this.getGeometry(),
			new THREE.MeshBasicMaterial({ map: this.videoTexture })
		);

		this.scene.add(this.sphere);
	};

	Main.prototype.getGeometry = function() {
		let geometry = new THREE.SphereBufferGeometry(500, 60, 40);

		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);

		return geometry;
	};

	Main.prototype.render = function() {
		if (this.videoTexture) {
			this.videoTexture.update();
		}

		if (this.controls) {
			this.controls.update(this.clock.getDelta());
		} else {
			this.lat = Math.max(-85, Math.min(85, this.lat));
			this.phi = THREE.MathUtils.degToRad(90 - this.lat);
			this.theta = THREE.MathUtils.degToRad(this.lon);

			this.camera.position.x = 0.001 * Math.sin(this.phi) * Math.cos(this.theta);
			this.camera.position.y = 0.001 * Math.cos(this.phi);
			this.camera.position.z = 0.001 * Math.sin(this.phi) * Math.sin(this.theta);

			this.camera.lookAt(this.camera.target);
		}

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

	Main.prototype.onMouseDown = function(event) {
		event.preventDefault();

		this.isMouseDown = true;
		this.mouseMoveStart.set(event.clientX, event.clientY);

		this.mouseDownLon = this.lon;
		this.mouseDownLat = this.lat;
	};

	Main.prototype.onMouseMove = function(event) {
		if (this.isMouseDown) {
			this.lon = (this.mouseMoveStart.x - event.clientX) * 0.1 + this.mouseDownLon;
			this.lat = (this.mouseMoveStart.y - event.clientY) * 0.1 + this.mouseDownLat;
		}
	};

	Main.prototype.onMouseUp = function(event) {
		this.isMouseDown = false;
	};

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		document.getElementById('btnPlay').style.border = 'none';
		document.getElementsByClassName('button-container')[0].style.top = (main.getCanvasHeight() / 3) + 'px';

		document.getElementById('btnPlay').addEventListener('click', function() {
			this.style.display = 'none';

			main.video.play();
		});

		main.init();
	});
}(window));