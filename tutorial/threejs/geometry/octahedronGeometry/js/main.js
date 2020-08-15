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
		'octahedronRadius': 3,
		'octahedronDetail': 0,
		'octahedronMaterialColor': '#156289',
		'octahedronWireframeColor': '#FFFFFF',
		'octahedronPositionX': 0,
		'octahedronPositionY': 0,
		'octahedronPositionZ': 0,
		'octahedronRotationX': 0,
		'octahedronRotationY': 0,
		'octahedronRotationZ': 0,
		'octahedronScaleX': 1,
		'octahedronScaleY': 1,
		'octahedronScaleZ': 1,
		'octahedronWireframe': false
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

		this.octahedron = null;
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

		this.octahedron = new THREE.Object3D();
		this.scene.add(this.octahedron);

		this.octahedron.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.octahedronMaterialColor } )
		));

		this.octahedron.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.octahedronWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.OctahedronGeometry(
			properties.octahedronRadius,
			properties.octahedronDetail
		);

		this.octahedron.children[0].geometry.dispose();
		this.octahedron.children[0].geometry = geometry;

		this.octahedron.children[1].geometry.dispose();
		this.octahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Octahedron Geometry');
		folderGeometry.add(properties, 'octahedronWireframe').onChange(function(value) {
			self.octahedron.children[0].visible = !value;
			/*
				self.octahedron.children[0].material.wireframe = value;
				self.octahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'octahedronRadius', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'octahedronDetail', 0, 5).step(1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Octahedron Material');
		folderMaterial.addColor(properties, 'octahedronMaterialColor').onChange(function(value) {
			self.octahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'octahedronWireframeColor').onChange(function(value) {
			self.octahedron.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Octahedron Transformation');
		folderTransformation.add(properties, 'octahedronPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.octahedron.position.x = value;
		});
		folderTransformation.add(properties, 'octahedronPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.octahedron.position.y = value;
		});
		folderTransformation.add(properties, 'octahedronPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.octahedron.position.z = value;
		});
		folderTransformation.add(properties, 'octahedronRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.octahedron.rotation.x = value;
		});
		folderTransformation.add(properties, 'octahedronRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.octahedron.rotation.y = value;
		});
		folderTransformation.add(properties, 'octahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.octahedron.rotation.z = value;
		});
		folderTransformation.add(properties, 'octahedronScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.octahedron.scale.x = value;
		});
		folderTransformation.add(properties, 'octahedronScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.octahedron.scale.y = value;
		});
		folderTransformation.add(properties, 'octahedronScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.octahedron.scale.z = value;
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