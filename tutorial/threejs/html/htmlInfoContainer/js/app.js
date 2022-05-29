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
		this._cone = null;
		this._cube = null;
		this._sphere = null;
		this._meshs = [];
		this._intersectObject = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'infoBoxCenter': true,
			'coneMaterialColor': '#156289',
			'coneWireframeColor': '#FFFFFF',
			'cubeMaterialColor': '#156289',
			'cubeWireframeColor': '#FFFFFF',
			'sphereMaterialColor': '#156289',
			'sphereWireframeColor': '#FFFFFF',
			'conePositionX': -10,
			'conePositionY': 0,
			'conePositionZ': 0,
			'cubePositionX': 0,
			'cubePositionY': 0,
			'cubePositionZ': -10,
			'spherePositionX': 10,
			'spherePositionY': 0,
			'spherePositionZ': 10,
			'wireframe': false
		};

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 10, 20);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);

		this._raycaster = new THREE.Raycaster();
		this._mouseVector2 = new THREE.Vector2();

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._infoBox = document.getElementById('infoBox');
		this._infoBoxTemplate = document.getElementById('infoBoxTemplate');

		window.addEventListener('mousemove', this._onMouseMoveHandler.bind(this), false);
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

		this._meshs.push(this._cone.children[0]);
		this._meshs.push(this._cube.children[0]);
		this._meshs.push(this._sphere.children[0]);

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
		gui.add(this._properties, 'infoBoxCenter').onChange((value) => {
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

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._updateInfoBoxPosition();

		this._renderer.render(this._scene, this._camera);
	}

	_updateInfoBoxPosition() {
		// 3D => 2D
		if (this._intersectObject !== null) {
			const object = this._intersectObject;
			const templateCode = this._infoBoxTemplate.innerHTML;

			let vector = new THREE.Vector3();

			if (this._properties.infoBoxCenter) {
				// show info box at the center of the mesh

				// if object.matrixAutoUpdate = false use updateMatrixWorld()
				// object.updateMatrixWorld();

				vector.setFromMatrixPosition(object.matrixWorld);
				vector.project(this._camera);
			} else {
				// show info box at mouse position
				vector = this._mouseVector2.clone();
			}

			vector.x = Math.round((0.5 + vector.x / 2) * this._getCanvasWidth());
			vector.y = Math.round((0.5 - vector.y / 2) * this._getCanvasHeight());

			this._infoBox.innerHTML = templateCode.replace('{geometry}', this._intersectObject.geometry.type);
			this._infoBox.style.display = 'block';
			this._infoBox.style.left = vector.x + 'px';
			this._infoBox.style.top = vector.y + 'px';
		} else {
			this._infoBox.style.display = 'none';
		}
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onMouseMoveHandler(event) {
		// 2D => 3D
		this._mouseVector2.x = (event.clientX / window.innerWidth) * 2 - 1;
		this._mouseVector2.y = - (event.clientY / window.innerHeight) * 2 + 1;

		this._raycaster.setFromCamera(this._mouseVector2, this._camera);

		const intersects = this._raycaster.intersectObjects(this._meshs);

		if (intersects.length > 0) {
			this._intersectObject = intersects[0].object;
		} else {
			this._intersectObject = null;
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
