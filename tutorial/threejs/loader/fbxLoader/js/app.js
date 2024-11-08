import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../../lib/threejs_158/examples/jsm/loaders/FBXLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._hemisphereLight = null;
		this._fbxModel = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'hemisphereSkyColor': '#FFFFFF',
			'hemisphereGroundColor': '#303030',
			'hemisphereIntensity': 3.5,
			'fbxModelMaterialColor': '#E7E7E7',
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
		this._createLight();
	}

	_createObject() {
		const fbxLoader = new FBXLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		fbxLoader.setResourcePath('../../../../resources/texture/');
		fbxLoader.load('../../../../resources/mesh/fbx/cabinet.fbx', (object) => {
			this._fbxModel = object;
			this._fbxModel.getObjectByName('cabinet').material.color.set(this._properties.fbxModelMaterialColor);

			this._scene.add(this._fbxModel);

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
			this._fbxModel.getObjectByName('cabinet').material.wireframe = value;
		});

		const folderMaterial = gui.addFolder('FBX Model Material');
		folderMaterial.addColor(this._properties, 'fbxModelMaterialColor').onChange((value) => {
			this._fbxModel.getObjectByName('cabinet').material.color.set(value);
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
		this._hemisphereLight = new THREE.HemisphereLight(
			this._properties.hemisphereSkyColor,
			this._properties.hemisphereGroundColor,
			this._properties.hemisphereIntensity
		);
		this._scene.add(this._hemisphereLight);
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

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
