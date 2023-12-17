import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();

	document.getElementById('btnRewind').addEventListener('click', () => {
		document.getElementById('video').currentTime = 0;
	});

	document.getElementById('btnPlay').addEventListener('click', () => {
		document.getElementById('video').play();
	});

	document.getElementById('btnPause').addEventListener('click', () => {
		document.getElementById('video').pause();
	});

	document.getElementById('btnStop').addEventListener('click', () => {
		document.getElementById('video').pause();
		document.getElementById('video').currentTime = 0;
	});
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._plane = null;
		this._video = document.getElementById('video');
		this._videoTexture = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'planeWidth': 8,
			'planeHeight': 4,
			'planeMaterialColor': '#FFFFFF',
			'planePositionX': 0,
			'planePositionY': 0,
			'planePositionZ': 0,
			'planeRotationX': 0,
			'planeRotationY': 0,
			'planeRotationZ': 0,
			'planeScaleX': 1,
			'planeScaleY': 1
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
		this._initVideo();

		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._plane = new THREE.Object3D();
		this._scene.add(this._plane);

		this._videoTexture = new THREE.VideoTexture(this._video);
		this._videoTexture.minFilter = THREE.LinearFilter;
		this._videoTexture.magFilter = THREE.LinearFilter;

		this._plane.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.planeMaterialColor, map: this._videoTexture, side: THREE.DoubleSide } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.PlaneGeometry(
			this._properties.planeWidth,
			this._properties.planeHeight
		);

		this._plane.children[0].geometry.dispose();
		this._plane.children[0].geometry = geometry;
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Plane Geometry');
		folderGeometry.add(this._properties, 'planeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Plane Material');
		folderMaterial.addColor(this._properties, 'planeMaterialColor').onChange((value) => {
			this._plane.children[0].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Plane Transformation');
		folderTransformation.add(this._properties, 'planePositionX', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.x = value;
		});
		folderTransformation.add(this._properties, 'planePositionY', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.y = value;
		});
		folderTransformation.add(this._properties, 'planePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.z = value;
		});
		folderTransformation.add(this._properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'planeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scale.x = value;
		});
		folderTransformation.add(this._properties, 'planeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scale.y = value;
		});

		gui.close();
	}

	_initVideo() {
		this._video.src = '../../../../resources/video/video_1.mp4';
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		/*
			HAVE_NOTHING		0	No information is available about the media resource.
			HAVE_METADATA		1	Enough of the media resource has been retrieved that
									the metadata attributes are initialized. Seeking will no longer raise an exception.
			HAVE_CURRENT_DATA	2	Data is available for the current playback position,
									but not enough to actually play more than one frame.
			HAVE_FUTURE_DATA	3	Data for the current playback position as well as for at least a little
									bit of time into the future is available (in other words, at least two frames of video, for example).
			HAVE_ENOUGH_DATA	4	Enough data is available - and the download rate is high enough - that the media can
									be played through to the end without interruption.
		*/
		if (this._video.readyState === this._video.HAVE_ENOUGH_DATA) {
			if (this._videoTexture) {
				this._videoTexture.needsUpdate = true;
			}
		}

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
