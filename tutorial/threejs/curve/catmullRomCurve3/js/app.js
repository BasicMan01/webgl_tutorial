import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._catmullRom3 = null;
		this._catmullRom3Geometry = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'catmullRom3Points': 200,
			'catmullRom3Color': '#FFFFFF',
			'catmullRom3PositionX': 0,
			'catmullRom3PositionY': 0,
			'catmullRom3PositionZ': 0,
			'catmullRom3RotationX': 0,
			'catmullRom3RotationY': 0,
			'catmullRom3RotationZ': 0,
			'catmullRom3ScaleX': 1,
			'catmullRom3ScaleY': 1,
			'catmullRom3ScaleZ': 1
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
		const fileLoader = new THREE.FileLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._catmullRom3 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.catmullRom3Color } )
		);
		this._scene.add(this._catmullRom3);

		fileLoader.load('../../../../resources/mesh/catmullRom/catmullRom.json', (json) => {
			try {
				const pathPointsCollection = [];
				const pathPointsJson = JSON.parse(json).data;

				for (let i = 0; i < pathPointsJson.length; ++i) {
					pathPointsCollection.push(new THREE.Vector3(pathPointsJson[i].x, pathPointsJson[i].y, pathPointsJson[i].z));
				}

				this._catmullRom3Geometry = new THREE.CatmullRomCurve3(pathPointsCollection, true);

				this._createGeometry();

				this._render();
			} catch(e) {
				console.error(e);
			}
		}, this._onProgress, this._onError);
	}

	_createGeometry() {
		const points = this._catmullRom3Geometry.getPoints(this._properties.catmullRom3Points);

		this._catmullRom3.geometry.dispose();
		this._catmullRom3.geometry = new THREE.BufferGeometry().setFromPoints(points);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Catmull Rom Curve');
		folderGeometry.add(this._properties, 'catmullRom3Points', 50, 300).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Catmull Rom Material');
		folderMaterial.addColor(this._properties, 'catmullRom3Color').onChange((value) => {
			this._catmullRom3.material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Catmull Rom Transformation');
		folderTransformation.add(this._properties, 'catmullRom3PositionX', -10, 10).step(0.1).onChange((value) => {
			this._catmullRom3.position.x = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3PositionY', -10, 10).step(0.1).onChange((value) => {
			this._catmullRom3.position.y = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3PositionZ', -10, 10).step(0.1).onChange((value) => {
			this._catmullRom3.position.z = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3RotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._catmullRom3.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3RotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._catmullRom3.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3RotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._catmullRom3.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3ScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._catmullRom3.scale.x = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3ScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._catmullRom3.scale.y = value;
		});
		folderTransformation.add(this._properties, 'catmullRom3ScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._catmullRom3.scale.z = value;
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
