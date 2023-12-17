import * as THREE from 'three';

import { GUI } from '../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../lib/threejs_158/examples/jsm/loaders/FBXLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._hemisphereLight = null;
		this._fbxModel = null;
		this._mixer = null;
		this._animations = {};
		this._currentAnimation = null;
		this._forward = false;
		this._rotate = false;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'hemisphereSkyColor': '#FFFFFF',
			'hemisphereGroundColor': '#303030',
			'hemisphereIntensity': 3.5,
			'fbxModelMaterialColor': '#156289',
			'fbxModelWireframe': false
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 2.5, -3.0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = true;
		this._controls.minDistance = 1.5;
		this._controls.maxDistance = 10.0;
		this._controls.minPolarAngle = 0.1;
		this._controls.maxPolarAngle = 1.7;
		this._controls.mouseButtons = {
			LEFT: THREE.MOUSE.ROTATE,
			RIGHT: THREE.MOUSE.ROTATE
		};
		this._controls.target = new THREE.Vector3(0, 1.7, 0);
		this._controls.update();

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._renderer.domElement.addEventListener('pointerdown', this._onPointerDownHandler.bind(this), false);
		this._renderer.domElement.addEventListener('pointerup', this._onPointerUpHandler.bind(this), false);

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();
		this._createLight();
	}

	_createObject() {
		const fbxLoader = new FBXLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		fbxLoader.load('../../../resources/mesh/fbx/character/character.fbx', (object) => {
			this._fbxModel = object;
			this._fbxModel.scale.setScalar(0.01);
			this._fbxModel.getObjectByName('Alpha_Surface').material.color.set(this._properties.fbxModelMaterialColor);

			this._scene.add(this._fbxModel);

			this._mixer = new THREE.AnimationMixer(this._fbxModel);

			fbxLoader.load('../../../resources/mesh/fbx/character/animation/idle.fbx', (object) => {
				this._addAnimation('character.animation.idle', object.animations[0]);
				this._setAnimationState('character.animation.idle');

				this._render();
			});

			fbxLoader.load('../../../resources/mesh/fbx/character/animation/walk.fbx', (object) => {
				this._addAnimation('character.animation.walk', object.animations[0]);
			});
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

		const folderGeometry = gui.addFolder('FBX Model Geometry');
		folderGeometry.add(this._properties, 'fbxModelWireframe').onChange((value) => {
			this._fbxModel.getObjectByName('Alpha_Surface').material.wireframe = value;
		});

		const folderMaterial = gui.addFolder('FBX Model Material');
		folderMaterial.addColor(this._properties, 'fbxModelMaterialColor').onChange((value) => {
			this._fbxModel.getObjectByName('Alpha_Surface').material.color.set(value);
		});

		gui.close();
	}

	_createLight() {
		this._hemisphereLight = new THREE.HemisphereLight(
			this._properties.hemisphereSkyColor,
			this._properties.hemisphereGroundColor,
			this._properties.hemisphereIntensity
		);
		this._scene.add(this._hemisphereLight);
	}

	_addAnimation(key, animation) {
		this._animations[key] = {
			'name': key,
			'action': this._mixer.clipAction(animation)
		};
	}

	_setAnimationState(state) {
		const previewAction = this._currentAnimation;

		if (previewAction) {
			if (previewAction.name === state) {
				return;
			}
		}

		if (!this._animations.hasOwnProperty(state)) {
			return;
		}

		this._currentAnimation = this._animations[state];

		switch (state) {
			case 'character.animation.idle':
				this._setIdle(previewAction);
				break;

			case 'character.animation.walk':
				this._setWalk(previewAction);
				break;
		}
	}

	_setIdle(previewAction) {
		const currentAction = this._animations['character.animation.idle'].action;

		if (previewAction) {
			currentAction.time = 0.0;
			currentAction.enabled = true;
			currentAction.setEffectiveTimeScale(1.0);
			currentAction.setEffectiveWeight(1.0);
			currentAction.crossFadeFrom(previewAction.action, 0.3, true);
			currentAction.play();
		} else {
			// initial start
			currentAction.play();
		}
	}

	_setWalk(previewAction) {
		const currentAction = this._animations['character.animation.walk'].action;

		if (previewAction) {
			currentAction.time = 0.0;
			currentAction.enabled = true;
			currentAction.setEffectiveTimeScale(1.0);
			currentAction.setEffectiveWeight(1.0);
			currentAction.crossFadeFrom(previewAction.action, 0.3, true);
			currentAction.play();
		} else {
			// initial start
			currentAction.play();
		}
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		const timeDelta = this._clock.getDelta();

		if (this._forward) {
			this._setAnimationState('character.animation.walk');
		} else {
			this._setAnimationState('character.animation.idle');
		}

		if (this._rotate) {
			const rotation = new THREE.Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

			this._fbxModel.rotation.y = rotation.y + Math.PI;
		}

		if (this._forward) {
			let forward = new THREE.Vector3(0, 0, 1);

			forward.applyQuaternion(this._fbxModel.quaternion);
			forward.normalize();
			forward.multiplyScalar(timeDelta * 1.5);

			this._fbxModel.position.add(forward);
			this._camera.position.add(forward);

			this._controls.target.copy(new THREE.Vector3(this._fbxModel.position.x, 1.7, this._fbxModel.position.z));
			this._controls.update();
		}

		this._mixer.update(timeDelta);

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 87: { // 1
				event.preventDefault();
				this._forward = true;
			} break;
		}
	}

	_onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 87: { // 1
				event.preventDefault();
				this._forward = false;
			} break;
		}
	}

	_onPointerDownHandler(event) {
		if (event.button == 0) {
			this._rotate = true;
		}
	}

	_onPointerUpHandler(event) {
		if (event.button == 0) {
			this._rotate = false;
		}
	}

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
