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
		this._cube = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cubeWireframeColor': '#FFFFFF',
			'cubePositionX': 0,
			'cubePositionY': 0,
			'cubePositionZ': 0,
			'cubeRotationX': 0,
			'cubeRotationY': 0,
			'cubeRotationZ': 0,
			'cubeScaleX': 1,
			'cubeScaleY': 1,
			'cubeScaleZ': 1,
			'cubeWireframe': false,
			'shaderInterval': 5.0,
			'shaderVelocity': 0.5
		};

		this._clock = new THREE.Clock();
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
		const geometry = new THREE.BoxGeometry(5, 5, 5);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._cube = new THREE.Object3D();
		this._scene.add(this._cube);

		this._cube.add(new THREE.Mesh(
			geometry,
			new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					time: { type: "f", value: 0.0 },

					interval: { type: "f", value: this._properties.shaderInterval },
					velocity: { type: "f", value: this._properties.shaderVelocity }
				},

				vertexShader: `
					varying vec2 vUv;

					void main() {
						vUv = uv;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,

				fragmentShader: `
					uniform vec2 mouse;
					uniform vec2 resolution;
					uniform float time;

					uniform float interval;
					uniform float velocity;

					varying vec2 vUv;

					void main() {
						vec2 position = vUv - 0.5;
						float color = abs(sin(interval * (length(position) - time * velocity)));

						gl_FragColor = vec4(color, color, color, 1.0);
					}
				`
			})
		));

		this._cube.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: this._properties.cubeWireframeColor } )
		));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderMaterial = gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeWireframeColor').onChange((value) => {
			this._cube.children[1].material.color.set(value);
		});

		const folderTransformation = gui.addFolder('Cube Transformation');
		folderTransformation.add(this._properties, 'cubePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.x = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.y = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scale.z = value;
		});

		const folderShader = gui.addFolder('Shader');
		folderShader.add(this._properties, 'shaderInterval', 0.1, 100).step(0.1).onChange((value) => {
			this._cube.children[0].material.uniforms.interval.value = value;
		});
		folderShader.add(this._properties, 'shaderVelocity', 0.1, 1).step(0.1).onChange((value) => {
			this._cube.children[0].material.uniforms.velocity.value = value;
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._cube.children[0].material.uniforms.time.value += this._clock.getDelta();

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
