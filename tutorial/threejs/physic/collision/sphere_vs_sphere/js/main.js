// jshint esversion: 6
/* globals rdo */

import * as THREE from '../../../../../../lib/threejs_125/build/three.module.js';
import { GUI } from '../../../../../../lib/threejs_125/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../../../../../lib/threejs_125/examples/jsm/controls/OrbitControls.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'sphere1MaterialColor': '#156289',
		'sphere1WireframeColor': '#FFFFFF',
		'sphere1Radius': 2.5,
		'sphere1PositionX': -4,
		'sphere1PositionY': 0,
		'sphere1PositionZ': 0,

		'sphere2MaterialColor': '#891562',
		'sphere2WireframeColor': '#FFFFFF',
		'sphere2Radius': 2.5,
		'sphere2PositionX': 4,
		'sphere2PositionY': 0,
		'sphere2PositionZ': 0
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

		this.boundingSphere1 = new THREE.Sphere();
		this.boundingSphere2 = new THREE.Sphere();
		this.sphere1 = null;
		this.sphere2 = null;
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


		this.sphere1 = new THREE.Object3D();
		this.sphere1.position.set(properties.sphere1PositionX, properties.sphere1PositionY, properties.sphere1PositionZ);
		this.scene.add(this.sphere1);

		this.sphere1.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.sphere1MaterialColor } )
		));

		this.sphere1.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.sphere1WireframeColor } )
		));

		this.createSphere1Geometry();


		this.sphere2 = new THREE.Object3D();
		this.sphere2.position.set(properties.sphere2PositionX, properties.sphere2PositionY, properties.sphere2PositionZ);
		this.scene.add(this.sphere2);

		this.sphere2.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.sphere2MaterialColor } )
		));

		this.sphere2.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.sphere2WireframeColor } )
		));

		this.createSphere2Geometry();
	};

	Main.prototype.createSphere1Geometry = function() {
		let geometry = new THREE.SphereGeometry(properties.sphere1Radius, 16, 12);

		this.sphere1.children[0].geometry.dispose();
		this.sphere1.children[0].geometry = geometry;

		this.sphere1.children[1].geometry.dispose();
		this.sphere1.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createSphere2Geometry = function() {
		let geometry = new THREE.SphereGeometry(properties.sphere2Radius, 16, 12);

		this.sphere2.children[0].geometry.dispose();
		this.sphere2.children[0].geometry = geometry;

		this.sphere2.children[1].geometry.dispose();
		this.sphere2.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderSphere1 = this.gui.addFolder('Sphere 1 Properties');
		folderSphere1.addColor(properties, 'sphere1MaterialColor').onChange(function(value) {
			self.sphere1.children[0].material.color.set(value);
		});
		folderSphere1.addColor(properties, 'sphere1WireframeColor').onChange(function(value) {
			self.sphere1.children[1].material.color.set(value);
		});
		folderSphere1.add(properties, 'sphere1Radius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createSphere1Geometry();
		});
		folderSphere1.add(properties, 'sphere1PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.sphere1.position.x = value;
		});
		folderSphere1.add(properties, 'sphere1PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.sphere1.position.y = value;
		});
		folderSphere1.add(properties, 'sphere1PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.sphere1.position.z = value;
		});

		let folderSphere2 = this.gui.addFolder('Sphere 2 Properties');
		folderSphere2.addColor(properties, 'sphere2MaterialColor').onChange(function(value) {
			self.sphere2.children[0].material.color.set(value);
		});
		folderSphere2.addColor(properties, 'sphere2WireframeColor').onChange(function(value) {
			self.sphere2.children[1].material.color.set(value);
		});
		folderSphere2.add(properties, 'sphere2Radius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createSphere2Geometry();
		});
		folderSphere2.add(properties, 'sphere2PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.sphere2.position.x = value;
		});
		folderSphere2.add(properties, 'sphere2PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.sphere2.position.y = value;
		});
		folderSphere2.add(properties, 'sphere2PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.sphere2.position.z = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.update();

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.update = function() {
		rdo.helper.resetOutput();

		this.sphere1.children[0].geometry.computeBoundingSphere();
		this.boundingSphere1.copy(this.sphere1.children[0].geometry.boundingSphere).applyMatrix4(this.sphere1.matrixWorld);

		this.sphere2.children[0].geometry.computeBoundingSphere();
		this.boundingSphere2.copy(this.sphere2.children[0].geometry.boundingSphere).applyMatrix4(this.sphere2.matrixWorld);

		if (this.intersectSphere(this.boundingSphere1, this.boundingSphere2)) {
			rdo.helper.addOutput('HIT');
		}
	};

	Main.prototype.intersectSphere = function(bs1, bs2) {
		let distance = bs1.center.distanceTo(bs2.center);
		let sumRadius = bs1.radius + bs2.radius;

		return distance < sumRadius;
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