import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._cone = null;
		this._cube = null;
		this._sphere = null;
		this._sceneRotY = 0;

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
			'wireframe': false,
			'cameraLeftPositionX': 0,
			'cameraLeftPositionY': 10,
			'cameraLeftPositionZ': 20,
			'cameraLeftRotationX': 5.82,
			'cameraLeftRotationY': 0,
			'cameraLeftRotationZ': 1.57,
			'cameraFrontPositionX': 20,
			'cameraFrontPositionY': 10,
			'cameraFrontPositionZ': 0,
			'cameraFrontRotationX': 1.57,
			'cameraFrontRotationY': 2.03,
			'cameraFrontRotationZ': 4.71,
			'cameraRightPositionX': 0,
			'cameraRightPositionY': 10,
			'cameraRightPositionZ': -20,
			'cameraRightRotationX': 3.6,
			'cameraRightRotationY': 0,
			'cameraRightRotationZ': 1.57
		};

		this._scene = new THREE.Scene();

		this._cameraFront = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
		this._cameraRight = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
		this._cameraLeft = new THREE.PerspectiveCamera(40, 1, 0.1, 500);

		this._cameraLeft.position.set(
			this._properties.cameraLeftPositionX,
			this._properties.cameraLeftPositionY,
			this._properties.cameraLeftPositionZ
		);

		this._cameraLeft.rotation.set(
			this._properties.cameraLeftRotationX,
			this._properties.cameraLeftRotationY,
			this._properties.cameraLeftRotationZ
		);

		this._cameraFront.position.set(
			this._properties.cameraFrontPositionX,
			this._properties.cameraFrontPositionY,
			this._properties.cameraFrontPositionZ
		);

		this._cameraFront.rotation.set(
			this._properties.cameraFrontRotationX,
			this._properties.cameraFrontRotationY,
			this._properties.cameraFrontRotationZ
		);

		this._cameraRight.position.set(
			this._properties.cameraRightPositionX,
			this._properties.cameraRightPositionY,
			this._properties.cameraRightPositionZ
		);

		this._cameraRight.rotation.set(
			this._properties.cameraRightRotationX,
			this._properties.cameraRightRotationY,
			this._properties.cameraRightRotationZ
		);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

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

		const folderCameraLeft = gui.addFolder('Transformation Camera Left');
		folderCameraLeft.add(this._properties, 'cameraLeftPositionX', -50, 50).step(1).onChange((value) => {
			this._cameraLeft.position.x = value;
		});
		folderCameraLeft.add(this._properties, 'cameraLeftPositionY', -50, 50).step(1).onChange((value) => {
			this._cameraLeft.position.y = value;
		});
		folderCameraLeft.add(this._properties, 'cameraLeftPositionZ', -50, 50).step(1).onChange((value) => {
			this._cameraLeft.position.z = value;
		});
		folderCameraLeft.add(this._properties, 'cameraLeftRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraLeft.rotation.x = value;
		});
		folderCameraLeft.add(this._properties, 'cameraLeftRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraLeft.rotation.y = value;
		});
		folderCameraLeft.add(this._properties, 'cameraLeftRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraLeft.rotation.z = value;
		});

		const folderCameraFront = gui.addFolder('Transformation Camera Front');
		folderCameraFront.add(this._properties, 'cameraFrontPositionX', -50, 50).step(1).onChange((value) => {
			this._cameraFront.position.x = value;
		});
		folderCameraFront.add(this._properties, 'cameraFrontPositionY', -50, 50).step(1).onChange((value) => {
			this._cameraFront.position.y = value;
		});
		folderCameraFront.add(this._properties, 'cameraFrontPositionZ', -50, 50).step(1).onChange((value) => {
			this._cameraFront.position.z = value;
		});
		folderCameraFront.add(this._properties, 'cameraFrontRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraFront.rotation.x = value;
		});
		folderCameraFront.add(this._properties, 'cameraFrontRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraFront.rotation.y = value;
		});
		folderCameraFront.add(this._properties, 'cameraFrontRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraFront.rotation.z = value;
		});

		const folderCameraRight = gui.addFolder('Transformation Camera Right');
		folderCameraRight.add(this._properties, 'cameraRightPositionX', -50, 50).step(1).onChange((value) => {
			this._cameraRight.position.x = value;
		});
		folderCameraRight.add(this._properties, 'cameraRightPositionY', -50, 50).step(1).onChange((value) => {
			this._cameraRight.position.y = value;
		});
		folderCameraRight.add(this._properties, 'cameraRightPositionZ', -50, 50).step(1).onChange((value) => {
			this._cameraRight.position.z = value;
		});
		folderCameraRight.add(this._properties, 'cameraRightRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraRight.rotation.x = value;
		});
		folderCameraRight.add(this._properties, 'cameraRightRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraRight.rotation.y = value;
		});
		folderCameraRight.add(this._properties, 'cameraRightRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cameraRight.rotation.z = value;
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		const size = this._getCanvasHeight() / 2;
		const border = (this._getCanvasWidth() - 1.5 * this._getCanvasHeight()) / 2;

		this._scene.rotation.y = this._sceneRotY;
		this._sceneRotY += 0.002;

		this._renderer.setScissorTest(true);

		this._renderer.setViewport(border, size, size, size);
		this._renderer.setScissor(border, size, size, size);
		this._renderer.render(this._scene, this._cameraLeft);

		this._renderer.setViewport(border + size, 0, size, size);
		this._renderer.setScissor(border + size, 0, size, size);
		this._renderer.render(this._scene, this._cameraFront);

		this._renderer.setViewport(border + 2 * size, size, size, size);
		this._renderer.setScissor(border + 2 * size, size, size, size);
		this._renderer.render(this._scene, this._cameraRight);

		this._renderer.setScissorTest(false);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }


	_onResizeHandler(event) {
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
