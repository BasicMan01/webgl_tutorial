import * as THREE from 'three';

import { DeviceOrientationControls } from '../../../../../lib/threejs_158/examples/jsm/controls/DeviceOrientationControls.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { VRButton } from '../../../../../lib/threejs_158/examples/jsm/webxr/VRButton.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._sphere = null;
		this._texture = null;

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(75, this._getCameraAspect(), 0.1, 500);
		this._camera.target = new THREE.Vector3(0, 0, 0);
		this._camera.position.set(5, 0, 0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.xr.enabled = true;
		this._renderer.xr.setReferenceSpaceType('local');

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enableDamping = true;
		this._controls.dampingFactor = 0.2;
		this._controls.enableZoom = false;
		this._controls.rotateSpeed = -0.2;

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);
		this._canvas.appendChild(VRButton.createButton(this._renderer));

		this._onDeviceOrientationHandler = this._onDeviceOrientationHandler.bind(this);

		window.addEventListener('deviceorientation', this._onDeviceOrientationHandler, false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);
		window.addEventListener('wheel', this._onMouseWheel.bind(this), false);
		window.addEventListener('vrdisplaypresentchange', (event) => {
			// Maintain viewing direction when switching to VR and back
			if (event.display.isPresenting){
				this._controls.enabled = false;
			}
		}, false);

		this._init();
	}

	_init() {
		this._createObject();

		// For WebVR-Projects use this here
		this._renderer.setAnimationLoop(this._render.bind(this));
	}

	_createObject() {
		this._texture = new THREE.TextureLoader().load( "../../../../resources/texture/image360_4k.jpg");

		this._sphere = new THREE.Mesh(
			new THREE.SphereGeometry(100, 60, 40),
			new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: this._texture })
		);

		this._scene.add(this._sphere);
	}

	_render() {
		this._controls.update(this._clock.getDelta());

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onDeviceOrientationHandler(event) {
		if (!event.alpha) {
			return;
		}

		this._controls = new DeviceOrientationControls(this._camera);
		this._controls.connect();
		this._controls.update();

		window.removeEventListener('deviceorientation', this._onDeviceOrientationHandler, false);
	}

	_onMouseWheel(event) {
		const fov = this._camera.fov + event.deltaY * 0.01;

		this._camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
		this._camera.updateProjectionMatrix();
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
