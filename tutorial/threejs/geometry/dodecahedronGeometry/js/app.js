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
		this._dodecahedron = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'dodecahedronRadius': 3,
			'dodecahedronDetail': 0,
			'dodecahedronMaterialColor': '#156289',
			'dodecahedronWireframeColor': '#FFFFFF',
			'dodecahedronPositionX': 0,
			'dodecahedronPositionY': 0,
			'dodecahedronPositionZ': 0,
			'dodecahedronRotationX': 0,
			'dodecahedronRotationY': 0,
			'dodecahedronRotationZ': 0,
			'dodecahedronScaleX': 1,
			'dodecahedronScaleY': 1,
			'dodecahedronScaleZ': 1,
			'dodecahedronWireframe': false
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
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._dodecahedron = new THREE.Object3D();
		this._scene.add(this._dodecahedron);

		this._dodecahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.dodecahedronMaterialColor } )
		));

		this._dodecahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.dodecahedronWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.DodecahedronGeometry(
			this._properties.dodecahedronRadius,
			this._properties.dodecahedronDetail
		);

		this._dodecahedron.children[0].geometry.dispose();
		this._dodecahedron.children[0].geometry = geometry;

		this._dodecahedron.children[1].geometry.dispose();
		this._dodecahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Dodecahedron Geometry');
		folderGeometry.add(this._properties, 'dodecahedronWireframe').onChange((value) => {
			this._dodecahedron.children[0].visible = !value;
			/*
				this._dodecahedron.children[0].material.wireframe = value;
				this._dodecahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'dodecahedronRadius', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'dodecahedronDetail', 0, 5).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Dodecahedron Material');
		folderMaterial.addColor(this._properties, 'dodecahedronMaterialColor').onChange((value) => {
			this._dodecahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'dodecahedronWireframeColor').onChange((value) => {
			this._dodecahedron.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Dodecahedron Transformation');
		folderTransformation.add(this._properties, 'dodecahedronPositionX', -10, 10).step(0.1).onChange((value) => {
			this._dodecahedron.position.x = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronPositionY', -10, 10).step(0.1).onChange((value) => {
			this._dodecahedron.position.y = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._dodecahedron.position.z = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._dodecahedron.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._dodecahedron.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._dodecahedron.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._dodecahedron.scale.x = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._dodecahedron.scale.y = value;
		});
		folderTransformation.add(this._properties, 'dodecahedronScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._dodecahedron.scale.z = value;
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

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
