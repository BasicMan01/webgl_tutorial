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
		this._cameraGroup = null;
		this._cube = null;
		this._plane = null;
		this._raycaster = new THREE.Raycaster();
		this._mouseVector2 = new THREE.Vector2();
		this._rotateY = new THREE.Vector3();

		this._keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		};

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false,
			'cubeMaterialColor': '#891562',
			'cubeWireframeColor': '#FFFFFF',
			'cubePositionX': 0,
			'cubePositionY': 1.5,
			'cubePositionZ': 0,
			'cubeRotationX': 0,
			'cubeRotationY': 0,
			'cubeRotationZ': 0,
			'cubeScaleX': 1,
			'cubeScaleY': 1,
			'cubeScaleZ': 1
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 1.7, 5);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = true;
		this._controls.target = new THREE.Vector3(0, 1.7, 0);
		this._controls.update();

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		const geometry = new THREE.BoxGeometry(0.7, 1.8, 0.3, 1, 1, 1);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._cube = new THREE.Object3D();
		this._cube.position.set(0, 0.9, 0);
		this._scene.add(this._cube);

		this._cube.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cubeMaterialColor } )
		));

		this._cube.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: this._properties.cubeWireframeColor } )
		));

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

		this._camera.getWorldDirection(this._rotateY);
		this._rotateY.y = 0;

		this.n = this._rotateY.normalize().clone().multiplyScalar(this._clock.getDelta());

		this._rotateY.add(this._cube.position);

		// cube look at the same direction as camera
		this._cube.lookAt(this._rotateY);

		if (this._keyStatus[87]) {
			this._cube.position.add(this.n);
			this._camera.position.add(this.n);
		}

		// orbit controls rotate around new cube position
		this._controls.target.copy(new THREE.Vector3(this._cube.position.x, 1.7, this._cube.position.z));
		this._controls.update();

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this._keyStatus[event.keyCode] = true;
			} break;
		}
	}

	_onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this._keyStatus[event.keyCode] = false;
			} break;
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
