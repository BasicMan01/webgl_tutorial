import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { DeviceOrientationControls } from '../../../../../lib/threejs_158/examples/jsm/controls/DeviceOrientationControls.js';
import { FirstPersonControls } from '../../../../../lib/threejs_158/examples/jsm/controls/FirstPersonControls.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._circle = null;
		this._plane = null;
		this._raycaster = new THREE.Raycaster();
		this._mouseVector2 = new THREE.Vector2();

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 1.7, 0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._controls = new FirstPersonControls(this._camera, this._renderer.domElement);
		this._controls.lookSpeed = 0.05;
		this._controls.lookVertical = true;

		// https://kostasbariotis.com/removeeventlistener-and-this/
		this._deviceorientationHandler = this._onDeviceOrientationHandler.bind(this);

		window.addEventListener('click', this._onClickHandler.bind(this), false);
		window.addEventListener('deviceorientation', this._deviceorientationHandler, true);
		window.addEventListener('mousemove', this._onMouseMoveHandler.bind(this), false);
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
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._circle = new THREE.Mesh(
			new THREE.RingGeometry(0.15, 0.2, 25),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
		);

		this._circle.visible = false;
		this._circle.rotation.x = Math.PI / -2;

		this._scene.add(this._circle);


		this._plane = new  THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({ color: 0x156289, side: THREE.DoubleSide })
		);
		this._plane.rotation.x = Math.PI / -2;

		this._scene.add(this._plane);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._camera.position.y = 1.7;

		this._controls.update(this._clock.getDelta());

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onClickHandler(event) {
		if (this._circle.visible) {
			this._camera.position.x = this._circle.position.x;
			this._camera.position.z = this._circle.position.z;
		}
	}

	_onDeviceOrientationHandler(event) {
		if (!event.alpha) {
			return;
		}

		// Create controls for mobile.
		this._controls = new DeviceOrientationControls(this._camera, true);
		this._controls.connect();
		this._controls.update();

		window.removeEventListener('deviceorientation', this._deviceorientationHandler, true);
	}

	_onMouseMoveHandler(event) {
		this._mouseVector2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this._mouseVector2.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		this._raycaster.setFromCamera(this._mouseVector2, this._camera);

		const intersects = this._raycaster.intersectObject(this._plane);

		if (intersects.length > 0) {
			const circleCenter = new THREE.Vector3();

			circleCenter.copy(intersects[0].face.normal);
			circleCenter.applyMatrix4(new THREE.Matrix4().extractRotation(intersects[0].object.matrixWorld));
			// difference to the ground (height)
			circleCenter.multiplyScalar(0.01);
			circleCenter.add(intersects[0].point);

			// move the circel to the calculated intersection point
			this._circle.position.copy(circleCenter);
			this._circle.visible = true;
		} else {
			this._circle.visible = false;
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}

// TODO: renderer.domElement before controls
// TODO: ?Haircross
// TODO: instead of click use mouseUp => mouseDown + Move == intersect
