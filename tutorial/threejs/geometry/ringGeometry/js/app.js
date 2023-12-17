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
		this._ring = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'ringInnerRadius': 3,
			'ringOuterRadius': 5,
			'ringThetaSegments': 8,
			'ringPhiSegments': 8,
			'ringThetaStart': 0,
			'ringThetaLength': 2*Math.PI,
			'ringMaterialColor': '#156289',
			'ringWireframeColor': '#FFFFFF',
			'ringPositionX': 0,
			'ringPositionY': 0,
			'ringPositionZ': 0,
			'ringRotationX': 0,
			'ringRotationY': 0,
			'ringRotationZ': 0,
			'ringScaleX': 1,
			'ringScaleY': 1,
			'ringWireframe': false
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

		this._ring = new THREE.Object3D();
		this._scene.add(this._ring);

		this._ring.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.ringMaterialColor, side: THREE.DoubleSide } )
		));

		this._ring.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.ringWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.RingGeometry(
			this._properties.ringInnerRadius,
			this._properties.ringOuterRadius,
			this._properties.ringThetaSegments,
			this._properties.ringPhiSegments,
			this._properties.ringThetaStart,
			this._properties.ringThetaLength
		);

		this._ring.children[0].geometry.dispose();
		this._ring.children[0].geometry = geometry;

		this._ring.children[1].geometry.dispose();
		this._ring.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Ring Geometry');
		folderGeometry.add(this._properties, 'ringWireframe').onChange((value) => {
			this._ring.children[0].visible = !value;
			/*
				this._ring.children[0].material.wireframe = value;
				this._ring.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'ringInnerRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ringOuterRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ringThetaSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ringPhiSegments', 1, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ringThetaStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'ringThetaLength', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Ring Material');
		folderMaterial.addColor(this._properties, 'ringMaterialColor').onChange((value) => {
			this._ring.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'ringWireframeColor').onChange((value) => {
			this._ring.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Ring Transformation');
		folderTransformation.add(this._properties, 'ringPositionX', -10, 10).step(0.1).onChange((value) => {
			this._ring.position.x = value;
		});
		folderTransformation.add(this._properties, 'ringPositionY', -10, 10).step(0.1).onChange((value) => {
			this._ring.position.y = value;
		});
		folderTransformation.add(this._properties, 'ringPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._ring.position.z = value;
		});
		folderTransformation.add(this._properties, 'ringRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ring.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'ringRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ring.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'ringRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._ring.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'ringScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._ring.scale.x = value;
		});
		folderTransformation.add(this._properties, 'ringScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._ring.scale.y = value;
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
