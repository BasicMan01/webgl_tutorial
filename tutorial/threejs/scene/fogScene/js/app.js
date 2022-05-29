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
		this._hemisphereLight = null;
		this._cube = null;
		this._plane = null;

		this._properties = {
			'fogColor': '#FFFFFF',
			'fogNear': 0.1,
			'fogFar': 35,
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
		this._createFog();
		this._createObject();
		this._createLight();

		this._render();
	}

	_createFog() {
		this._scene.fog = new THREE.Fog(
			this._properties.fogColor,
			this._properties.fogNear,
			this._properties.fogFar
		);
	}

	_createObject() {
		this._plane = new THREE.Mesh(
			new THREE.PlaneGeometry(50, 50, 50, 50),
			new THREE.MeshPhongMaterial( { color: 0xAAAAAA, side: THREE.DoubleSide } )
		);
		this._plane.rotation.x = Math.PI / 2;
		this._scene.add(this._plane);

		this._cube = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),
			new THREE.MeshPhongMaterial( { color: 0xFFFFFF } )
		);
		this._scene.add(this._cube);
	}

	_createGui() {
		const gui = new GUI();

		const folderProperties = gui.addFolder('Fog Properties');
		folderProperties.addColor(this._properties, 'fogColor').onChange((value) => {
			this._scene.fog.color.set(value);
		});
		folderProperties.add(this._properties, 'fogNear', 0.1, 50).step(0.1).onChange((value) => {
			this._scene.fog.near = value;
		});
		folderProperties.add(this._properties, 'fogFar', 0.1, 50).step(0.1).onChange((value) => {
			this._scene.fog.far = value;
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

	_createLight() {
		this._hemisphereLight = new THREE.HemisphereLight(0xDDEEFF, 0x0F0E0D, 0.5);
		this._scene.add(this._hemisphereLight);
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

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
