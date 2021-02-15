// jshint esversion: 6

import * as THREE from '../../../../../lib/threejs_125/build/three.module.js';
import { GUI } from '../../../../../lib/threejs_125/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../../../../lib/threejs_125/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../../lib/threejs_125/examples/jsm/loaders/FBXLoader.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'ambientColor': '#FFFFFF',
		'ambientIntensity': 1,
		'fbxModelMaterialColor': '#FFFFFF',
		'fbxModelPositionX': 0,
		'fbxModelPositionY': 0,
		'fbxModelPositionZ': 0,
		'fbxModelRotationX': 0,
		'fbxModelRotationY': 0,
		'fbxModelRotationZ': 0,
		'fbxModelScaleX': 1,
		'fbxModelScaleY': 1,
		'fbxModelScaleZ': 1,
		'fbxModelWireframe': false
	};

	let onProgress = function(xhr) {
		if(xhr.lengthComputable) {
			let percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	};

	let onError = function(xhr) {
		console.error(xhr);
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

		this.fbxModel = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color('#000000');

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.outputEncoding = THREE.sRGBEncoding;
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
		this.createLight();

		this.render();
	};

	Main.prototype.createObject = function() {
		let self = this;

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);


		let loadingManager = new THREE.LoadingManager();

		loadingManager.onProgress = function(item, loaded, total) {
			console.log(item, '(' + loaded + '/' + total + ')');
		};


		let fbxLoader = new FBXLoader(loadingManager);

		fbxLoader.setResourcePath('../../../../resources/texture/');
		fbxLoader.load('../../../../resources/mesh/fbx/fbxCabinet.fbx', function(object) {
			self.fbxModel = object;

			self.scene.add(self.fbxModel);
		}, onProgress, onError);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('FBX Model Geometry');
		folderGeometry.add(properties, 'fbxModelWireframe').onChange(function(value) {
			self.fbxModel.getObjectByName('cabinet').material.wireframe = value;
		});

		let folderMaterial = this.gui.addFolder('FBX Model Material');
		folderMaterial.addColor(properties, 'fbxModelMaterialColor').onChange(function(value) {
			self.fbxModel.getObjectByName('cabinet').material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('FBX Model Transformation');
		folderTransformation.add(properties, 'fbxModelPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.x = value;
		});
		folderTransformation.add(properties, 'fbxModelPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.y = value;
		});
		folderTransformation.add(properties, 'fbxModelPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.z = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.x = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.y = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.z = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.x = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.y = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.z = value;
		});
	};

	Main.prototype.createLight = function() {
		this.ambientLight = new THREE.AmbientLight(
			properties.ambientColor,
			properties.ambientIntensity
		);
		this.scene.add(this.ambientLight);
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