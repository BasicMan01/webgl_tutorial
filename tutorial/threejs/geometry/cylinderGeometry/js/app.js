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
		this._cylinder = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cylinderRadiusTop': 3,
			'cylinderRadiusBottom': 3,
			'cylinderHeight': 5,
			'cylinderRadialSegments': 8,
			'cylinderHeightSegments': 1,
			'cylinderOpenEnded': false,
			'cylinderThetaStart': 0,
			'cylinderThetaLength': 2 * Math.PI,
			'cylinderMaterialColor': '#156289',
			'cylinderWireframeColor': '#FFFFFF',
			'cylinderPositionX': 0,
			'cylinderPositionY': 0,
			'cylinderPositionZ': 0,
			'cylinderRotationX': 0,
			'cylinderRotationY': 0,
			'cylinderRotationZ': 0,
			'cylinderScaleX': 1,
			'cylinderScaleY': 1,
			'cylinderScaleZ': 1,
			'cylinderWireframe': false
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

		this._cylinder = new THREE.Object3D();
		this._scene.add(this._cylinder);

		this._cylinder.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.cylinderMaterialColor, side: THREE.DoubleSide } )
		));

		this._cylinder.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.cylinderWireframeColor } )
		));

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.CylinderGeometry(
			this._properties.cylinderRadiusTop,
			this._properties.cylinderRadiusBottom,
			this._properties.cylinderHeight,
			this._properties.cylinderRadialSegments,
			this._properties.cylinderHeightSegments,
			this._properties.cylinderOpenEnded,
			this._properties.cylinderThetaStart,
			this._properties.cylinderThetaLength
		);

		this._cylinder.children[0].geometry.dispose();
		this._cylinder.children[0].geometry = geometry;

		this._cylinder.children[1].geometry.dispose();
		this._cylinder.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Cylinder Geometry');
		folderGeometry.add(this._properties, 'cylinderWireframe').onChange((value) => {
			this._cylinder.children[0].visible = !value;
			/*
				this._cylinder.children[0].material.wireframe = value;
				this._cylinder.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'cylinderOpenEnded').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderRadiusTop', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderRadiusBottom', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderRadialSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderHeightSegments', 1, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderThetaStart', 0, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderThetaLength', 0.1, 2*Math.PI).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cylinder Material');
		folderMaterial.addColor(this._properties, 'cylinderMaterialColor').onChange((value) => {
			this._cylinder.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'cylinderWireframeColor').onChange((value) => {
			this._cylinder.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Cylinder Transformation');
		folderTransformation.add(this._properties, 'cylinderPositionX', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderPositionY', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.z = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scale.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scale.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scale.z = value;
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
