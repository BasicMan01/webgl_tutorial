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
		this._cone = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'coneRadius': 5,
			'coneHeight': 5,
			'coneRadialSegments': 8,
			'coneHeightSegments': 1,
			'coneOpenEnded': false,
			'coneThetaStart': 0,
			'coneThetaLength': 2 * Math.PI,
			'coneMaterialColor': '#156289',
			'coneWireframeColor': '#FFFFFF',
			'conePositionX': 0,
			'conePositionY': 0,
			'conePositionZ': 0,
			'coneRotationX': 0,
			'coneRotationY': 0,
			'coneRotationZ': 0,
			'coneScaleX': 1,
			'coneScaleY': 1,
			'coneScaleZ': 1,
			'coneWireframe': false
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

		this._cone = new THREE.Object3D();
		this._scene.add(this._cone);

		this._cone.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.coneMaterialColor, side: THREE.DoubleSide } )
		));

		this._cone.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.coneWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.ConeGeometry(
			this._properties.coneRadius,
			this._properties.coneHeight,
			this._properties.coneRadialSegments,
			this._properties.coneHeightSegments,
			this._properties.coneOpenEnded,
			this._properties.coneThetaStart,
			this._properties.coneThetaLength
		);

		this._cone.children[0].geometry.dispose();
		this._cone.children[0].geometry = geometry;

		this._cone.children[1].geometry.dispose();
		this._cone.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Cone Geometry');
		folderGeometry.add(this._properties, 'coneWireframe').onChange((value) => {
			this._cone.children[0].visible = !value;
			/*
				this._cone.children[0].material.wireframe = value;
				this._cone.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'coneOpenEnded').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneRadialSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneHeightSegments', 1, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneThetaStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'coneThetaLength', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cone Material');
		folderMaterial.addColor(this._properties, 'coneMaterialColor').onChange((value) => {
			this._cone.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'coneWireframeColor').onChange((value) => {
			this._cone.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Cone Transformation');
		folderTransformation.add(this._properties, 'conePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.x = value;
		});
		folderTransformation.add(this._properties, 'conePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.y = value;
		});
		folderTransformation.add(this._properties, 'conePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cone.position.z = value;
		});
		folderTransformation.add(this._properties, 'coneRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cone.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'coneRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cone.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'coneRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cone.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'coneScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cone.scale.x = value;
		});
		folderTransformation.add(this._properties, 'coneScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cone.scale.y = value;
		});
		folderTransformation.add(this._properties, 'coneScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cone.scale.z = value;
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
