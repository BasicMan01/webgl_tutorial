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
		'torusRadius': 3,
		'torusTube': 1,
		'torusRadialSegments': 10,
		'torusTubularSegments': 10,
		'torusArc': 2*Math.PI,
		'torusMaterialColor': '#156289',
		'torusWireframeColor': '#FFFFFF',
		'torusPositionX': 0,
		'torusPositionY': 0,
		'torusPositionZ': 0,
		'torusRotationX': 0,
		'torusRotationY': 0,
		'torusRotationZ': 0,
		'torusScaleX': 1,
		'torusScaleY': 1,
		'torusScaleZ': 1,
		'torusWireframe': false
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

		this.torus = null;
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

		this.torus = new THREE.Object3D();
		this.scene.add(this.torus);

		this.torus.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.torusMaterialColor, side: THREE.DoubleSide } )
		));

		this.torus.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.torusWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.TorusGeometry(
			properties.torusRadius,
			properties.torusTube,
			properties.torusRadialSegments,
			properties.torusTubularSegments,
			properties.torusArc
		);

		this.torus.children[0].geometry.dispose();
		this.torus.children[0].geometry = geometry;

		this.torus.children[1].geometry.dispose();
		this.torus.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Torus Geometry');
		folderGeometry.add(properties, 'torusWireframe').onChange(function(value) {
			self.torus.children[0].visible = !value;
			/*
				self.torus.children[0].material.wireframe = value;
				self.torus.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'torusRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusTube', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusRadialSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusTubularSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusArc', 0.1, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Torus Material');
		folderMaterial.addColor(properties, 'torusMaterialColor').onChange(function(value) {
			self.torus.children[0].material.color.set(value);
		});
		folderMaterial.addColor(properties, 'torusWireframeColor').onChange(function(value) {
			self.torus.children[1].material.color.set(value);
		});

		let folderTransformation = this.gui.addFolder('Torus Transformation');
		folderTransformation.add(properties, 'torusPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.x = value;
		});
		folderTransformation.add(properties, 'torusPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.y = value;
		});
		folderTransformation.add(properties, 'torusPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.torus.position.z = value;
		});
		folderTransformation.add(properties, 'torusRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.x = value;
		});
		folderTransformation.add(properties, 'torusRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.y = value;
		});
		folderTransformation.add(properties, 'torusRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torus.rotation.z = value;
		});
		folderTransformation.add(properties, 'torusScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scale.x = value;
		});
		folderTransformation.add(properties, 'torusScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scale.y = value;
		});
		folderTransformation.add(properties, 'torusScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.torus.scale.z = value;
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