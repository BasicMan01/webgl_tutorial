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
		this._cubicBezier3 = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cubicBezier3v1X': 0,
			'cubicBezier3v1Y': 0,
			'cubicBezier3v1Z': 0,
			'cubicBezier3v2X': 3,
			'cubicBezier3v2Y': 3,
			'cubicBezier3v2Z': 3,
			'cubicBezier3v3X': 6,
			'cubicBezier3v3Y': 3,
			'cubicBezier3v3Z': 6,
			'cubicBezier3v4X': 9,
			'cubicBezier3v4Y': 0,
			'cubicBezier3v4Z': 9,
			'cubicBezier3Points': 3,
			'cubicBezier3Color': '#FFFFFF',
			'cubicBezier3PositionX': 0,
			'cubicBezier3PositionY': 0,
			'cubicBezier3PositionZ': 0,
			'cubicBezier3RotationX': 0,
			'cubicBezier3RotationY': 0,
			'cubicBezier3RotationZ': 0,
			'cubicBezier3ScaleX': 1,
			'cubicBezier3ScaleY': 1,
			'cubicBezier3ScaleZ': 1
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

		this._cubicBezier3 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.cubicBezier3Color } )
		);
		this._scene.add(this._cubicBezier3);

		this._createGeometry();
	}

	_createGeometry() {
		const curve = new THREE.CubicBezierCurve3(
			new THREE.Vector3(this._properties.cubicBezier3v1X, this._properties.cubicBezier3v1Y, this._properties.cubicBezier3v1Z),
			new THREE.Vector3(this._properties.cubicBezier3v2X, this._properties.cubicBezier3v2Y, this._properties.cubicBezier3v2Z),
			new THREE.Vector3(this._properties.cubicBezier3v3X, this._properties.cubicBezier3v3Y, this._properties.cubicBezier3v3Z),
			new THREE.Vector3(this._properties.cubicBezier3v4X, this._properties.cubicBezier3v4Y, this._properties.cubicBezier3v4Z)
		);

		this._cubicBezier3.geometry.dispose();
		this._cubicBezier3.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.cubicBezier3Points));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Cubic Bezier Curve');
		folderGeometry.add(this._properties, 'cubicBezier3v1X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v1Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v1Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v2X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v2Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v2Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v3X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v3Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v3Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v4X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v4Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3v4Z', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubicBezier3Points', 3, 50).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cubic Bezier Material');
		folderMaterial.addColor(this._properties, 'cubicBezier3Color').onChange((value) => {
			this._cubicBezier3.material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Cubic Bezier Transformation');
		folderTransformation.add(this._properties, 'cubicBezier3PositionX', -10, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3PositionY', -10, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3RotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cubicBezier3.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3RotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cubicBezier3.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3RotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cubicBezier3.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3ScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.scale.x = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3ScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.scale.y = value;
		});
		folderTransformation.add(this._properties, 'cubicBezier3ScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cubicBezier3.scale.z = value;
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
