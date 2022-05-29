import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._quadraticBezier3 = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'quadraticBezier3v1X': 0,
			'quadraticBezier3v1Y': 0,
			'quadraticBezier3v1Z': 0,
			'quadraticBezier3v2X': 3,
			'quadraticBezier3v2Y': 3,
			'quadraticBezier3v2Z': 3,
			'quadraticBezier3v3X': 5,
			'quadraticBezier3v3Y': 0,
			'quadraticBezier3v3Z': 5,
			'quadraticBezier3Points': 2,
			'quadraticBezier3Color': '#FFFFFF',
			'quadraticBezier3PositionX': 0,
			'quadraticBezier3PositionY': 0,
			'quadraticBezier3PositionZ': 0,
			'quadraticBezier3RotationX': 0,
			'quadraticBezier3RotationY': 0,
			'quadraticBezier3RotationZ': 0,
			'quadraticBezier3ScaleX': 1,
			'quadraticBezier3ScaleY': 1,
			'quadraticBezier3ScaleZ': 1
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

		this._quadraticBezier3 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.quadraticBezier3Color } )
		);
		this._scene.add(this._quadraticBezier3);

		this._createGeometry();
	}

	_createGeometry() {
		const curve = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(this._properties.quadraticBezier3v1X, this._properties.quadraticBezier3v1Y, this._properties.quadraticBezier3v1Z),
			new THREE.Vector3(this._properties.quadraticBezier3v2X, this._properties.quadraticBezier3v2Y, this._properties.quadraticBezier3v2Z),
			new THREE.Vector3(this._properties.quadraticBezier3v3X, this._properties.quadraticBezier3v3Y, this._properties.quadraticBezier3v3Z)
		);

		this._quadraticBezier3.geometry.dispose();
		this._quadraticBezier3.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.quadraticBezier3Points));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Quadratic Bezier Curve');
		folderGeometry.add(this._properties, 'quadraticBezier3v1X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v1Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v1Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v2X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v2Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v2Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v3X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v3Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3v3Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'quadraticBezier3Points', 2, 50).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Quadratic Bezier Material');
		folderMaterial.addColor(this._properties, 'quadraticBezier3Color').onChange((value) => {
			this._quadraticBezier3.material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Quadratic Bezier Transformation');
		folderTransformation.add(this._properties, 'quadraticBezier3PositionX', -10, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.position.x = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3PositionY', -10, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.position.y = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.position.z = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3RotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._quadraticBezier3.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3RotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._quadraticBezier3.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3RotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._quadraticBezier3.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3ScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.scale.x = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3ScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.scale.y = value;
		});
		folderTransformation.add(this._properties, 'quadraticBezier3ScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._quadraticBezier3.scale.z = value;
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._renderer.render(this._scene, this._camera);
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
