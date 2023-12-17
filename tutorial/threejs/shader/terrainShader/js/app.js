import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../../../../../lib/threejs_158/examples/jsm/loaders/GLTFLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._terrain = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'shaderRepeat': 10.0,
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
		const gltfLoader = new GLTFLoader();
		const textureLoader = new THREE.TextureLoader();

		const geometry = new THREE.PlaneGeometry(10, 10);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		//gltfLoader.setResourcePath('../../../../resources/texture/');
		gltfLoader.load('../../../../resources/mesh/gltf/terrain.glb', (object) => {
			this._terrain = object.scene.getObjectByName('Terrain');

			this._terrain.material = new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					textureMask: { type: "t", value: textureLoader.load('../../../../resources/texture/mask.png')},
					textureGrass: { type: "t", value: textureLoader.load('../../../../resources/texture/grass.jpg')},
					textureCliff: { type: "t", value: textureLoader.load('../../../../resources/texture/cliff.jpg')},
					textureMud: { type: "t", value: textureLoader.load('../../../../resources/texture/mud.jpg')},
					textureStone: { type: "t", value: textureLoader.load('../../../../resources/texture/stone.jpg')},
					repeat: { value: [this._properties.shaderRepeat, this._properties.shaderRepeat] }
				},

				vertexShader: `
					varying vec2 vUv;

					void main() {
						vUv = uv;

						vUv.y = 1.0 - vUv.y;

						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,

				fragmentShader: `
					uniform sampler2D textureMask;
					uniform sampler2D textureGrass;
					uniform sampler2D textureCliff;
					uniform sampler2D textureMud;
					uniform sampler2D textureStone;
					uniform vec2 repeat;

					varying vec2 vUv;

					void main() {
						vec2 repeatUv = fract(vUv * repeat);

						vec4 mask = texture2D(textureMask, vUv);
						vec4 grass = texture2D(textureGrass, repeatUv);
						vec4 cliff = texture2D(textureCliff, repeatUv);
						vec4 mud = texture2D(textureMud, repeatUv);
						vec4 stone = texture2D(textureStone, repeatUv);

						grass.rgb = mix(grass.rgb, cliff.rgb, mask.r * cliff.a);
						grass.rgb = mix(grass.rgb, mud.rgb, mask.g * cliff.a);
						grass.rgb = mix(grass.rgb, stone.rgb, mask.b * cliff.a);

						gl_FragColor = grass;
					}
				`
			});

			this._scene.add(object.scene);
		}, this._onProgress, this._onError);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderShader = gui.addFolder('Shader');
		folderShader.add(this._properties, 'shaderRepeat', 1, 10).step(0.1).onChange((value) => {
			this._terrain.material.uniforms.repeat.value = [value, value];
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
