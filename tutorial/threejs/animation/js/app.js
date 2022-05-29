import * as THREE from 'three';

import { GUI } from '../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../lib/threejs_140/examples/jsm/loaders/FBXLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._ambientLight = null;
		this._fbxModel = null;
		this._mixer = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'ambientColor': '#FFFFFF',
			'ambientIntensity': 1,
			'fbxModelMaterialColor': '#FFFFFF',
			'fbxModelPositionX': 0,
			'fbxModelPositionY': 0,
			'fbxModelPositionZ': 0,
			'fbxModelRotationX': 0,
			'fbxModelRotationY': 0,
			'fbxModelRotationZ': 0,
			'fbxModelScaleX': 1,
			'fbxModelScaleY': 1,
			'fbxModelScaleZ': 1,
			'fbxModelWireframe': false
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 10, 20);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.outputEncoding = THREE.sRGBEncoding;
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();
		this._createLight();
	}

	_createObject() {
		const fbxLoader = new FBXLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		fbxLoader.setResourcePath('../../../resources/texture/');
		fbxLoader.load('../../../resources/mesh/fbx/fbxAnimation.fbx', (object) => {
			this._fbxModel = object;

			this._scene.add(this._fbxModel);

			this._mixer = new THREE.AnimationMixer(this._fbxModel);

			this._render();
		}, this._onProgress, this._onError);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('FBX Model Geometry');
		folderGeometry.add(this._properties, 'fbxModelWireframe').onChange((value) => {
			this._fbxModel.getObjectByName('Police').material.wireframe = value;
		});

		const folderMaterial = gui.addFolder('FBX Model Material');
		folderMaterial.addColor(this._properties, 'fbxModelMaterialColor').onChange((value) => {
			this._fbxModel.getObjectByName('Police').material.color.set(value);
		});

		const folderTransformation = gui.addFolder('FBX Model Transformation');
		folderTransformation.add(this._properties, 'fbxModelPositionX', -10, 10).step(0.1).onChange((value) => {
			this._fbxModel.position.x = value;
		});
		folderTransformation.add(this._properties, 'fbxModelPositionY', -10, 10).step(0.1).onChange((value) => {
			this._fbxModel.position.y = value;
		});
		folderTransformation.add(this._properties, 'fbxModelPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._fbxModel.position.z = value;
		});
		folderTransformation.add(this._properties, 'fbxModelRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._fbxModel.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'fbxModelRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._fbxModel.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'fbxModelRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._fbxModel.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'fbxModelScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._fbxModel.scale.x = value;
		});
		folderTransformation.add(this._properties, 'fbxModelScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._fbxModel.scale.y = value;
		});
		folderTransformation.add(this._properties, 'fbxModelScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._fbxModel.scale.z = value;
		});

		gui.close();
	}

	_createLight() {
		this._ambientLight = new THREE.AmbientLight(
			this._properties.ambientColor,
			this._properties.ambientIntensity
		);
		this._scene.add(this._ambientLight);
	}

	_startClip(idx) {
		this._mixer.clipAction(this._fbxModel.animations[idx]).play();
	}

	_stopClip(idx) {
		this._mixer.clipAction(this._fbxModel.animations[idx]).stop();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._mixer.update(this._clock.getDelta());

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 49: { // 1
				event.preventDefault();
				this._startClip(1);
			} break;

			case 50: { // 2
				event.preventDefault();
				this._startClip(2);
			} break;
		}
	}

	_onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 49: { // 1
				event.preventDefault();
				this._stopClip(1);
			} break;

			case 50: { // 2
				event.preventDefault();
				this._stopClip(2);
			} break;
		}
	}

	_onError(xhr) {
		console.error(xhr);
	}

	_onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
