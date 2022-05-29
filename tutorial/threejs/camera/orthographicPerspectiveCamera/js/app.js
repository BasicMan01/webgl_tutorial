import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';

import HelperUtil from '../../../../../resources/js/helperUtil.js';


document.addEventListener('DOMContentLoaded', () => {
	const app = new App(document.getElementById('webGlCanvas'));

	document.getElementById('btnCamera').addEventListener('click', () => {
		app.switchCameraType();
	});

	document.getElementById('btnTop').addEventListener('click', () => {
		app.switchCameraView('Top');
	});

	document.getElementById('btnBottom').addEventListener('click', () => {
		app.switchCameraView('Bottom');
	});

	document.getElementById('btnLeft').addEventListener('click', () => {
		app.switchCameraView('Left');
	});

	document.getElementById('btnRight').addEventListener('click', () => {
		app.switchCameraView('Right');
	});

	document.getElementById('btnFront').addEventListener('click', () => {
		app.switchCameraView('Front');
	});

	document.getElementById('btnBack').addEventListener('click', () => {
		app.switchCameraView('Back');
	});
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._cone = null;
		this._cube = null;
		this._sphere = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'coneMaterialColor': '#156289',
			'coneWireframeColor': '#FFFFFF',
			'cubeMaterialColor': '#156289',
			'cubeWireframeColor': '#FFFFFF',
			'sphereMaterialColor': '#156289',
			'sphereWireframeColor': '#FFFFFF',
			'conePositionX': 0,
			'conePositionY': 0,
			'conePositionZ': 2.5,
			'cubePositionX': 0,
			'cubePositionY': 0,
			'cubePositionZ': 0,
			'spherePositionX': 2.5,
			'spherePositionY': 0,
			'spherePositionZ': 0,
			'wireframe': false
		};

		this._scene = new THREE.Scene();

		this._cameraPersp = new THREE.PerspectiveCamera(25, this._getCameraAspect(), 0.1, 500);
		this._cameraOrtho = new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 500);

		this._camera = {};
		this._camera.type = 'Perspective';
		this._camera.view = 'User';
		this._camera.object = this._cameraPersp;
		this._camera.object.position.set(30, 20, 10);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera.object, this._renderer.domElement);
		// TODO: create event type only for rotation
		this._controls.addEventListener('start', this._onStartOrbitControls.bind(this));

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
		this._output();
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);


		this._cone = new THREE.Object3D();
		this._cone.position.set(this._properties.conePositionX, this._properties.conePositionY, this._properties.conePositionZ);

		this._cone.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.coneMaterialColor } )
		));

		this._cone.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.coneWireframeColor } )
		));

		this._cube = new THREE.Object3D();
		this._cube.position.set(this._properties.cubePositionX, this._properties.cubePositionY, this._properties.cubePositionZ);

		this._cube.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.cubeMaterialColor } )
		));

		this._cube.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.cubeWireframeColor } )
		));

		this._sphere = new THREE.Object3D();
		this._sphere.position.set(this._properties.spherePositionX, this._properties.spherePositionY, this._properties.spherePositionZ);

		this._sphere.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.sphereMaterialColor } )
		));

		this._sphere.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.sphereWireframeColor } )
		));

		this._scene.add(this._cone);
		this._scene.add(this._cube);
		this._scene.add(this._sphere);

		this._createGeometry();
	}

	_createGeometry() {
		const geometryCone = new THREE.ConeGeometry(2.5, 5, 32);
		const geometryCube = new THREE.BoxGeometry(5, 5, 5);
		const geometrySphere = new THREE.SphereGeometry(2.5, 32, 32);

		this._cone.children[0].geometry.dispose();
		this._cone.children[0].geometry = geometryCone;
		this._cone.children[1].geometry.dispose();
		this._cone.children[1].geometry = new THREE.WireframeGeometry(geometryCone);

		this._cube.children[0].geometry.dispose();
		this._cube.children[0].geometry = geometryCube;
		this._cube.children[1].geometry.dispose();
		this._cube.children[1].geometry = new THREE.WireframeGeometry(geometryCube);

		this._sphere.children[0].geometry.dispose();
		this._sphere.children[0].geometry = geometrySphere;
		this._sphere.children[1].geometry.dispose();
		this._sphere.children[1].geometry = new THREE.WireframeGeometry(geometrySphere);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Geometry');
		folderGeometry.add(this._properties, 'wireframe').onChange((value) => {
			this._cone.children[0].visible = !value;
			this._cube.children[0].visible = !value;
			this._sphere.children[0].visible = !value;
		});

		const folderMaterial = gui.addFolder('Material');
		folderMaterial.addColor(this._properties, 'coneMaterialColor').onChange((value) => {
			this._cone.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'coneWireframeColor').onChange((value) => {
			this._cone.children[1].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').onChange((value) => {
			this._cube.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'cubeWireframeColor').onChange((value) => {
			this._cube.children[1].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'sphereMaterialColor').onChange((value) => {
			this._sphere.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'sphereWireframeColor').onChange((value) => {
			this._sphere.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Transformation');
		folderTransformation.add(this._properties, 'conePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.x = value;
		});
		folderTransformation.add(this._properties, 'conePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.y = value;
		});
		folderTransformation.add(this._properties, 'conePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.z = value;
		});
		folderTransformation.add(this._properties, 'spherePositionX', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.x = value;
		});
		folderTransformation.add(this._properties, 'spherePositionY', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.y = value;
		});
		folderTransformation.add(this._properties, 'spherePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.z = value;
		});

		gui.close();
	}

	_output() {
		HelperUtil.resetOutput();
		HelperUtil.addOutput(this._camera.view + ' ' + this._camera.type);
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._controls.update();

		this._renderer.render(this._scene, this._controls.object);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }


	_onStartOrbitControls() {
		this._camera.view = 'User';
		this._output();
	}

	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 97: { // 1
				event.preventDefault();

				if (event.ctrlKey) {
					this.switchCameraView('Back');
				} else {
					this.switchCameraView('Front');
				}
			} break;

			case 99: { // 3
				event.preventDefault();

				if (event.ctrlKey) {
					this.switchCameraView('Right');
				} else {
					this.switchCameraView('Left');
				}
			} break;

			case 101: { // 5
				this.switchCameraType();
			} break;

			case 103: { // 7
				event.preventDefault();

				if (event.ctrlKey) {
					this.switchCameraView('Bottom');
				} else {
					this.switchCameraView('Top');
				}
			} break;
		}
	}

	_onResizeHandler(event) {
		this._camera.object.aspect = this._getCameraAspect();
		this._camera.object.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	switchCameraType() {
		if (this._controls.object.type === 'OrthographicCamera') {
			this._cameraPersp.position.copy(this._controls.object.position);
			this._cameraPersp.rotation.copy(this._controls.object.rotation);
			this._cameraPersp.zoom = this._controls.object.zoom;

			this._camera.type = 'Perspective';
			this._camera.object = this._cameraPersp;
		} else {
			this._cameraOrtho.position.copy(this._controls.object.position);
			this._cameraOrtho.rotation.copy(this._controls.object.rotation);
			this._cameraOrtho.zoom = this._controls.object.zoom;

			// use FOV
			const halfY = Math.tan(25 / 2 * Math.PI / 180);
			const top = this._cameraOrtho.position.length() * halfY;
			const right = top * this._getCameraAspect();

			this._cameraOrtho.right = right;
			this._cameraOrtho.left = -right;
			this._cameraOrtho.top = top;
			this._cameraOrtho.bottom = -top;

			this._camera.type = 'Orthographic';
			this._camera.object = this._cameraOrtho;
		}

		this._camera.object.updateProjectionMatrix();

		this._controls.object = this._camera.object;
		this._controls.update();

		this._output();
	}

	switchCameraView(value) {
		switch (value) {
			case 'Back': {
				this._controls.object.position.copy(new THREE.Vector3(0, 0, -50));
			} break;

			case 'Front': {
				this._controls.object.position.copy(new THREE.Vector3(0, 0, 50));
			} break;

			case 'Right': {
				this._controls.object.position.copy(new THREE.Vector3(-50, 0, 0));
			} break;

			case 'Left': {
				this._controls.object.position.copy(new THREE.Vector3(50, 0, 0));
			} break;

			case 'Bottom': {
				this._controls.object.position.copy(new THREE.Vector3(0, -50, 0));
			} break;

			case 'Top': {
				this._controls.object.position.copy(new THREE.Vector3(0, 50, 0));
			} break;
		}

		this._camera.view = value;
		this._output();
	}
}
