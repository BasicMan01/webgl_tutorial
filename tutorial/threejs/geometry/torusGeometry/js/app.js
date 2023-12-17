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
		this._torus = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'torusRadius': 3,
			'torusTube': 1,
			'torusRadialSegments': 10,
			'torusTubularSegments': 10,
			'torusArc': 2*Math.PI,
			'torusMaterialColor': '#156289',
			'torusWireframeColor': '#FFFFFF',
			'torusPositionX': 0,
			'torusPositionY': 0,
			'torusPositionZ': 0,
			'torusRotationX': 0,
			'torusRotationY': 0,
			'torusRotationZ': 0,
			'torusScaleX': 1,
			'torusScaleY': 1,
			'torusScaleZ': 1,
			'torusWireframe': false
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

		this._torus = new THREE.Object3D();
		this._scene.add(this._torus);

		this._torus.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.torusMaterialColor, side: THREE.DoubleSide } )
		));

		this._torus.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.torusWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.TorusGeometry(
			this._properties.torusRadius,
			this._properties.torusTube,
			this._properties.torusRadialSegments,
			this._properties.torusTubularSegments,
			this._properties.torusArc
		);

		this._torus.children[0].geometry.dispose();
		this._torus.children[0].geometry = geometry;

		this._torus.children[1].geometry.dispose();
		this._torus.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Torus Geometry');
		folderGeometry.add(this._properties, 'torusWireframe').onChange((value) => {
			this._torus.children[0].visible = !value;
			/*
				this._torus.children[0].material.wireframe = value;
				this._torus.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'torusRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusTube', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusRadialSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusTubularSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusArc', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Torus Material');
		folderMaterial.addColor(this._properties, 'torusMaterialColor').onChange((value) => {
			this._torus.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'torusWireframeColor').onChange((value) => {
			this._torus.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Torus Transformation');
		folderTransformation.add(this._properties, 'torusPositionX', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.x = value;
		});
		folderTransformation.add(this._properties, 'torusPositionY', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.y = value;
		});
		folderTransformation.add(this._properties, 'torusPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.z = value;
		});
		folderTransformation.add(this._properties, 'torusRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'torusRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'torusRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'torusScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scale.x = value;
		});
		folderTransformation.add(this._properties, 'torusScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scale.y = value;
		});
		folderTransformation.add(this._properties, 'torusScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scale.z = value;
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
