import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';

import HelperUtil from '../../../../../resources/js/helperUtil.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._plane = null;

		this._fonts = {
			'Arial': 'Arial',
			'Arial Black': 'Arial Black',
			'Comic Sans MS': 'Comic Sans MS',
			'Courier New': 'Courier New',
			'Georgia': 'Georgia',
			'Impact': 'Impact',
			'Lucida Console': 'Lucida Console',
			'Lucida Sans Unicode': 'Lucida Sans Unicode',
			'Palatino Linotype': 'Palatino Linotype',
			'Tahoma': 'Tahoma',
			'Times New Roman': 'Times New Roman',
			'Trebuchet MS': 'Trebuchet MS',
			'Verdana': 'Verdana'
		};

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'planeWidth': 5,
			'planeHeight': 5,
			'planeSegmentsX': 1,
			'planeSegmentsY': 1,
			'planeMaterialBackgroundColor': '#156289',
			'planeMaterialBackgroundOpacity': 0.3,
			'planeMaterialBorderColor': '#00ffff',
			'planeMaterialBorderOpacity': 1,
			'planeMaterialBorderLineWidth': 3,
			'planeMaterialFontColor': '#00ffff',
			'planeMaterialFontOpacity': 1,
			'planeMaterialFontSize': 11,
			'planeMaterialFontFamily': 'Courier New',
			'planeMaterialTextValue': 'Firstname: Max\\nSurname  : Mustermann',
			'planePositionX': 0,
			'planePositionY': 0,
			'planePositionZ': 0,
			'planeRotationX': 0,
			'planeRotationY': 0,
			'planeRotationZ': 0,
			'planeScaleX': 1,
			'planeScaleY': 1
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

		this._plane = new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial()
		);
		this._scene.add(this._plane);

		this._createGeometry();
		this._createMaterial();
	}

	_createGeometry() {
		const geometry = new THREE.PlaneGeometry(
			this._properties.planeWidth,
			this._properties.planeHeight,
			this._properties.planeSegmentsX,
			this._properties.planeSegmentsY
		);

		this._plane.geometry.dispose();
		this._plane.geometry = geometry;
	}

	_createMaterial() {
		const texture = this._createTexture();

		this._plane.material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide, transparent: true } );
	}

	_createTexture() {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		const backgroundColor = HelperUtil.cssColorToRgb(this._properties.planeMaterialBackgroundColor);
		const borderColor = HelperUtil.cssColorToRgb(this._properties.planeMaterialBorderColor);
		const fontColor = HelperUtil.cssColorToRgb(this._properties.planeMaterialFontColor);
		const lineHeight = this._properties.planeMaterialFontSize + 5;
		const textCollection = this._properties.planeMaterialTextValue.split('\\n');

		let topPosition = 0;

		context.canvas.height = 256;
		context.canvas.width = 256;

		context.fillStyle = 'rgba(' + backgroundColor.r + ', ' + backgroundColor.g + ', ' + backgroundColor.b + ', ' + this._properties.planeMaterialBackgroundOpacity + ')';
		context.fillRect(0, 0, 256, 256);

		context.strokeStyle = 'rgba(' + borderColor.r + ', ' + borderColor.g + ', ' + borderColor.b + ', ' + this._properties.planeMaterialBorderOpacity + ')';
		context.lineWidth = this._properties.planeMaterialBorderLineWidth;
		context.strokeRect(0, 0, 256, 256);

		context.font = this._properties.planeMaterialFontSize + 'px ' + this._properties.planeMaterialFontFamily;
		context.fillStyle = 'rgba(' + fontColor.r + ', ' + fontColor.g + ', ' + fontColor.b + ', ' + this._properties.planeMaterialFontOpacity + ')';

		for (let i = 0; i < textCollection.length; ++i) {
			context.fillText(textCollection[i], 10, topPosition += lineHeight);
		}

		const texture = new THREE.Texture(canvas);

		texture.needsUpdate = true;

		return texture;
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
		folderGeometry.add(this._properties, 'planeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Plane Material');
		folderMaterial.addColor(this._properties, 'planeMaterialBackgroundColor').onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialBackgroundOpacity', 0, 1).step(0.1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.addColor(this._properties, 'planeMaterialBorderColor').onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialBorderOpacity', 0, 1).step(0.1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialBorderLineWidth', 1, 10).step(1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.addColor(this._properties, 'planeMaterialFontColor').onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialFontOpacity', 0, 1).step(0.1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialFontSize', 8, 32).step(1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialFontFamily', Object.keys(this._fonts)).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'planeMaterialTextValue').onChange((value) => {
			this._createMaterial();
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
