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
		this._boundingSphere1 = new THREE.Sphere();
		this._boundingSphere2 = new THREE.Sphere();
		this._sphere1 = null;
		this._sphere2 = null;

		this._properties = {
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
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);


		this._sphere1 = new THREE.Object3D();
		this._sphere1.position.set(this._properties.sphere1PositionX, this._properties.sphere1PositionY, this._properties.sphere1PositionZ);
		this._scene.add(this._sphere1);

		this._sphere1.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.sphere1MaterialColor } )
		));

		this._sphere1.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.sphere1WireframeColor } )
		));

		this._createSphere1Geometry();


		this._sphere2 = new THREE.Object3D();
		this._sphere2.position.set(this._properties.sphere2PositionX, this._properties.sphere2PositionY, this._properties.sphere2PositionZ);
		this._scene.add(this._sphere2);

		this._sphere2.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.sphere2MaterialColor } )
		));

		this._sphere2.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.sphere2WireframeColor } )
		));

		this._createSphere2Geometry();
	}

	_createSphere1Geometry() {
		const geometry = new THREE.SphereGeometry(this._properties.sphere1Radius, 16, 12);

		this._sphere1.children[0].geometry.dispose();
		this._sphere1.children[0].geometry = geometry;

		this._sphere1.children[1].geometry.dispose();
		this._sphere1.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createSphere2Geometry() {
		const geometry = new THREE.SphereGeometry(this._properties.sphere2Radius, 16, 12);

		this._sphere2.children[0].geometry.dispose();
		this._sphere2.children[0].geometry = geometry;

		this._sphere2.children[1].geometry.dispose();
		this._sphere2.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderSphere1 = gui.addFolder('Sphere 1 this._properties');
		folderSphere1.addColor(this._properties, 'sphere1MaterialColor').onChange((value) => {
			this._sphere1.children[0].material.color.set(value);
		});
		folderSphere1.addColor(this._properties, 'sphere1WireframeColor').onChange((value) => {
			this._sphere1.children[1].material.color.set(value);
		});
		folderSphere1.add(this._properties, 'sphere1Radius', 0.1, 10).step(0.1).onChange((value) => {
			this._createSphere1Geometry();
		});
		folderSphere1.add(this._properties, 'sphere1PositionX', -10, 10).step(0.1).onChange((value) => {
			this._sphere1.position.x = value;
		});
		folderSphere1.add(this._properties, 'sphere1PositionY', -10, 10).step(0.1).onChange((value) => {
			this._sphere1.position.y = value;
		});
		folderSphere1.add(this._properties, 'sphere1PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._sphere1.position.z = value;
		});

		const folderSphere2 = gui.addFolder('Sphere 2 this._properties');
		folderSphere2.addColor(this._properties, 'sphere2MaterialColor').onChange((value) => {
			this._sphere2.children[0].material.color.set(value);
		});
		folderSphere2.addColor(this._properties, 'sphere2WireframeColor').onChange((value) => {
			this._sphere2.children[1].material.color.set(value);
		});
		folderSphere2.add(this._properties, 'sphere2Radius', 0.1, 10).step(0.1).onChange((value) => {
			this._createSphere2Geometry();
		});
		folderSphere2.add(this._properties, 'sphere2PositionX', -10, 10).step(0.1).onChange((value) => {
			this._sphere2.position.x = value;
		});
		folderSphere2.add(this._properties, 'sphere2PositionY', -10, 10).step(0.1).onChange((value) => {
			this._sphere2.position.y = value;
		});
		folderSphere2.add(this._properties, 'sphere2PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._sphere2.position.z = value;
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

		this._sphere1.children[0].geometry.computeBoundingSphere();
		this._boundingSphere1.copy(this._sphere1.children[0].geometry.boundingSphere).applyMatrix4(this._sphere1.matrixWorld);

		this._sphere2.children[0].geometry.computeBoundingSphere();
		this._boundingSphere2.copy(this._sphere2.children[0].geometry.boundingSphere).applyMatrix4(this._sphere2.matrixWorld);

		if (this._intersectSphere(this._boundingSphere1, this._boundingSphere2)) {
			HelperUtil.addOutput('HIT');
		}
	}

	_intersectSphere(bs1, bs2) {
		const distance = bs1.center.distanceTo(bs2.center);
		const sumRadius = bs1.radius + bs2.radius;

		return distance < sumRadius;
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
