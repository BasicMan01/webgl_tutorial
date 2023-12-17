import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../../../lib/threejs_158/examples/jsm/loaders/FBXLoader.js';

import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._hemisphereLight = null;
		this._directionalLight = null;

		this._character = null;
		this._environment = null;

		this._mixer = null;
		this._animations = {};
		this._currentAnimation = null;

		this._forward = false;
		this._rotate = false;
		this._velocity = new THREE.Vector3(1.5, 9.81, 1.5);
		this._characterController = null;
		this._rigidBodies = [];

		this._properties = {
			'axesHelperVisible': false,
			'gridHelperVisible': true,
			'collisionHelperVisible': true,

			'fbxModelMaterialColor': '#156289',
			'fbxModelWireframe': false,

			'hemisphereSkyColor': '#FFFFFF',
			'hemisphereGroundColor': '#303030',
			'hemisphereIntensity': 3.5,
			'directionalColor': '#FFFFFF',
			'directionalIntensity': 0.8,

			'characterAutoStepEnable': false,
			'characterMaxHeight': 0.3,
			'characterMinWidth': 0.2,
			'characterSnapToGroundEnable': true,
			'characterSnapToGround': 0.7,
			'characterMaxClimbAngle': 60,
			'characterMinSlideAngle': 45,

			'cameraLinesVisible': false,
			'cameraMoveSpeed': 10
		};

		this._fbxLoader = new FBXLoader();

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(5, 2.5, 2.0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = true;
		this._controls.minDistance = 0.3;
		this._controls.maxDistance = 15.0; // 100
		this._controls.minPolarAngle = 0.1;
		this._controls.maxPolarAngle = 2.0; //1.7;
		this._controls.mouseButtons = {
			LEFT: THREE.MOUSE.ROTATE,
			RIGHT: THREE.MOUSE.ROTATE
		};

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._renderer.domElement.addEventListener('pointerdown', this._onPointerDownHandler.bind(this), false);
		this._renderer.domElement.addEventListener('pointerup', this._onPointerUpHandler.bind(this), false);

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		RAPIER.init().then(() => {
			console.log('RAPIER Version: ' + RAPIER.version());

			this._init();
		});
	}

	_init() {
		this._createPhysics();

		this._createGui();
		this._createObject();
		this._createLight();

		this._loadEnvironment();
		this._loadCharacter();
	}

	_createPhysics(){
		this._physicsWorld = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

		this._characterController = this._physicsWorld.createCharacterController(0.01);
		this._characterController.setUp({ x: 0.0, y: 1.0, z: 0.0 });
		this._characterController.setMaxSlopeClimbAngle(this._properties.characterMaxClimbAngle * Math.PI / 180);
		this._characterController.setMinSlopeSlideAngle(this._properties.characterMinSlideAngle * Math.PI / 180);
		this._setAutoStep();
		this._setSnapToGround();
	}

	_setAutoStep() {
		if (this._properties.characterAutoStepEnable) {
			this._characterController.enableAutostep(this._properties.characterMaxHeight, this._properties.characterMinWidth, true);
		} else {
			this._characterController.disableAutostep();
		}
	}

	_setSnapToGround() {
		if (this._properties.characterSnapToGroundEnable) {
			this._characterController.enableSnapToGround(this._properties.characterSnapToGround);
		} else {
			this._characterController.disableSnapToGround();
		}
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._axesHelper.visible = this._properties.axesHelperVisible;
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(130, 130);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._debugHelper = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors
			})
		);
		this._scene.add(this._debugHelper);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});
		gui.add(this._properties, 'collisionHelperVisible').onChange((value) => {
		});

		const folderGeometry = gui.addFolder('FBX Model Geometry');
		folderGeometry.add(this._properties, 'fbxModelWireframe').onChange((value) => {
			this._character.getObjectByName('Alpha_Surface').material.wireframe = value;
		});

		const folderMaterial = gui.addFolder('FBX Model Material');
		folderMaterial.addColor(this._properties, 'fbxModelMaterialColor').onChange((value) => {
			this._character.getObjectByName('Alpha_Surface').material.color.set(value);
		});

		const folderCharacterPhysic = gui.addFolder('Character Physic');
		folderCharacterPhysic.add(this._properties, 'characterAutoStepEnable').onChange((value) => {
			this._setAutoStep();
		});
		folderCharacterPhysic.add(this._properties, 'characterMaxHeight', 0, 1).step(0.01).onChange((value) => {
			this._setAutoStep();
		});
		folderCharacterPhysic.add(this._properties, 'characterMinWidth', 0, 1).step(0.01).onChange((value) => {
			this._setAutoStep();
		});

		folderCharacterPhysic.add(this._properties, 'characterSnapToGroundEnable').onChange((value) => {
			this._setSnapToGround();
		});
		folderCharacterPhysic.add(this._properties, 'characterSnapToGround', 0, 2).step(0.1).onChange((value) => {
			this._setSnapToGround();
		});
		folderCharacterPhysic.add(this._properties, 'characterMaxClimbAngle', 0, 180).step(1).onChange((value) => {
			this._characterController.setMaxSlopeClimbAngle(value * Math.PI / 180);
		});
		folderCharacterPhysic.add(this._properties, 'characterMinSlideAngle', 0, 180).step(1).onChange((value) => {
			this._characterController.setMinSlopeSlideAngle(value * Math.PI / 180);
		});

		const folderCameraPhysic = gui.addFolder('Camera Physic');
		folderCameraPhysic.add(this._properties, 'cameraLinesVisible').onChange((value) => {
		});
		folderCameraPhysic.add(this._properties, 'cameraMoveSpeed', 0, 50).step(1).onChange((value) => {
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

		this._directionalLight = new THREE.DirectionalLight(
			this._properties.directionalColor,
			this._properties.directionalIntensity
		);
		this._directionalLight.position.set(20, 50, 0);
		this._scene.add(this._directionalLight);
	}

	_loadEnvironment() {
		this._fbxLoader.load('../../../../../resources/mesh/fbx/physic_01.fbx', (object) => {
			this._environment = object;
			this._scene.add(this._environment);

			for (let i = 0; i < this._environment.children.length; ++i) {
				const child = this._environment.children[i];

				const vertices = child.geometry.attributes.position.array;
				const indices = [...Array(vertices.length / 3).keys()];

				const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed);
				const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.TriMesh(vertices, indices));

				rigidBodyDesc.setTranslation(child.position.x, child.position.y, child.position.z);
				rigidBodyDesc.setRotation(child.quaternion);

				// All done, actually build the rigid-body.
				const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
				const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);

				collider.userData = {};
				collider.userData.name = child.name;
			}
		}, this._onProgress, this._onError);
	}

	_loadCharacter() {
		this._fbxLoader.load('../../../../../resources/mesh/fbx/character/character.fbx', (object) => {
			this._character = object;
			this._character.position.set(5, 0, 5);
			this._character.scale.setScalar(0.01);
			this._character.getObjectByName('Alpha_Surface').material.color.set(this._properties.fbxModelMaterialColor);

			this._scene.add(this._character);

			this._mixer = new THREE.AnimationMixer(this._character);

			this._fbxLoader.load('../../../../../resources/mesh/fbx/character/animation/idle.fbx', (object) => {
				this._addAnimation('character.animation.idle', object.animations[0]);
				this._setAnimationState('character.animation.idle');

				const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.KinematicPositionBased);
				const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Capsule(0.45, 0.45)); // height / 2 / width

				rigidBodyDesc.setTranslation(this._character.position.x, this._character.position.y, this._character.position.z);
				rigidBodyDesc.setRotation(this._character.quaternion);

				colliderDesc.translation.y = 0.91;

				const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
				const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);

				this._character.userData.rigidBody = rigidBody;
				this._character.userData.rigidBodyDesc = rigidBodyDesc;
				this._character.userData.collider = collider;

				this._render();
			});

			this._fbxLoader.load('../../../../../resources/mesh/fbx/character/animation/walk.fbx', (object) => {
				this._addAnimation('character.animation.walk', object.animations[0]);
			});
		}, this._onProgress, this._onError);
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

			this._character.rotation.y = rotation.y + Math.PI;
		}



		const direction = new THREE.Vector3(0, -1, this._forward ? 1 : 0);

		direction.applyQuaternion(this._character.quaternion);
		direction.normalize();
		direction.multiply(this._velocity);
		direction.multiplyScalar(timeDelta);

		const desiredPosition = new RAPIER.Vector3(direction.x, direction.y, direction.z);

		this._characterController.computeColliderMovement(this._character.userData.collider, desiredPosition);

		const correctedMovement = this._characterController.computedMovement();

		const translation = this._character.userData.rigidBody.translation();

		this._character.userData.rigidBody.setNextKinematicTranslation({
			x: translation.x + correctedMovement.x,
			y: translation.y + correctedMovement.y,
			z: translation.z + correctedMovement.z
		});

		this._character.position.add(correctedMovement);
		this._camera.position.add(correctedMovement);

		const characterTarget = new THREE.Vector3(this._character.position.x, this._character.position.y + 1.7, this._character.position.z);

		this._controls.target.copy(characterTarget);
		this._controls.update();



		const rayDiff = characterTarget.clone().sub(this._camera.position);
		const rayDirection = rayDiff.clone().normalize();

		const maxToi = rayDiff.length();
		const solid = false;
		const ray = new RAPIER.Ray(
			{ x: this._camera.position.x, y: this._camera.position.y, z: this._camera.position.z },
			{ x: rayDirection.x, y: rayDirection.y, z: rayDirection.z }
		);

		// Use 4 to exclude Kinematic Collider
		const hit = this._physicsWorld.castRay(ray, maxToi, solid, 4);
		if (hit != null) {
			if (this._properties.cameraLinesVisible) {
				this._drawLine(this._camera.position, this._character.position);
			}

			this._camera.position.add(rayDirection.multiplyScalar(timeDelta * this._properties.cameraMoveSpeed));
		}



		this._mixer.update(timeDelta);

		this._updatePhysics();

		this._renderer.render(this._scene, this._camera);
	}

	_updatePhysics() {
		// Step world
		this._physicsWorld.step();

		// Update rigid bodies
		for (let i = 0; i < this._rigidBodies.length; ++i) {
			const obj = this._rigidBodies[i];

			const t = obj.userData.rigidBody.translation();
			const r = obj.userData.rigidBody.rotation();

			obj.position.set(t.x, t.y, t.z);
			obj.quaternion.set(r.x, r.y, r.z, r.w);
		}

		if (this._properties.collisionHelperVisible) {
			const buffers = this._physicsWorld.debugRender();

			this._debugHelper.geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3));
			this._debugHelper.geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 4));
		} else {
			this._debugHelper.geometry.deleteAttribute('position');
			this._debugHelper.geometry.deleteAttribute('color');
		}
	}

	_drawLine(v1, v2) {
		const points = [];

		points.push(new THREE.Vector3(v1.x, v1.y, v1.z));
		points.push(new THREE.Vector3(v2.x, v2.y + 1.7, v2.z));

		const line = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(points),
			new THREE.LineBasicMaterial({ color: 0x0000ff })
		);
		this._scene.add(line);
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
