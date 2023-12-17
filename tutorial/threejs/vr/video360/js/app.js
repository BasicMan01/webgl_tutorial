import * as THREE from 'three';

import { DeviceOrientationControls } from '../../../../../lib/threejs_158/examples/jsm/controls/DeviceOrientationControls.js';
import { VRButton } from '../../../../../lib/threejs_158/examples/jsm/webxr/VRButton.js';


document.addEventListener('DOMContentLoaded', () => {
	const canvasContainer = document.getElementById('webGlCanvas');
	const app = new App(canvasContainer);

	document.getElementById('btnPlay').style.border = 'none';
	document.getElementsByClassName('button-container')[0].style.top = (canvasContainer.offsetHeight / 3) + 'px';

	document.getElementById('btnPlay').addEventListener('click', (event) => {
		event.target.style.display = 'none';

		app.video.play();
	});
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._sphere = null;
		this._video = null;
		this._videoTexture = null;
		this._isMouseDown = false;
		this._lon = 0;
		this._lat = 0;
		this._phi = 0;
		this._theta = 0;
		this._mouseDownLon = 0;
		this._mouseDownLat = 0;
		this._mouseMoveStart = new THREE.Vector2();

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(75, this._getCameraAspect(), 0.1, 500);
		this._camera.target = new THREE.Vector3(0, 0, 0);
		//this._camera.layers.enable(1);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.xr.enabled = true;
		this._renderer.xr.setReferenceSpaceType('local');

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);
		this._canvas.appendChild(VRButton.createButton(this._renderer));

		this._onDeviceOrientationHandler = this._onDeviceOrientationHandler.bind(this);

		this._renderer.domElement.addEventListener('mousedown', this._onMouseDown.bind(this), false);
		this._renderer.domElement.addEventListener('mousemove', this._onMouseMove.bind(this), false);
		this._renderer.domElement.addEventListener('mouseup', this._onMouseUp.bind(this), false);

		window.addEventListener('deviceorientation', this._onDeviceOrientationHandler, false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);
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
		this._video = document.createElement('video');
		this._video.crossOrigin = 'anonymous';
		this._video.loop = true;
		this._video.muted = true;
		this._video.src = this._canvas.dataset.src;
		this._video.setAttribute('webkit-playsinline', 'webkit-playsinline');

		this._videoTexture = new THREE.VideoTexture(this._video);
		this._videoTexture.minFilter = THREE.LinearFilter;
		this._videoTexture.maxFilter = THREE.LinearFilter;
		this._videoTexture.format = THREE.RGBAFormat;

		this._sphere = new THREE.Mesh(
			this._getGeometry(),
			new THREE.MeshBasicMaterial({ map: this._videoTexture })
		);

		this._scene.add(this._sphere);
	}

	_getGeometry() {
		const geometry = new THREE.SphereGeometry(500, 60, 40);

		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);

		return geometry;
	}

	_render() {
		if (this._videoTexture) {
			this._videoTexture.update();
		}

		if (this._controls) {
			this._controls.update(this._clock.getDelta());
		} else {
			this._lat = Math.max(-85, Math.min(85, this._lat));
			this._phi = THREE.MathUtils.degToRad(90 - this._lat);
			this._theta = THREE.MathUtils.degToRad(this._lon);

			this._camera.position.x = 0.001 * Math.sin(this._phi) * Math.cos(this._theta);
			this._camera.position.y = 0.001 * Math.cos(this._phi);
			this._camera.position.z = 0.001 * Math.sin(this._phi) * Math.sin(this._theta);

			this._camera.lookAt(this._camera.target);
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

		this._controls = new DeviceOrientationControls(this._camera);
		this._controls.connect();
		this._controls.update();

		window.removeEventListener('deviceorientation', this._onDeviceOrientationHandler, false);
	}

	_onMouseDown(event) {
		event.preventDefault();

		this._isMouseDown = true;
		this._mouseMoveStart.set(event.clientX, event.clientY);

		this._mouseDownLon = this._lon;
		this._mouseDownLat = this._lat;
	}

	_onMouseMove(event) {
		if (this._isMouseDown) {
			this._lon = (this._mouseMoveStart.x - event.clientX) * 0.1 + this._mouseDownLon;
			this._lat = (this._mouseMoveStart.y - event.clientY) * 0.1 + this._mouseDownLat;
		}
	}

	_onMouseUp(event) {
		this._isMouseDown = false;
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	get video() {
		return this._video;
	}
}
