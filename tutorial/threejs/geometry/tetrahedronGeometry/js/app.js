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
		this._tetrahedron = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'tetrahedronRadius': 3,
			'tetrahedronDetail': 0,
			'tetrahedronMaterialColor': '#156289',
			'tetrahedronWireframeColor': '#FFFFFF',
			'tetrahedronPositionX': 0,
			'tetrahedronPositionY': 0,
			'tetrahedronPositionZ': 0,
			'tetrahedronRotationX': 0,
			'tetrahedronRotationY': 0,
			'tetrahedronRotationZ': 0,
			'tetrahedronScaleX': 1,
			'tetrahedronScaleY': 1,
			'tetrahedronScaleZ': 1,
			'tetrahedronWireframe': false
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

		this._tetrahedron = new THREE.Object3D();
		this._scene.add(this._tetrahedron);

		this._tetrahedron.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.tetrahedronMaterialColor } )
		));

		this._tetrahedron.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.tetrahedronWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.TetrahedronGeometry(
			this._properties.tetrahedronRadius,
			this._properties.tetrahedronDetail
		);

		this._tetrahedron.children[0].geometry.dispose();
		this._tetrahedron.children[0].geometry = geometry;

		this._tetrahedron.children[1].geometry.dispose();
		this._tetrahedron.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Tetrahedron Geometry');
		folderGeometry.add(this._properties, 'tetrahedronWireframe').onChange((value) => {
			this._tetrahedron.children[0].visible = !value;
			/*
				this._tetrahedron.children[0].material.wireframe = value;
				this._tetrahedron.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'tetrahedronRadius', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'tetrahedronDetail', 0, 5).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Tetrahedron Material');
		folderMaterial.addColor(this._properties, 'tetrahedronMaterialColor').onChange((value) => {
			this._tetrahedron.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'tetrahedronWireframeColor').onChange((value) => {
			this._tetrahedron.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Tetrahedron Transformation');
		folderTransformation.add(this._properties, 'tetrahedronPositionX', -10, 10).step(0.1).onChange((value) => {
			this._tetrahedron.position.x = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronPositionY', -10, 10).step(0.1).onChange((value) => {
			this._tetrahedron.position.y = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._tetrahedron.position.z = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tetrahedron.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tetrahedron.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tetrahedron.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._tetrahedron.scale.x = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._tetrahedron.scale.y = value;
		});
		folderTransformation.add(this._properties, 'tetrahedronScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._tetrahedron.scale.z = value;
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
