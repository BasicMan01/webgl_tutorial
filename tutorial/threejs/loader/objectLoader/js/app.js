import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', () => {
	const app = new App(document.getElementById('webGlCanvas'));

	document.getElementById('btnLoad').addEventListener('click', () => {
		app.loadObjectFromSessionStorage();
	});

	document.getElementById('btnSave').addEventListener('click', () => {
		app.saveObjectToSessionStorage();
	});
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._ambientLight = null;
		this._directionalLight = null;
		this._cube = null;
		this._gui = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'ambientColor': '#DDEEFF',
			'ambientIntensity': 1,
			'directionalColor': '#FFFFFF',
			'directionalIntensity': 1,
			'directionalPositionX': -20,
			'directionalPositionY': 50,
			'directionalPositionZ': 10,
			'cubeMaterialColor': '#156289',
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

	loadObjectFromSessionStorage() {
		const objectLoader = new THREE.ObjectLoader();
		const sessionStorageValue = sessionStorage.getItem('sceneObject');

		if (sessionStorageValue !== null) {
			try {
				const jsonCube = JSON.parse(sessionStorageValue);

				this._scene.remove(this._cube);

				objectLoader.parse(jsonCube, (object) => {
					this._cube = object;
					this._scene.add(this._cube);

					this._updateGui();
				});
			} catch(e) {
				console.error('Invalid JSON ' + sessionStorageValue);
			}
		} else {
			alert('no object to load');
		}
	}

	saveObjectToSessionStorage() {
		const jsonCube = this._cube.toJSON();

		sessionStorage.setItem('sceneObject', JSON.stringify(jsonCube));
	}

	_init() {
		this._createGui();
		this._createObject();
		this._createLights();

		this._render();
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._cube = new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshPhongMaterial( { color: this._properties.cubeMaterialColor } )
		);
		this._scene.add(this._cube);

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);

		this._cube.geometry.dispose();
		this._cube.geometry = geometry;
	}

	_createGui() {
		this._gui = new GUI({ width: 400 });

		this._gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		this._gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderLightProperties = this._gui.addFolder('Light Properties');
		folderLightProperties.addColor(this._properties, 'ambientColor').onChange((value) => {
			this._ambientLight.color.set(value);
		});
		folderLightProperties.add(this._properties, 'ambientIntensity', 0, 1).step(0.01).onChange((value) => {
			this._ambientLight.intensity = value;
		});

		folderLightProperties.addColor(this._properties, 'directionalColor').onChange((value) => {
			this._directionalLight.color.set(value);
		});
		folderLightProperties.add(this._properties, 'directionalIntensity', 0, 1).step(0.01).onChange((value) => {
			this._directionalLight.intensity = value;
		});
		folderLightProperties.add(this._properties, 'directionalPositionX', -100, 100).step(0.1).onChange((value) => {
			this._directionalLight.position.x = value;
		});
		folderLightProperties.add(this._properties, 'directionalPositionY', 0, 100).step(0.1).onChange((value) => {
			this._directionalLight.position.y = value;
		});
		folderLightProperties.add(this._properties, 'directionalPositionZ', -100, 100).step(0.1).onChange((value) => {
			this._directionalLight.position.z = value;
		});

		const folderMaterial = this._gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').listen().onChange((value) => {
			this._cube.material.color.set(value);
		});

		const folderTransformation = this._gui.addFolder('Cube Transformation');
		folderTransformation.add(this._properties, 'cubePositionX', -10, 10).step(0.1).listen().onChange((value) => {
			this._cube.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubePositionY', -10, 10).step(0.1).listen().onChange((value) => {
			this._cube.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubePositionZ', -10, 10).step(0.1).listen().onChange((value) => {
			this._cube.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).listen().onChange((value) => {
			this._cube.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).listen().onChange((value) => {
			this._cube.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).listen().onChange((value) => {
			this._cube.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleX', 0.1, 10).step(0.1).listen().onChange((value) => {
			this._cube.scale.x = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleY', 0.1, 10).step(0.1).listen().onChange((value) => {
			this._cube.scale.y = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleZ', 0.1, 10).step(0.1).listen().onChange((value) => {
			this._cube.scale.z = value;
		});

		this._gui.close();
	}

	_updateGui() {
		this._properties.cubeMaterialColor = '#' + this._cube.material.color.getHexString();
		this._properties.cubePositionX = this._cube.position.x;
		this._properties.cubePositionY = this._cube.position.y;
		this._properties.cubePositionZ = this._cube.position.z;
		this._properties.cubeRotationX = this._cube.rotation.x;
		this._properties.cubeRotationY = this._cube.rotation.y;
		this._properties.cubeRotationZ = this._cube.rotation.z;
		this._properties.cubeScaleX = this._cube.scale.x;
		this._properties.cubeScaleY = this._cube.scale.y;
		this._properties.cubeScaleZ = this._cube.scale.z;

		this._gui.controllers.forEach((object, index) => {
			object.updateDisplay();
		});
	}

	_createLights() {
		this._ambientLight = new THREE.AmbientLight(
			this._properties.ambientColor,
			this._properties.ambientIntensity
		);
		this._scene.add(this._ambientLight);

		this._directionalLight = new THREE.DirectionalLight(
			this._properties.directionalColor,
			this._properties.directionalIntensity
		);
		this._directionalLight.position.set(
			this._properties.directionalPositionX,
			this._properties.directionalPositionY,
			this._properties.directionalPositionZ
		);
		this._scene.add(this._directionalLight);
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
