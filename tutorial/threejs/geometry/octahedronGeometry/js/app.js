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
		this._octahedron = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'octahedronRadius': 3,
			'octahedronDetail': 0,
			'octahedronMaterialColor': '#156289',
			'octahedronWireframeColor': '#FFFFFF',
			'octahedronPositionX': 0,
			'octahedronPositionY': 0,
			'octahedronPositionZ': 0,
			'octahedronRotationX': 0,
			'octahedronRotationY': 0,
			'octahedronRotationZ': 0,
			'octahedronScaleX': 1,
			'octahedronScaleY': 1,
			'octahedronScaleZ': 1,
			'octahedronWireframe': false
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

		this._octahedron = new THREE.Object3D();
		this._scene.add(this._octahedron);

		this._octahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.octahedronMaterialColor } )
		));

		this._octahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.octahedronWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.OctahedronGeometry(
			this._properties.octahedronRadius,
			this._properties.octahedronDetail
		);

		this._octahedron.children[0].geometry.dispose();
		this._octahedron.children[0].geometry = geometry;

		this._octahedron.children[1].geometry.dispose();
		this._octahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Octahedron Geometry');
		folderGeometry.add(this._properties, 'octahedronWireframe').onChange((value) => {
			this._octahedron.children[0].visible = !value;
			/*
				this._octahedron.children[0].material.wireframe = value;
				this._octahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'octahedronRadius', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'octahedronDetail', 0, 5).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Octahedron Material');
		folderMaterial.addColor(this._properties, 'octahedronMaterialColor').onChange((value) => {
			this._octahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'octahedronWireframeColor').onChange((value) => {
			this._octahedron.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Octahedron Transformation');
		folderTransformation.add(this._properties, 'octahedronPositionX', -10, 10).step(0.1).onChange((value) => {
			this._octahedron.position.x = value;
		});
		folderTransformation.add(this._properties, 'octahedronPositionY', -10, 10).step(0.1).onChange((value) => {
			this._octahedron.position.y = value;
		});
		folderTransformation.add(this._properties, 'octahedronPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._octahedron.position.z = value;
		});
		folderTransformation.add(this._properties, 'octahedronRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._octahedron.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'octahedronRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._octahedron.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'octahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._octahedron.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'octahedronScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._octahedron.scale.x = value;
		});
		folderTransformation.add(this._properties, 'octahedronScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._octahedron.scale.y = value;
		});
		folderTransformation.add(this._properties, 'octahedronScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._octahedron.scale.z = value;
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
