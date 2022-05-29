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
		this._icosahedron = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'icosahedronRadius': 3,
			'icosahedronDetail': 0,
			'icosahedronMaterialColor': '#156289',
			'icosahedronWireframeColor': '#FFFFFF',
			'icosahedronPositionX': 0,
			'icosahedronPositionY': 0,
			'icosahedronPositionZ': 0,
			'icosahedronRotationX': 0,
			'icosahedronRotationY': 0,
			'icosahedronRotationZ': 0,
			'icosahedronScaleX': 1,
			'icosahedronScaleY': 1,
			'icosahedronScaleZ': 1,
			'icosahedronWireframe': false
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

		this._icosahedron = new THREE.Object3D();
		this._scene.add(this._icosahedron);

		this._icosahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.icosahedronMaterialColor } )
		));

		this._icosahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.icosahedronWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.IcosahedronGeometry(
			this._properties.icosahedronRadius,
			this._properties.icosahedronDetail
		);

		this._icosahedron.children[0].geometry.dispose();
		this._icosahedron.children[0].geometry = geometry;

		this._icosahedron.children[1].geometry.dispose();
		this._icosahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Icosahedron Geometry');
		folderGeometry.add(this._properties, 'icosahedronWireframe').onChange((value) => {
			this._icosahedron.children[0].visible = !value;
			/*
				this._icosahedron.children[0].material.wireframe = value;
				this._icosahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'icosahedronRadius', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'icosahedronDetail', 0, 5).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Icosahedron Material');
		folderMaterial.addColor(this._properties, 'icosahedronMaterialColor').onChange((value) => {
			this._icosahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'icosahedronWireframeColor').onChange((value) => {
			this._icosahedron.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Icosahedron Transformation');
		folderTransformation.add(this._properties, 'icosahedronPositionX', -10, 10).step(0.1).onChange((value) => {
			this._icosahedron.position.x = value;
		});
		folderTransformation.add(this._properties, 'icosahedronPositionY', -10, 10).step(0.1).onChange((value) => {
			this._icosahedron.position.y = value;
		});
		folderTransformation.add(this._properties, 'icosahedronPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._icosahedron.position.z = value;
		});
		folderTransformation.add(this._properties, 'icosahedronRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._icosahedron.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'icosahedronRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._icosahedron.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'icosahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._icosahedron.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'icosahedronScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._icosahedron.scale.x = value;
		});
		folderTransformation.add(this._properties, 'icosahedronScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._icosahedron.scale.y = value;
		});
		folderTransformation.add(this._properties, 'icosahedronScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._icosahedron.scale.z = value;
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
