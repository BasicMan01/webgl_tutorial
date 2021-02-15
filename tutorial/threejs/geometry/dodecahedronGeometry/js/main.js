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
		'dodecahedronRadius': 3,
		'dodecahedronDetail': 0,
		'dodecahedronMaterialColor': '#156289',
		'dodecahedronWireframeColor': '#FFFFFF',
		'dodecahedronPositionX': 0,
		'dodecahedronPositionY': 0,
		'dodecahedronPositionZ': 0,
		'dodecahedronRotationX': 0,
		'dodecahedronRotationY': 0,
		'dodecahedronRotationZ': 0,
		'dodecahedronScaleX': 1,
		'dodecahedronScaleY': 1,
		'dodecahedronScaleZ': 1,
		'dodecahedronWireframe': false
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

		this.dodecahedron = null;
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

		this.dodecahedron = new THREE.Object3D();
		this.scene.add(this.dodecahedron);

		this.dodecahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.dodecahedronMaterialColor } )
		));

		this.dodecahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.dodecahedronWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.DodecahedronGeometry(
			properties.dodecahedronRadius,
			properties.dodecahedronDetail
		);

		this.dodecahedron.children[0].geometry.dispose();
		this.dodecahedron.children[0].geometry = geometry;

		this.dodecahedron.children[1].geometry.dispose();
		this.dodecahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Dodecahedron Geometry');
		folderGeometry.add(properties, 'dodecahedronWireframe').onChange(function(value) {
			self.dodecahedron.children[0].visible = !value;
			/*
				self.dodecahedron.children[0].material.wireframe = value;
				self.dodecahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'dodecahedronRadius', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'dodecahedronDetail', 0, 5).step(1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Dodecahedron Material');
		folderMaterial.addColor(properties, 'dodecahedronMaterialColor').onChange(function(value) {
			self.dodecahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'dodecahedronWireframeColor').onChange(function(value) {
			self.dodecahedron.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Dodecahedron Transformation');
		folderTransformation.add(properties, 'dodecahedronPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.position.z = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.dodecahedron.rotation.z = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.x = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.y = value;
		});
		folderTransformation.add(properties, 'dodecahedronScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.dodecahedron.scale.z = value;
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