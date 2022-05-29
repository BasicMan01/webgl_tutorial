import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';

import HelperUtil from '../../../../../../resources/js/helperUtil.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._bbCube1 = new THREE.Box3();
		this._bbCube2 = new THREE.Box3();
		this._cube1 = null;
		this._cube2 = null;

		this._properties = {
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

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 10, 20);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		const geometry = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._cube1 = new THREE.Object3D();
		this._cube1.position.set(this._properties.cube1PositionX, this._properties.cube1PositionY, this._properties.cube1PositionZ);
		this._scene.add(this._cube1);

		this._cube1.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cube1MaterialColor } )
		));

		this._cube1.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: this._properties.cube1WireframeColor } )
		));

		this._cube2 = new THREE.Object3D();
		this._cube2.position.set(this._properties.cube2PositionX, this._properties.cube2PositionY, this._properties.cube2PositionZ);
		this._scene.add(this._cube2);

		this._cube2.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cube2MaterialColor } )
		));

		this._cube2.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: this._properties.cube2WireframeColor } )
		));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderCube1 = gui.addFolder('Cube 1 this._properties');
		folderCube1.addColor(this._properties, 'cube1MaterialColor').onChange((value) => {
			this._cube1.children[0].material.color.set(value);
		});
		folderCube1.addColor(this._properties, 'cube1WireframeColor').onChange((value) => {
			this._cube1.children[1].material.color.set(value);
		});
		folderCube1.add(this._properties, 'cube1PositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube1.position.x = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1PositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube1.position.y = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube1.position.z = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1RotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube1.rotation.x = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1RotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube1.rotation.y = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1RotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube1.rotation.z = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1ScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cube1.scale.x = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1ScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cube1.scale.y = value;
			this._update();
		});
		folderCube1.add(this._properties, 'cube1ScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cube1.scale.z = value;
			this._update();
		});

		const folderCube2 = gui.addFolder('Cube 2 this._properties');
		folderCube2.addColor(this._properties, 'cube2MaterialColor').onChange((value) => {
			this._cube2.children[0].material.color.set(value);
		});
		folderCube2.addColor(this._properties, 'cube2WireframeColor').onChange((value) => {
			this._cube2.children[1].material.color.set(value);
		});
		folderCube2.add(this._properties, 'cube2PositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube2.position.x = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2PositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube2.position.y = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube2.position.z = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2RotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube2.rotation.x = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2RotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube2.rotation.y = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2RotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube2.rotation.z = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2ScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cube2.scale.x = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2ScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cube2.scale.y = value;
			this._update();
		});
		folderCube2.add(this._properties, 'cube2ScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cube2.scale.z = value;
			this._update();
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._update();

		this._renderer.render(this._scene, this._camera);
	}

	_update() {
		HelperUtil.resetOutput();

		this._cube1.children[0].geometry.computeBoundingBox();
		this._bbCube1.copy(this._cube1.children[0].geometry.boundingBox).applyMatrix4(this._cube1.matrixWorld);

		this._cube2.children[0].geometry.computeBoundingBox();
		this._bbCube2.copy(this._cube2.children[0].geometry.boundingBox).applyMatrix4(this._cube2.matrixWorld);

		if (this._intersectAABB(this._bbCube1, this._bbCube2)) {
			HelperUtil.addOutput('HIT');
		}
	}

	_intersectAABB(bb1, bb2) {
		return (
			(bb1.min.x <= bb2.max.x && bb1.max.x >= bb2.min.x) &&
			(bb1.min.y <= bb2.max.y && bb1.max.y >= bb2.min.y) &&
			(bb1.min.z <= bb2.max.z && bb1.max.z >= bb2.min.z)
		);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
