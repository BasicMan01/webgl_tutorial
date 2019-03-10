/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'fogColor': '#FFFFFF',
		'fogNear': 0.1,
		'fogFar': 35,
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



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.hemisphereLight = null;

		this.cube = null;
		this.plane = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createFog();
		this.createObject();
		this.createLight();

		this.render();
	};

	Main.prototype.createFog = function() {
		this.scene.fog = new THREE.Fog(
			properties.fogColor,
			properties.fogNear,
			properties.fogFar
		);
	};

	Main.prototype.createObject = function() {
		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(50, 50, 50, 50),
			new THREE.MeshPhongMaterial( { color: 0xAAAAAA, side: THREE.DoubleSide } )
		);
		this.plane.rotation.x = Math.PI / 2;
		this.scene.add(this.plane);

		this.cube = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),
			new THREE.MeshPhongMaterial( { color: 0xFFFFFF } )
		);
		this.scene.add(this.cube);
	};

	Main.prototype.createGui = function() {
		var self = this;

		var folderProperties = this.gui.addFolder('Fog Properties');
		folderProperties.addColor(properties, 'fogColor').onChange(function(value) {
			self.scene.fog.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderProperties.add(properties, 'fogNear', 0.1, 50).step(0.1).onChange(function(value) {
			self.scene.fog.near = value;
		});
		folderProperties.add(properties, 'fogFar', 0.1, 50).step(0.1).onChange(function(value) {
			self.scene.fog.far = value;
		});

		var folderTransformation = this.gui.addFolder('Cube Transformation');
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

	Main.prototype.createLight = function() {
		this.hemisphereLight = new THREE.HemisphereLight(0xDDEEFF, 0x0F0E0D, 0.5);
		this.scene.add(this.hemisphereLight);
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



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));