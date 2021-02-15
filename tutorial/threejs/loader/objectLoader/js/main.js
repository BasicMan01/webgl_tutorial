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
		'ambientColor': '#DDEEFF',
		'ambientIntensity': 1,
		'directionalColor': '#FFFFFF',
		'directionalIntensity': 1,
		'directionalPositionX': -20,
		'directionalPositionY': 50,
		'directionalPositionZ': 10,
		'cubeMaterialColor': '#156289',
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
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.ambientLight = null;
		this.directionalLight = null;

		this.cube = null;
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
		this.createLights();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.cube = new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshPhongMaterial( { color: properties.cubeMaterialColor } )
		);
		this.scene.add(this.cube);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);

		this.cube.geometry.dispose();
		this.cube.geometry = geometry;
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderLightProperties = this.gui.addFolder('Light Properties');
		folderLightProperties.addColor(properties, 'ambientColor').onChange(function(value) {
			self.ambientLight.color.set(value);
		});
		folderLightProperties.add(properties, 'ambientIntensity', 0, 1).step(0.01).onChange(function(value) {
			self.ambientLight.intensity = value;
		});

		folderLightProperties.addColor(properties, 'directionalColor').onChange(function(value) {
			self.directionalLight.color.set(value);
		});
		folderLightProperties.add(properties, 'directionalIntensity', 0, 1).step(0.01).onChange(function(value) {
			self.directionalLight.intensity = value;
		});
		folderLightProperties.add(properties, 'directionalPositionX', -100, 100).step(0.1).onChange(function(value) {
			self.directionalLight.position.x = value;
		});
		folderLightProperties.add(properties, 'directionalPositionY', 0, 100).step(0.1).onChange(function(value) {
			self.directionalLight.position.y = value;
		});
		folderLightProperties.add(properties, 'directionalPositionZ', -100, 100).step(0.1).onChange(function(value) {
			self.directionalLight.position.z = value;
		});

		let folderMaterial = this.gui.addFolder('Cube Material');
		folderMaterial.addColor(properties, 'cubeMaterialColor').onChange(function(value) {
			self.cube.material.color.set(value);
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

	Main.prototype.updateGui = function() {
		properties.cubeMaterialColor = '#' + this.cube.material.color.getHexString();
		properties.cubePositionX = this.cube.position.x;
		properties.cubePositionY = this.cube.position.y;
		properties.cubePositionZ = this.cube.position.z;
		properties.cubeRotationX = this.cube.rotation.x;
		properties.cubeRotationY = this.cube.rotation.y;
		properties.cubeRotationZ = this.cube.rotation.z;
		properties.cubeScaleX = this.cube.scale.x;
		properties.cubeScaleY = this.cube.scale.y;
		properties.cubeScaleZ = this.cube.scale.z;

		this.gui.updateDisplay();
	};

	Main.prototype.createLights = function() {
		this.ambientLight = new THREE.AmbientLight(
			properties.ambientColor,
			properties.ambientIntensity
		);
		this.scene.add(this.ambientLight);

		this.directionalLight = new THREE.DirectionalLight(
			properties.directionalColor,
			properties.directionalIntensity
		);
		this.directionalLight.position.set(
			properties.directionalPositionX,
			properties.directionalPositionY,
			properties.directionalPositionZ
		);
		this.scene.add(this.directionalLight);
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.loadObjectFromSessionStorage = function() {
		let objectLoader = new THREE.ObjectLoader();
		let sessionStorageValue = sessionStorage.getItem('sceneObject');

		if (sessionStorageValue !== null) {
			try {
				let jsonCube = JSON.parse(sessionStorageValue);

				this.scene.remove(this.cube);
				this.cube = objectLoader.parse(jsonCube);
				this.scene.add(this.cube);

				this.updateGui();
			} catch(e) {
				console.error('Invalid JSON ' + sessionStorageValue);
			}
		} else {
			alert('no object to load');
		}
	};

	Main.prototype.saveObjectToSessionStorage = function() {
		let jsonCube = this.cube.toJSON();

		sessionStorage.setItem('sceneObject', JSON.stringify(jsonCube));
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
		document.getElementById('btnLoad').addEventListener('click', function() {
			main.loadObjectFromSessionStorage();
		});

		document.getElementById('btnSave').addEventListener('click', function() {
			main.saveObjectToSessionStorage();
		});

		main.init();
	});
}(window));