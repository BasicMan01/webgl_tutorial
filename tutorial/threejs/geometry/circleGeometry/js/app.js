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
		this._circle = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'circleRadius': 3,
			'circleSegments': 8,
			'circleThetaStart': 0,
			'circleThetaLength': 2 * Math.PI,
			'circleMaterialColor': '#156289',
			'circleWireframeColor': '#FFFFFF',
			'circlePositionX': 0,
			'circlePositionY': 0,
			'circlePositionZ': 0,
			'circleRotationX': 0,
			'circleRotationY': 0,
			'circleRotationZ': 0,
			'circleScaleX': 1,
			'circleScaleY': 1,
			'circleWireframe': false
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

		this._circle = new THREE.Object3D();
		this._scene.add(this._circle);

		this._circle.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.circleMaterialColor, side: THREE.DoubleSide } )
		));

		this._circle.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.circleWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.CircleGeometry(
			this._properties.circleRadius,
			this._properties.circleSegments,
			this._properties.circleThetaStart,
			this._properties.circleThetaLength
		);

		this._circle.children[0].geometry.dispose();
		this._circle.children[0].geometry = geometry;

		this._circle.children[1].geometry.dispose();
		this._circle.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Circle Geometry');
		folderGeometry.add(this._properties, 'circleWireframe').onChange((value) => {
			this._circle.children[0].visible = !value;
			/*
				this._circle.children[0].material.wireframe = value;
				this._circle.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'circleRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'circleSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'circleThetaStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'circleThetaLength', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Circle Material');
		folderMaterial.addColor(this._properties, 'circleMaterialColor').onChange((value) => {
			this._circle.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'circleWireframeColor').onChange((value) => {
			this._circle.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Circle Transformation');
		folderTransformation.add(this._properties, 'circlePositionX', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.x = value;
		});
		folderTransformation.add(this._properties, 'circlePositionY', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.y = value;
		});
		folderTransformation.add(this._properties, 'circlePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.z = value;
		});
		folderTransformation.add(this._properties, 'circleRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'circleRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'circleRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'circleScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._circle.scale.x = value;
		});
		folderTransformation.add(this._properties, 'circleScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._circle.scale.y = value;
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
