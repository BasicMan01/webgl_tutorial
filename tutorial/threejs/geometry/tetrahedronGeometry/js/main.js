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
		'tetrahedronRadius': 3,
		'tetrahedronDetail': 0,
		'tetrahedronMaterialColor': '#156289',
		'tetrahedronWireframeColor': '#FFFFFF',
		'tetrahedronPositionX': 0,
		'tetrahedronPositionY': 0,
		'tetrahedronPositionZ': 0,
		'tetrahedronRotationX': 0,
		'tetrahedronRotationY': 0,
		'tetrahedronRotationZ': 0,
		'tetrahedronScaleX': 1,
		'tetrahedronScaleY': 1,
		'tetrahedronScaleZ': 1,
		'tetrahedronWireframe': false
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

		this.tetrahedron = null;
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

		this.tetrahedron = new THREE.Object3D();
		this.scene.add(this.tetrahedron);

		this.tetrahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.tetrahedronMaterialColor } )
		));

		this.tetrahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.tetrahedronWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.TetrahedronGeometry(
			properties.tetrahedronRadius,
			properties.tetrahedronDetail
		);

		this.tetrahedron.children[0].geometry.dispose();
		this.tetrahedron.children[0].geometry = geometry;

		this.tetrahedron.children[1].geometry.dispose();
		this.tetrahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Tetrahedron Geometry');
		folderGeometry.add(properties, 'tetrahedronWireframe').onChange(function(value) {
			self.tetrahedron.children[0].visible = !value;
			/*
				self.tetrahedron.children[0].material.wireframe = value;
				self.tetrahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'tetrahedronRadius', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'tetrahedronDetail', 0, 5).step(1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Tetrahedron Material');
		folderMaterial.addColor(properties, 'tetrahedronMaterialColor').onChange(function(value) {
			self.tetrahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'tetrahedronWireframeColor').onChange(function(value) {
			self.tetrahedron.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Tetrahedron Transformation');
		folderTransformation.add(properties, 'tetrahedronPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.position.x = value;
		});
		folderTransformation.add(properties, 'tetrahedronPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.position.y = value;
		});
		folderTransformation.add(properties, 'tetrahedronPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.position.z = value;
		});
		folderTransformation.add(properties, 'tetrahedronRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tetrahedron.rotation.x = value;
		});
		folderTransformation.add(properties, 'tetrahedronRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tetrahedron.rotation.y = value;
		});
		folderTransformation.add(properties, 'tetrahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tetrahedron.rotation.z = value;
		});
		folderTransformation.add(properties, 'tetrahedronScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.scale.x = value;
		});
		folderTransformation.add(properties, 'tetrahedronScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.scale.y = value;
		});
		folderTransformation.add(properties, 'tetrahedronScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.tetrahedron.scale.z = value;
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