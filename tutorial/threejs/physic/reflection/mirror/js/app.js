import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { Reflector } from '../../../../../../lib/threejs_158/examples/jsm/objects/Reflector.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._cube = null;
		this._mirror = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cubeWidth': 5,
			'cubeHeight': 5,
			'cubeDepth': 5,
			'cubeSegmentsX': 1,
			'cubeSegmentsY': 1,
			'cubeSegmentsZ': 1,
			'cubeMaterialColor': '#156289',
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
			'shaderMirrorVisibility': 0.5
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
		this._axesHelper.visible = this._properties.axesHelperVisible;
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._cube = new THREE.Object3D();
		this._scene.add(this._cube);

		this._cube.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.cubeMaterialColor } )
		));

		this._cube.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.cubeWireframeColor } )
		));

		this._createGeometry();
		this._createReflector();
	}

	_createGeometry() {
		const geometry = new THREE.BoxGeometry(
			this._properties.cubeWidth,
			this._properties.cubeHeight,
			this._properties.cubeDepth,
			this._properties.cubeSegmentsX,
			this._properties.cubeSegmentsY,
			this._properties.cubeSegmentsZ
		);

		this._cube.children[0].geometry.dispose();
		this._cube.children[0].geometry = geometry;

		this._cube.children[1].geometry.dispose();
		this._cube.children[1].geometry = new THREE.WireframeGeometry(geometry);
	}

	_createReflector() {
		const shaderMaterial = {
			uniforms: {
				color: { value: null },
				tDiffuse: { value: null },
				textureMatrix: { value: null },

				mirrorVisibility: { type: "f", value: this._properties.shaderMirrorVisibility }
			},

			vertexShader: `
				uniform mat4 textureMatrix;
				varying vec4 vUv;

				void main() {
					vUv = textureMatrix * vec4(position, 1.0);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,

			fragmentShader: `
				uniform vec3 color;
				uniform sampler2D tDiffuse;
				varying vec4 vUv;

				uniform float mirrorVisibility;

				float blendOverlay(float base, float blend) {
					return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));
				}

				vec3 blendOverlay(vec3 base, vec3 blend) {
					return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
				}

				void main() {
					vec4 base = texture2DProj(tDiffuse, vUv);
					gl_FragColor = vec4(blendOverlay(base.rgb, color) * mirrorVisibility, 1.0);
				}
			`
		};

		this._mirror = new Reflector(
			new THREE.PlaneGeometry(50, 50),
			{
				clipBias: 0.0,
				textureWidth: 2048,
				textureHeight: 2048,
				recursion: 1,
				shader: shaderMaterial
			}
		);

		this._mirror.rotation.x = Math.PI / -2;

		this._scene.add(this._mirror);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Cube Geometry');
		folderGeometry.add(this._properties, 'cubeWireframe').onChange((value) => {
			this._cube.children[0].visible = !value;
		});
		folderGeometry.add(this._properties, 'cubeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeDepth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeSegmentsX', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeSegmentsY', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeSegmentsZ', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').onChange((value) => {
			this._cube.children[0].material.color.set(value);
		});
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
		folderShader.add(this._properties, 'shaderMirrorVisibility', 0.0, 1.0).step(0.01).onChange((value) => {
			this._mirror.material.uniforms.mirrorVisibility.value = value;
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
