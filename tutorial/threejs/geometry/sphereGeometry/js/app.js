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
		this._sphere = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'sphereRadius': 2.5,
			'sphereWidthSegments': 16,
			'sphereHeightSegments': 12,
			'spherePhiStart': 0,
			'spherePhiLength': 2*Math.PI,
			'sphereThetaStart': 0,
			'sphereThetaLength': Math.PI,
			'sphereMaterialColor': '#156289',
			'sphereWireframeColor': '#FFFFFF',
			'spherePositionX': 0,
			'spherePositionY': 0,
			'spherePositionZ': 0,
			'sphereRotationX': 0,
			'sphereRotationY': 0,
			'sphereRotationZ': 0,
			'sphereScaleX': 1,
			'sphereScaleY': 1,
			'sphereScaleZ': 1,
			'sphereWireframe': false
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

		this._sphere = new THREE.Object3D();
		this._scene.add(this._sphere);

		this._sphere.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.sphereMaterialColor, side: THREE.DoubleSide } )
		));

		this._sphere.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.sphereWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.SphereGeometry(
			this._properties.sphereRadius,
			this._properties.sphereWidthSegments,
			this._properties.sphereHeightSegments,
			this._properties.spherePhiStart,
			this._properties.spherePhiLength,
			this._properties.sphereThetaStart,
			this._properties.sphereThetaLength
		);

		this._sphere.children[0].geometry.dispose();
		this._sphere.children[0].geometry = geometry;

		this._sphere.children[1].geometry.dispose();
		this._sphere.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Sphere Geometry');
		folderGeometry.add(this._properties, 'sphereWireframe').onChange((value) => {
			this._sphere.children[0].visible = !value;
			/*
				this._sphere.children[0].material.wireframe = value;
				this._sphere.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'sphereRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereWidthSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereHeightSegments', 2, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'spherePhiStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'spherePhiLength', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereThetaStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereThetaLength', 0.1, Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Sphere Material');
		folderMaterial.addColor(this._properties, 'sphereMaterialColor').onChange((value) => {
			this._sphere.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'sphereWireframeColor').onChange((value) => {
			this._sphere.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Sphere Transformation');
		folderTransformation.add(this._properties, 'spherePositionX', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.x = value;
		});
		folderTransformation.add(this._properties, 'spherePositionY', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.y = value;
		});
		folderTransformation.add(this._properties, 'spherePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.z = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scale.x = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scale.y = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scale.z = value;
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
