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
		this._plane = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'planeWidth': 5,
			'planeHeight': 5,
			'planeSegmentsX': 1,
			'planeSegmentsY': 1,
			'planeMaterialColor': '#156289',
			'planeWireframeColor': '#FFFFFF',
			'planePositionX': 0,
			'planePositionY': 0,
			'planePositionZ': 0,
			'planeRotationX': 0,
			'planeRotationY': 0,
			'planeRotationZ': 0,
			'planeScaleX': 1,
			'planeScaleY': 1,
			'planeWireframe': false
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

		this._plane = new THREE.Object3D();
		this._scene.add(this._plane);

		this._plane.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.planeMaterialColor, side: THREE.DoubleSide } )
		));

		this._plane.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.planeWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.PlaneGeometry(
			this._properties.planeWidth,
			this._properties.planeHeight,
			this._properties.planeSegmentsX,
			this._properties.planeSegmentsY
		);

		this._plane.children[0].geometry.dispose();
		this._plane.children[0].geometry = geometry;

		this._plane.children[1].geometry.dispose();
		this._plane.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Plane Geometry');
		folderGeometry.add(this._properties, 'planeWireframe').onChange((value) => {
			this._plane.children[0].visible = !value;
			/*
				this._plane.children[0].material.wireframe = value;
				this._plane.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'planeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeSegmentsX', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeSegmentsY', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Plane Material');
		folderMaterial.addColor(this._properties, 'planeMaterialColor').onChange((value) => {
			this._plane.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'planeWireframeColor').onChange((value) => {
			this._plane.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Plane Transformation');
		folderTransformation.add(this._properties, 'planePositionX', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.x = value;
		});
		folderTransformation.add(this._properties, 'planePositionY', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.y = value;
		});
		folderTransformation.add(this._properties, 'planePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.z = value;
		});
		folderTransformation.add(this._properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'planeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scale.x = value;
		});
		folderTransformation.add(this._properties, 'planeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scale.y = value;
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
