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
		this._curveGeometry = null;
		this._tube = null;
		this._tubeGeometry = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'tubeRadius': 0.2,
			'tubeTubularSegments': 300,
			'tubeRadialSegments': 10,
			'tubeMaterialColor': '#156289',
			'tubeWireframeColor': '#FFFFFF',
			'tubePositionX': 0,
			'tubePositionY': 0,
			'tubePositionZ': 0,
			'tubeRotationX': 0,
			'tubeRotationY': 0,
			'tubeRotationZ': 0,
			'tubeScaleX': 1,
			'tubeScaleY': 1,
			'tubeScaleZ': 1,
			'tubeWireframe': false
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
	}

	_createObject() {
		const fileLoader = new THREE.FileLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._tube = new THREE.Object3D();
		this._scene.add(this._tube);

		this._tube.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.tubeMaterialColor, side: THREE.DoubleSide } )
		));

		this._tube.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.tubeWireframeColor } )
		));

		fileLoader.load('../../../../resources/mesh/catmullRom/catmullRom.json', (json) => {
			try {
				const pathPointsCollection = [];
				const pathPointsJson = JSON.parse(json).data;

				for (let i = 0; i < pathPointsJson.length; ++i) {
					pathPointsCollection.push(new THREE.Vector3(pathPointsJson[i].x, pathPointsJson[i].y, pathPointsJson[i].z));
				}

				this._curveGeometry = new THREE.CatmullRomCurve3(pathPointsCollection, true);

				this._createGeometry();

				this._render();
			} catch(e) {
				console.error(e);
			}
		}, this._onProgress, this._onError);
	}

	_createGeometry() {
		this._tubeGeometry = new THREE.TubeBufferGeometry(
			this._curveGeometry,
			this._properties.tubeTubularSegments,
			this._properties.tubeRadius,
			this._properties.tubeRadialSegments,
			true
		);

		this._tube.children[0].geometry.dispose();
		this._tube.children[0].geometry = this._tubeGeometry;

		this._tube.children[1].geometry.dispose();
		this._tube.children[1].geometry = new THREE.WireframeGeometry(this._tubeGeometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Tube Geometry');
		folderGeometry.add(this._properties, 'tubeWireframe').onChange((value) => {
			this._tube.children[0].visible = !value;
			/*
				this._tube.children[0].material.wireframe = value;
				this._tube.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'tubeRadius', 0.1, 1).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'tubeTubularSegments', 50, 1000).step(50).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'tubeRadialSegments', 3, 12).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Tube Material');
		folderMaterial.addColor(this._properties, 'tubeMaterialColor').onChange((value) => {
			this._tube.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'tubeWireframeColor').onChange((value) => {
			this._tube.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Tube Transformation');
		folderTransformation.add(this._properties, 'tubePositionX', -10, 10).step(0.1).onChange((value) => {
			this._tube.position.x = value;
		});
		folderTransformation.add(this._properties, 'tubePositionY', -10, 10).step(0.1).onChange((value) => {
			this._tube.position.y = value;
		});
		folderTransformation.add(this._properties, 'tubePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._tube.position.z = value;
		});
		folderTransformation.add(this._properties, 'tubeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tube.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'tubeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tube.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'tubeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._tube.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'tubeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._tube.scale.x = value;
		});
		folderTransformation.add(this._properties, 'tubeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._tube.scale.y = value;
		});
		folderTransformation.add(this._properties, 'tubeScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._tube.scale.z = value;
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

	_onError(xhr) {
		console.error(xhr);
	}

	_onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
