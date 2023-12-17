import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from '../../../../../lib/threejs_158/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from '../../../../../lib/threejs_158/examples/jsm/loaders/FontLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._text = null;
		this._textFont = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'textValue': 'Hello World',
			'textFont': 'gentilis_regular',
			'textSize': 2,
			'textHeight': 1,
			'textCurveSegments': 5,
			'textBevelEnabled': false,
			'textBevelThickness': 0.3,
			'textBevelSize': 0.3,
			'textBevelSegments': 3,
			'textMaterialColor': '#156289',
			'textWireframeColor': '#FFFFFF',
			'textPositionX': 0,
			'textPositionY': 0,
			'textPositionZ': 0,
			'textRotationX': 0,
			'textRotationY': 0,
			'textRotationZ': 0,
			'textScaleX': 1,
			'textScaleY': 1,
			'textScaleZ': 1,
			'textWireframe': false
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

		this._text = new THREE.Object3D();
		this._scene.add(this._text);

		this._text.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.textMaterialColor } )
		));

		this._text.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.textWireframeColor } )
		));

		this._loadFont(this._properties.textFont);
	}

	_createGeometry() {
		const geometry = new TextGeometry(
			this._properties.textValue,
			{
				font: this._textFont,
				size: this._properties.textSize,
				height: this._properties.textHeight,
				curveSegments: this._properties.textCurveSegments,
				bevelEnabled: this._properties.textBevelEnabled,
				bevelThickness: this._properties.textBevelThickness,
				bevelSize: this._properties.textBevelSize,
				bevelSegments: this._properties.textBevelSegments
			}
		);

		this._text.children[0].geometry.dispose();
		this._text.children[0].geometry = geometry;

		this._text.children[1].geometry.dispose();
		this._text.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Text Geometry');
		folderGeometry.add(this._properties, 'textWireframe').onChange((value) => {
			this._text.children[0].visible = !value;
			/*
				this._text.children[0].material.wireframe = value;
				this._text.children[1].visible = !value;
			*/
		});
		folderGeometry.add(this._properties, 'textValue').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textFont',
				['gentilis_bold', 'gentilis_regular', 'helvetiker_bold', 'helvetiker_regular', 'optimer_bold', 'optimer_regular']).onChange((value) => {
			this._loadFont(value);
		});
		folderGeometry.add(this._properties, 'textSize', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textHeight', 0.1, 5).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textCurveSegments', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textBevelEnabled').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textBevelThickness', 0.1, 2).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textBevelSize', 0.1, 2).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'textBevelSegments', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Text Material');
		folderMaterial.addColor(this._properties, 'textMaterialColor').onChange((value) => {
			this._text.children[0].material.color.set(value);
		});
		folderMaterial.addColor(this._properties, 'textWireframeColor').onChange((value) => {
			this._text.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Text Transformation');
		folderTransformation.add(this._properties, 'textPositionX', -10, 10).step(0.1).onChange((value) => {
			this._text.position.x = value;
		});
		folderTransformation.add(this._properties, 'textPositionY', -10, 10).step(0.1).onChange((value) => {
			this._text.position.y = value;
		});
		folderTransformation.add(this._properties, 'textPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._text.position.z = value;
		});
		folderTransformation.add(this._properties, 'textRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._text.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'textRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._text.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'textRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._text.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'textScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._text.scale.x = value;
		});
		folderTransformation.add(this._properties, 'textScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._text.scale.y = value;
		});
		folderTransformation.add(this._properties, 'textScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._text.scale.z = value;
		});

		gui.close();
	}

	_loadFont(fontName) {
		const fontLoader = new FontLoader();

		fontLoader.load('../../../../resources/font/json/' + fontName + '.typeface.json', (font) => {
			this._textFont = font;

			this._createGeometry();
		});
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
