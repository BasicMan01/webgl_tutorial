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
		this._particles = null;
		this._sprite = null;

		this._properties = {
			'axesHelperVisible': false,
			'gridHelperVisible': false,
			'particleCount': 30000,
			'particleAlphaTest': 0.5,
			'particleMaterialColor': '#156289',
			'particleSizeAttenuation': false,
			'particleSize': 0.1,
			'particlePositionX': 0,
			'particlePositionY': 0,
			'particlePositionZ': 0,
			'particleRotationX': 0,
			'particleRotationY': 0,
			'particleRotationZ': 0,
			'particleScaleX': 1,
			'particleScaleY': 1,
			'particleScaleZ': 1
		};

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 10, 150);

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
		this._sprite = new THREE.TextureLoader().load( "../../../../resources/texture/sprite/circle.png");

		this._axesHelper = new THREE.AxesHelper(25);
		this._axesHelper.visible = this._properties.axesHelperVisible;
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._particles = new THREE.Points(
			new THREE.BufferGeometry(),
			new THREE.Material()
		);
		this._scene.add(this._particles);

		this._createGeometry();
		this._createMaterial();
	}

	_createGeometry() {
		const radius = 20;
		const numberOfSpirals = 100;
		const tubeHeight = 80;
		const points = [];

		for (let i = 0; i < numberOfSpirals; ++i) {
			let startAngle = (i / numberOfSpirals) * 2 * Math.PI;

			for (let j = 0; j < this._properties.particleCount / numberOfSpirals; ++j) {
				let angle = startAngle + (j / (this._properties.particleCount / numberOfSpirals)) * 2 * Math.PI;

				let x = radius * Math.cos(angle);
				let y = tubeHeight / 2 - (j / (this._properties.particleCount / numberOfSpirals)) * tubeHeight;
				let z = radius * Math.sin(angle);

				points.push(new THREE.Vector3(x, y, z));
			}
		}

		this._particles.geometry.dispose();
		this._particles.geometry = new THREE.BufferGeometry().setFromPoints(points);
	}

	_createMaterial() {
		this._particles.material.dispose();
		this._particles.material = new THREE.PointsMaterial(
		{
			alphaTest: this._properties.particleAlphaTest,
			color: this._properties.particleMaterialColor,
			map: this._sprite,
			size: this._properties.particleSize,
			sizeAttenuation: this._properties.particleSizeAttenuation,
			transparent: true
		});
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Particle Geometry');
		folderGeometry.add(this._properties, 'particleCount', 100, 100000).step(100).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Particle Material');
		folderMaterial.add(this._properties, 'particleAlphaTest', 0.01, 1).step(0.01).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'particleSize', 0.1, 2).step(0.1).onChange((value) => {
			this._particles.material.size = value;
		});
		folderMaterial.add(this._properties, 'particleSizeAttenuation').onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.addColor(this._properties, 'particleMaterialColor').onChange((value) => {
			this._particles.material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Particle Transformation');
		folderTransformation.add(this._properties, 'particlePositionX', -10, 10).step(0.1).onChange((value) => {
			this._particles.position.x = value;
		});
		folderTransformation.add(this._properties, 'particlePositionY', -10, 10).step(0.1).onChange((value) => {
			this._particles.position.y = value;
		});
		folderTransformation.add(this._properties, 'particlePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._particles.position.z = value;
		});
		folderTransformation.add(this._properties, 'particleRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._particles.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'particleRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._particles.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'particleRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._particles.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'particleScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._particles.scale.x = value;
		});
		folderTransformation.add(this._properties, 'particleScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._particles.scale.y = value;
		});
		folderTransformation.add(this._properties, 'particleScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._particles.scale.z = value;
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
