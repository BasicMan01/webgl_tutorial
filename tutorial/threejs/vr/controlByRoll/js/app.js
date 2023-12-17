import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { VRButton } from '../../../../../lib/threejs_158/examples/jsm/webxr/VRButton.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._cube = null;
		this._deviceOrientationData = null;
		this._currentScreenOrientation = window.orientation || 0;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cubeMaterialColor': '#156289',
			'cubeWireframeColor': '#FFFFFF',
			'cubePositionX': 0,
			'cubePositionY': 0,
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

		this._cameraGroup = new THREE.Group();
		this._cameraGroup.add(this._camera);
		this._cameraGroup.position.set(0, 1.7, 20);

		this._scene.add(this._cameraGroup);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.xr.enabled = true;

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);
		this._canvas.appendChild(VRButton.createButton(this._renderer));

		// https://kostasbariotis.com/removeeventlistener-and-this/
		this._deviceorientationHandler = this._onDeviceOrientationHandler.bind(this);
		this._orientationChangeHandler = this._onOrientationChangeHandler.bind(this);

		window.addEventListener('deviceorientation', this._deviceorientationHandler, true);
		window.addEventListener('orientationchange', this._orientationChangeHandler, false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		// For WebVR-Projects use this here
		this._renderer.setAnimationLoop(this._render.bind(this));
	}

	_createObject() {
		const geometry = new THREE.BoxGeometry(5, 5, 5);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._cube = new THREE.Object3D();
		this._scene.add(this._cube);

		this._cube.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cubeMaterialColor } )
		));

		this._cube.add(new THREE.LineSegments(
			geometry,
			new THREE.LineBasicMaterial( { color: this._properties.cubeWireframeColor } )
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

		const folderMaterial = gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').onChange((value) => {
			this._cube.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'cubeWireframeColor').onChange((value) => {
			this._cube.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Cube Transformation');
		folderTransformation.add(this._properties, 'cubePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.x = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.y = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.z = value;
		});

		gui.close();
	}

	_render() {
		const clockDelta = this._clock.getDelta();

		let betaSin = 0;

		if (this._deviceOrientationData !== null && this._deviceOrientationData.gamma) {
			betaSin = Math.sin(THREE.MathUtils.degToRad(this._deviceOrientationData.beta));
		}

		this._cameraGroup.position.x += betaSin * clockDelta * 15;
		this._cameraGroup.position.z -= clockDelta * 10;

		// reset camera position to start
		if (this._cameraGroup.position.z < -25) {
			this._cameraGroup.position.z = 25;
		}

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onDeviceOrientationHandler(event) {
		if (!event.alpha) {
			return;
		}

		this._deviceOrientationData = event;
	}

	_onOrientationChangeHandler(event) {
		this._currentScreenOrientation = window.orientation;
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
