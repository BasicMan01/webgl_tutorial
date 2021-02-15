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
		'cube1MaterialColor': '#156289',
		'cube1WireframeColor': '#FFFFFF',
		'cube1PositionX': -4,
		'cube1PositionY': 0,
		'cube1PositionZ': 0,
		'cube1RotationX': 0,
		'cube1RotationY': 0,
		'cube1RotationZ': 0,
		'cube1ScaleX': 1,
		'cube1ScaleY': 1,
		'cube1ScaleZ': 1,
		'cube2MaterialColor': '#891562',
		'cube2WireframeColor': '#FFFFFF',
		'cube2PositionX': 4,
		'cube2PositionY': 0,
		'cube2PositionZ': 0,
		'cube2RotationX': 0,
		'cube2RotationY': 0,
		'cube2RotationZ': 0,
		'cube2ScaleX': 1,
		'cube2ScaleY': 1,
		'cube2ScaleZ': 1
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

		this.bbCube1 = new THREE.Box3();
		this.bbCube2 = new THREE.Box3();
		this.cube1 = null;
		this.cube2 = null;
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
		let geometry = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.cube1 = new THREE.Object3D();
		this.cube1.position.set(properties.cube1PositionX, properties.cube1PositionY, properties.cube1PositionZ);
		this.scene.add(this.cube1);

		this.cube1.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: properties.cube1MaterialColor } )
		));

		this.cube1.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: properties.cube1WireframeColor } )
		));

		this.cube2 = new THREE.Object3D();
		this.cube2.position.set(properties.cube2PositionX, properties.cube2PositionY, properties.cube2PositionZ);
		this.scene.add(this.cube2);

		this.cube2.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: properties.cube2MaterialColor } )
		));

		this.cube2.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: properties.cube2WireframeColor } )
		));
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderCube1 = this.gui.addFolder('Cube 1 Properties');
		folderCube1.addColor(properties, 'cube1MaterialColor').onChange(function(value) {
			self.cube1.children[0].material.color.set(value);
		});
		folderCube1.addColor(properties, 'cube1WireframeColor').onChange(function(value) {
			self.cube1.children[1].material.color.set(value);
		});
		folderCube1.add(properties, 'cube1PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube1.position.x = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube1.position.y = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube1.position.z = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1RotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube1.rotation.x = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1RotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube1.rotation.y = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1RotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube1.rotation.z = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1ScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube1.scale.x = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1ScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube1.scale.y = value;
			self.update();
		});
		folderCube1.add(properties, 'cube1ScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube1.scale.z = value;
			self.update();
		});

		let folderCube2 = this.gui.addFolder('Cube 2 Properties');
		folderCube2.addColor(properties, 'cube2MaterialColor').onChange(function(value) {
			self.cube2.children[0].material.color.set(value);
		});
		folderCube2.addColor(properties, 'cube2WireframeColor').onChange(function(value) {
			self.cube2.children[1].material.color.set(value);
		});
		folderCube2.add(properties, 'cube2PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube2.position.x = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube2.position.y = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube2.position.z = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2RotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube2.rotation.x = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2RotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube2.rotation.y = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2RotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube2.rotation.z = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2ScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube2.scale.x = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2ScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube2.scale.y = value;
			self.update();
		});
		folderCube2.add(properties, 'cube2ScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube2.scale.z = value;
			self.update();
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.update();

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.update = function() {
		rdo.helper.resetOutput();

		this.cube1.children[0].geometry.computeBoundingBox();
		this.bbCube1.copy(this.cube1.children[0].geometry.boundingBox).applyMatrix4(this.cube1.matrixWorld);

		this.cube2.children[0].geometry.computeBoundingBox();
		this.bbCube2.copy(this.cube2.children[0].geometry.boundingBox).applyMatrix4(this.cube2.matrixWorld);

		if (this.intersectAABB(this.bbCube1, this.bbCube2)) {
			rdo.helper.addOutput('HIT');
		}
	};

	Main.prototype.intersectAABB = function(bb1, bb2) {
		return (
			(bb1.min.x <= bb2.max.x && bb1.max.x >= bb2.min.x) &&
			(bb1.min.y <= bb2.max.y && bb1.max.y >= bb2.min.y) &&
			(bb1.min.z <= bb2.max.z && bb1.max.z >= bb2.min.z)
		);
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