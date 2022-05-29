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
		this._ellipseCurve = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'ellipseCurveCenterX': 0,
			'ellipseCurveCenterY': 0,
			'ellipseCurveRadiusX': 5,
			'ellipseCurveRadiusY': 5,
			'ellipseCurveStartAngle': 0,
			'ellipseCurveEndAngle': 2 * Math.PI,
			'ellipseCurveClockwise': false,
			'ellipseCurveRotation': 0,
			'ellipseCurvePoints': 25,
			'ellipseCurveColor': '#FFFFFF',
			'ellipseCurvePositionX': 0,
			'ellipseCurvePositionY': 0,
			'ellipseCurvePositionZ': 0,
			'ellipseCurveRotationX': 0,
			'ellipseCurveRotationY': 0,
			'ellipseCurveRotationZ': 0,
			'ellipseCurveScaleX': 1,
			'ellipseCurveScaleY': 1
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

		this._ellipseCurve = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.ellipseCurveColor } )
		);
		this._scene.add(this._ellipseCurve);

		this._createGeometry();
	}

	_createGeometry() {
		const curve = new THREE.EllipseCurve(
			this._properties.ellipseCurveCenterX,
			this._properties.ellipseCurveCenterY,
			this._properties.ellipseCurveRadiusX,
			this._properties.ellipseCurveRadiusY,
			this._properties.ellipseCurveStartAngle,
			this._properties.ellipseCurveEndAngle,
			this._properties.ellipseCurveClockwise,
			this._properties.ellipseCurveRotation
		);

		this._ellipseCurve.geometry.dispose();
		this._ellipseCurve.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.ellipseCurvePoints));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Ellipse Curve');
		folderGeometry.add(this._properties, 'ellipseCurveCenterX', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveCenterY', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveRadiusX', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveRadiusY', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveStartAngle', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveEndAngle', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveClockwise').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurveRotation', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ellipseCurvePoints', 3, 50).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Ellipse Curve Material');
		folderMaterial.addColor(this._properties, 'ellipseCurveColor').onChange((value) => {
			this._ellipseCurve.material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Ellipse Curve Transformation');
		folderTransformation.add(this._properties, 'ellipseCurvePositionX', -10, 10).step(0.1).onChange((value) => {
			this._ellipseCurve.position.x = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurvePositionY', -10, 10).step(0.1).onChange((value) => {
			this._ellipseCurve.position.y = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurvePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._ellipseCurve.position.z = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurveRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ellipseCurve.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurveRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ellipseCurve.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurveRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ellipseCurve.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurveScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._ellipseCurve.scale.x = value;
		});
		folderTransformation.add(this._properties, 'ellipseCurveScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._ellipseCurve.scale.y = value;
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
