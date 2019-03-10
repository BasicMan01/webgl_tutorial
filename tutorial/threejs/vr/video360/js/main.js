/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 75,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.cameraGroup = null;
		this.clock = null;
		this.controls = null;
		this.renderer = null;
		this.scene = null;

		this.meshL = null;
		this.meshR = null;
		this.video = null;
		this.videoTexture = null;
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.layers.enable(1);

		this.cameraGroup = new THREE.Group();
		this.cameraGroup.add(this.camera);

		this.scene.add(this.cameraGroup);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
		this.renderer.vr.enabled = true;

		this.controls = new THREE.OrbitControls(this.cameraGroup, this.renderer.domElement);
		this.controls.rotateSpeed = 0.3;
		this.controls.enableZoom = true;
		this.controls.enablePan = true;

		this.cameraGroup.rotation.y = Math.PI / 2

		this.controls.target.set(
			this.cameraGroup.position.x + 0.001,
			this.cameraGroup.position.y,
			this.cameraGroup.position.z

		);



		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);
		this.canvas.appendChild(WEBVR.createButton(this.renderer, {frameOfReferenceType: 'eye-level'}));

		this.onDeviceOrientationHandler = this.onDeviceOrientationHandler.bind(this);

		this.renderer.domElement.addEventListener('click', this.onClickHandler.bind(this));

		window.addEventListener('deviceorientation', this.onDeviceOrientationHandler, false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);
		window.addEventListener('vrdisplaypresentchange', function (event) {
			if(event.display.isPresenting){
				this.controls.enabled = false;
			}
		}.bind(this), false);

		this.createObject();

		this.renderer.setAnimationLoop(this.render.bind(this));
	};

	Main.prototype.createObject = function() {
		let self = this;

		this.video = document.createElement('video');
		this.video.crossOrigin = 'anonymous';
		this.video.loop = true;
		this.video.muted = true;
		this.video.src = this.canvas.dataset.src;
		this.video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );

		this.videoTexture = new THREE.VideoTexture(this.video);
		this.videoTexture.minFilter = THREE.NearestFilter;
		this.videoTexture.maxFilter = THREE.NearestFilter;
		this.videoTexture.format = THREE.RGBFormat;

		this.meshL = new THREE.Mesh(
			this.getGeometry(),
			new THREE.MeshBasicMaterial({ map: this.videoTexture })
		);

		this.meshR = new THREE.Mesh(
			this.getGeometry(),
			new THREE.MeshBasicMaterial({ map: this.videoTexture })
		);

		this.meshL.layers.set(1);
		this.meshR.layers.set(2);

		this.scene.add(this.meshL);
		this.scene.add(this.meshR);
	};

	Main.prototype.getGeometry = function() {
		var geometry = new THREE.SphereBufferGeometry(500, 60, 40);

		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);

		return geometry;
	};

	Main.prototype.render = function() {
		if (this.videoTexture) {
			this.videoTexture.update();
		}

		this.controls.update(this.clock.getDelta());

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onClickHandler = function(event) {
		this.video.play();
	};

	Main.prototype.onDeviceOrientationHandler = function(event) {
		if(!event.alpha) {
			return;
		}

		// Create controls for mobile.
		this.controls.enabled = false;

		this.controls = new THREE.DeviceOrientationControls(this.cameraGroup);
		this.controls.connect();
		this.controls.update();

		window.removeEventListener('deviceorientation', this.onDeviceOrientationHandler, false);
	};

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