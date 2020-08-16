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
		'planeWidth': 8,
		'planeHeight': 4,
		'planeMaterialColor': '#FFFFFF',
		'planePositionX': 0,
		'planePositionY': 0,
		'planePositionZ': 0,
		'planeRotationX': 0,
		'planeRotationY': 0,
		'planeRotationZ': 0,
		'planeScaleX': 1,
		'planeScaleY': 1
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

		this.plane = null;

		this.video = document.getElementById('video');
		this.videoTexture = null;
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

		this.initVideo();

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.plane = new THREE.Object3D();
		this.scene.add(this.plane);

		this.videoTexture = new THREE.VideoTexture(this.video);
		this.videoTexture.minFilter = THREE.LinearFilter;
		this.videoTexture.magFilter = THREE.LinearFilter;

		this.plane.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.planeMaterialColor, map: this.videoTexture, side: THREE.DoubleSide } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.PlaneGeometry(
			properties.planeWidth,
			properties.planeHeight
		);

		this.plane.children[0].geometry.dispose();
		this.plane.children[0].geometry = geometry;
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Plane Geometry');
		folderGeometry.add(properties, 'planeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Plane Material');
		folderMaterial.addColor(properties, 'planeMaterialColor').onChange(function(value) {
			self.plane.children[0].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Plane Transformation');
		folderTransformation.add(properties, 'planePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.x = value;
		});
		folderTransformation.add(properties, 'planePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.y = value;
		});
		folderTransformation.add(properties, 'planePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.z = value;
		});
		folderTransformation.add(properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.x = value;
		});
		folderTransformation.add(properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.y = value;
		});
		folderTransformation.add(properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.z = value;
		});
		folderTransformation.add(properties, 'planeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scale.x = value;
		});
		folderTransformation.add(properties, 'planeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scale.y = value;
		});
	};

	Main.prototype.initVideo = function() {
		this.video.src = '../../../../resources/video/video_1.mp4';
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		/*
			HAVE_NOTHING		0	No information is available about the media resource.
			HAVE_METADATA		1	Enough of the media resource has been retrieved that
									the metadata attributes are initialized. Seeking will no longer raise an exception.
			HAVE_CURRENT_DATA	2	Data is available for the current playback position,
									but not enough to actually play more than one frame.
			HAVE_FUTURE_DATA	3	Data for the current playback position as well as for at least a little
									bit of time into the future is available (in other words, at least two frames of video, for example).
			HAVE_ENOUGH_DATA	4	Enough data is available - and the download rate is high enough - that the media can
									be played through to the end without interruption.
		*/
		if(this.video.readyState === this.video.HAVE_ENOUGH_DATA)
		{
			if(this.videoTexture)
			{
				this.videoTexture.needsUpdate = true;
			}
		}

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
		document.getElementById('btnRewind').addEventListener('click', function() {
			document.getElementById('video').currentTime = 0;
		});

		document.getElementById('btnPlay').addEventListener('click', function() {
			document.getElementById('video').play();
		});

		document.getElementById('btnPause').addEventListener('click', function() {
			document.getElementById('video').pause();
		});

		document.getElementById('btnStop').addEventListener('click', function() {
			document.getElementById('video').pause();
			document.getElementById('video').currentTime = 0;
		});

		main.init();
	});
}(window));