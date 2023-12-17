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
		this._torusKnot = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'torusKnotRadius': 3,
			'torusKnotTube': 0.5,
			'torusKnotRadialSegments': 32,
			'torusKnotTubularSegments': 32,
			'torusKnotP': 2,
			'torusKnotQ': 3,
			'torusKnotMaterialColor': '#156289',
			'torusKnotWireframeColor': '#FFFFFF',
			'torusKnotPositionX': 0,
			'torusKnotPositionY': 0,
			'torusKnotPositionZ': 0,
			'torusKnotRotationX': 0,
			'torusKnotRotationY': 0,
			'torusKnotRotationZ': 0,
			'torusKnotScaleX': 1,
			'torusKnotScaleY': 1,
			'torusKnotScaleZ': 1,
			'torusKnotWireframe': false
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

		this._torusKnot = new THREE.Object3D();
		this._scene.add(this._torusKnot);

		this._torusKnot.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.torusKnotMaterialColor, side: THREE.DoubleSide } )
		));

		this._torusKnot.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.torusKnotWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.TorusKnotGeometry(
			this._properties.torusKnotRadius,
			this._properties.torusKnotTube,
			this._properties.torusKnotTubularSegments,
			this._properties.torusKnotRadialSegments,
			this._properties.torusKnotP,
			this._properties.torusKnotQ
		);

		this._torusKnot.children[0].geometry.dispose();
		this._torusKnot.children[0].geometry = geometry;

		this._torusKnot.children[1].geometry.dispose();
		this._torusKnot.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('TorusKnot Geometry');
		folderGeometry.add(this._properties, 'torusKnotWireframe').onChange((value) => {
			this._torusKnot.children[0].visible = !value;
			/*
				this._torusKnot.children[0].material.wireframe = value;
				this._torusKnot.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'torusKnotRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotTube', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotRadialSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotTubularSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotP', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotQ', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('TorusKnot Material');
		folderMaterial.addColor(this._properties, 'torusKnotMaterialColor').onChange((value) => {
			this._torusKnot.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'torusKnotWireframeColor').onChange((value) => {
			this._torusKnot.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('TorusKnot Transformation');
		folderTransformation.add(this._properties, 'torusKnotPositionX', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotPositionY', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.z = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scale.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scale.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scale.z = value;
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
