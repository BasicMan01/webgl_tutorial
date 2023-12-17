import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../../../../../lib/threejs_158/examples/jsm/loaders/GLTFLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._hemisphereLight = null;
		this._gltfModel = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'hemisphereSkyColor': '#FFFFFF',
			'hemisphereGroundColor': '#303030',
			'hemisphereIntensity': 3.5,
			'gltfModelMaterialColor': '#FFFFFF',
			'gltfModelPositionX': 0,
			'gltfModelPositionY': 0,
			'gltfModelPositionZ': 0,
			'gltfModelRotationX': 0,
			'gltfModelRotationY': 0,
			'gltfModelRotationZ': 0,
			'gltfModelScaleX': 1,
			'gltfModelScaleY': 1,
			'gltfModelScaleZ': 1,
			'gltfModelWireframe': false
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

		this._render();
	}

	_createObject() {
		const gltfLoader = new GLTFLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		gltfLoader.setResourcePath('../../../../resources/texture/');
		gltfLoader.load('../../../../resources/mesh/gltf/cabinet.glb', (object) => {
			this._gltfModel = object.scene;
			this._gltfModel.getObjectByName('cabinet').material.color.set(this._properties.fbxModelMaterialColor);

			this._scene.add(this._gltfModel);
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

		const folderGeometry = gui.addFolder('GLTF Model Geometry');
		folderGeometry.add(this._properties, 'gltfModelWireframe').onChange((value) => {
			this._gltfModel.getObjectByName('cabinet').material.wireframe = value;
		});

		const folderMaterial = gui.addFolder('GLTF Model Material');
		folderMaterial.addColor(this._properties, 'gltfModelMaterialColor').onChange((value) => {
			this._gltfModel.getObjectByName('cabinet').material.color.set(value);
		});

		const folderTransformation = gui.addFolder('GLTF Model Transformation');
		folderTransformation.add(this._properties, 'gltfModelPositionX', -10, 10).step(0.1).onChange((value) => {
			this._gltfModel.position.x = value;
		});
		folderTransformation.add(this._properties, 'gltfModelPositionY', -10, 10).step(0.1).onChange((value) => {
			this._gltfModel.position.y = value;
		});
		folderTransformation.add(this._properties, 'gltfModelPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._gltfModel.position.z = value;
		});
		folderTransformation.add(this._properties, 'gltfModelRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._gltfModel.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'gltfModelRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._gltfModel.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'gltfModelRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._gltfModel.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'gltfModelScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._gltfModel.scale.x = value;
		});
		folderTransformation.add(this._properties, 'gltfModelScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._gltfModel.scale.y = value;
		});
		folderTransformation.add(this._properties, 'gltfModelScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._gltfModel.scale.z = value;
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
