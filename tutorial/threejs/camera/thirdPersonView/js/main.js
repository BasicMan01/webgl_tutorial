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
		'gridHelperVisible': false,
		'cubeMaterialColor': '#891562',
		'cubeWireframeColor': '#FFFFFF',
		'cubePositionX': 0,
		'cubePositionY': 1.5,
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

		this.cameraGroup = null;
		this.cube = null;
		this.plane = null;

		this.raycaster = new THREE.Raycaster();
		this.mouseVector2 = new THREE.Vector2();


		this.rotateY = new THREE.Vector3();

		this.keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		}
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 1.7, 5);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.enableZoom = true;
		this.controls.target = new THREE.Vector3(0, 1.7, 0);
		this.controls.update();

		this.gui = new GUI({ width: 400 });
		this.gui.close();

		window.addEventListener('keydown', this.onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this.onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		let geometry = new THREE.BoxGeometry(0.7, 1.8, 0.3, 1, 1, 1);

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.gridHelper.visible = properties.gridHelperVisible;
		this.scene.add(this.gridHelper);

		this.cube = new THREE.Object3D();
		this.cube.position.set(0, 0.9, 0);
		this.scene.add(this.cube);

		this.cube.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: properties.cubeMaterialColor } )
		));

		this.cube.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: properties.cubeWireframeColor } )
		));

		this.plane = new  THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({ color: 0x156289, side: THREE.DoubleSide })
		);
		this.plane.rotation.x = Math.PI / -2;
		this.scene.add(this.plane);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.camera.getWorldDirection(this.rotateY);
		this.rotateY.y = 0;

		this.n = this.rotateY.normalize().clone().multiplyScalar(this.clock.getDelta());

		this.rotateY.add(this.cube.position);

		// cube look at the same direction as camera
		this.cube.lookAt(this.rotateY);

		if (this.keyStatus[87]) {
			this.cube.position.add(this.n);
			this.camera.position.add(this.n);
		}


		// orbit controls rotate around new cube position
		this.controls.target.copy(new THREE.Vector3(this.cube.position.x, 1.7, this.cube.position.z));
		this.controls.update();


		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onKeyDownHandler = function(event) {
		console.log(event.keyCode);
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this.keyStatus[event.keyCode] = true;
			} break;
		}
	};

	Main.prototype.onKeyUpHandler = function(event) {
		console.log(event.keyCode);
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this.keyStatus[event.keyCode] = false;
			} break;
		}
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