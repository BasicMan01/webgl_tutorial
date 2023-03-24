// https://rapier.rs/demos3d/index.html
// https://codesandbox.io/s/tpl-r3f-9cplyk?file=/src/components/Ball.tsx:2349-2355

import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../../../lib/threejs_140/examples/jsm/loaders/FBXLoader.js';

import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas) {
		this._canvas = canvas;

		this._physicsWorld = null;
		this._rigidBodies = [];

		this._axesHelper = null;
		this._gridHelper = null;
		this._debugHelper = null;

		this._ambientLight = null;
		this._hemisphereLight = null;
		this._directionalLight = null;

		this._cube = null;
		this._plane = null;
		this._sphere = null;
		this._fbxModel = null;

		this._camWorldDirection = new THREE.Vector3();
		this._objWorldPosition = new THREE.Vector3();

		this._keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		};

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'debugHelperActive': true,

			'wireframeColor': '#FFFFFF',

			'ambientColor': '#303030',
			'ambientIntensity': 0.3,
			'hemisphereSkyColor': '#87CEFA',
			'hemisphereGroundColor': '#303030',
			'hemisphereIntensity': 0.8,
			'directionalColor': '#FFFFFF',
			'directionalIntensity': 0.8,

			'cubeMaterialColor': '#156289',
			'cubePositionX': 4,
			'cubePositionY': 2.5,
			'cubePositionZ': 8,
			'cubeRotationX': 0,
			'cubeRotationY': 0,
			'cubeRotationZ': 0,
			'cubeScaleX': 1,
			'cubeScaleY': 1,
			'cubeScaleZ': 1,

			'cubePhysicFriction': 1.0,

			'sphereMaterialColor': '#156289',
			'spherePositionX': -4,
			'spherePositionY': 25,
			'spherePositionZ': 0,
			'sphereRotationX': 0,
			'sphereRotationY': 0,
			'sphereRotationZ': 0,
			'sphereScaleX': 1,
			'sphereScaleY': 1,
			'sphereScaleZ': 1,

			'spherePhysicImpulse': 50,
			'spherePhysicTorque': 30,
			'spherePhysicLinearDamping': 0.2,
			'spherePhysicAngularDamping': 1.0,
			'spherePhysicFriction': 1.0,
			'spherePhysicRestitution': 0.9
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

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		RAPIER.init().then((x) => {
			console.log('RAPIER Version: ' + RAPIER.version());

			this._init();
		});
	}

	_init() {
		this._createPhysics();

		this._createGui();
		this._createObject();
		this._createLight();

		this._render();
	}

	_createPhysics(){
		this._physicsWorld = new RAPIER.World({ x: 0.0, y: -60, z: 0.0 });
	}

	_createObject() {
		const fbxLoader = new FBXLoader();

		this._createHelper();

		this._createCube();
		this._createSphere();

		// fbx
		//fbxLoader.setResourcePath('../../../../resources/texture/');
		fbxLoader.load('../../../../../resources/mesh/fbx/physic_01.fbx', (object) => {
			this._fbxModel = object;
			this._scene.add(this._fbxModel);

			// console.log(this._fbxModel.children);

			for (let i = 0; i < this._fbxModel.children.length; ++i) {
				const child = this._fbxModel.children[i];

				//child.material.wireframe = true;
				//this._fbxModel.children[i].material.visible = false;

				const vertices = child.geometry.attributes.position.array;
				const indices = [...Array(vertices.length / 3).keys()];

				const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed);
				const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.TriMesh(vertices, indices));

				rigidBodyDesc.setTranslation(child.position.x, child.position.y, child.position.z);
				rigidBodyDesc.setRotation(child.quaternion);

				// All done, actually build the rigid-body.
				const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
				const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);
			}
		}, this._onProgress, this._onError);
	}

	_createHelper(){
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(200, 200);
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

	_createPlane() {
		this._plane = new THREE.Mesh(
			new THREE.PlaneGeometry(50, 50, 50, 50),
			new THREE.MeshPhongMaterial( { color: 0xAAAAAA, side: THREE.DoubleSide } )
		);

		this._plane.rotation.x = Math.PI / 2;
		this._scene.add(this._plane);

		this._createBoxPhysic(this._plane, 50, 0.001, 50);
	};

	_createBox(position, w, h, l) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(w, h, l, 1, 1, 1),
			new THREE.MeshPhongMaterial( { color: 0xAAAAAA } )
		);

		box.position.copy(position);
		this._scene.add(box);

		this._createBoxPhysic(box, w, h, l);
	}

	_createBoxPhysic(mesh, w, h, l) {
		const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed);
		const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Cuboid(w / 2, h / 2, l / 2));

		rigidBodyDesc.setTranslation(mesh.position.x, mesh.position.y, mesh.position.z);
		rigidBodyDesc.setRotation({ x: 0.0, y: 0.0, z: 0.0, w: 1.0});

		// All done, actually build the rigid-body.
		const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
		const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);
	}

	_createCube() {
		this._cube = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2, 1, 1, 1),
			new THREE.MeshPhongMaterial( { color: this._properties.cubeMaterialColor } )
		);
		this._cube.position.set(this._properties.cubePositionX, this._properties.cubePositionY, this._properties.cubePositionZ);
		this._scene.add(this._cube);


		const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic);
		const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Cuboid(1.0, 1.0, 1.0));

		rigidBodyDesc.setTranslation(this._properties.cubePositionX, this._properties.cubePositionY, this._properties.cubePositionZ);
		rigidBodyDesc.setRotation({ x: 0.0, y: 0.0, z: 0.0, w: 1.0});
		//rigidBodyDesc.setLinearDamping(this._properties.spherePhysicLinearDamping);
		//rigidBodyDesc.setAngularDamping(this._properties.spherePhysicAngularDamping);
		rigidBodyDesc.setCcdEnabled(true);

		colliderDesc.setFriction(this._properties.cubePhysicFriction);

		const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
		const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);

		this._rigidBodies.push(this._cube);
		this._cube.userData.rigidBody = rigidBody;
		this._cube.userData.collider = collider;
	}

	_createSphere() {
		this._sphere = new THREE.Mesh(
			new THREE.SphereGeometry(1.0, 20, 20),
			new THREE.MeshPhongMaterial( { color: this._properties.sphereMaterialColor } )
		);
		this._sphere.position.set(this._properties.spherePositionX, this._properties.spherePositionY, this._properties.spherePositionZ);
		this._scene.add(this._sphere);


		const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic);
		const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(1.0));

		rigidBodyDesc.setTranslation(this._properties.spherePositionX, this._properties.spherePositionY, this._properties.spherePositionZ);
		rigidBodyDesc.setRotation({ x: 0.0, y: 0.0, z: 0.0, w: 1.0});
		rigidBodyDesc.setLinearDamping(this._properties.spherePhysicLinearDamping);
		rigidBodyDesc.setAngularDamping(this._properties.spherePhysicAngularDamping);
		rigidBodyDesc.setCcdEnabled(true);

		colliderDesc.setFriction(this._properties.spherePhysicFriction);
		colliderDesc.setFrictionCombineRule(RAPIER.CoefficientCombineRule.Max);
		colliderDesc.setRestitution(this._properties.spherePhysicRestitution);
		colliderDesc.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max);

		const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
		const collider = this._physicsWorld.createCollider(colliderDesc, rigidBody);

		this._rigidBodies.push(this._sphere);
		this._sphere.userData.rigidBody = rigidBody;
		this._sphere.userData.collider = collider;
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});
		gui.add(this._properties, 'debugHelperActive').onChange((value) => {
		});

		const folderLight = gui.addFolder('Light');
		folderLight.addColor(this._properties, 'ambientColor').onChange((value) => {
			this._ambientLight.color.set(value);
		});
		folderLight.add(this._properties, 'ambientIntensity', 0, 1).step(0.01).onChange((value) => {
			this._ambientLight.intensity = value;
		});
		folderLight.addColor(this._properties, 'hemisphereSkyColor').onChange((value) => {
			this._hemisphereLight.color.set(value);
		});
		folderLight.addColor(this._properties, 'hemisphereGroundColor').onChange((value) => {
			this._hemisphereLight.groundColor.set(value);
		});
		folderLight.add(this._properties, 'hemisphereIntensity', 0, 1).step(0.01).onChange((value) => {
			this._hemisphereLight.intensity = value;
		});
		folderLight.addColor(this._properties, 'directionalColor').onChange((value) => {
			this._ambientLight.color.set(value);
		});
		folderLight.add(this._properties, 'directionalIntensity', 0, 1).step(0.01).onChange((value) => {
			this._ambientLight.intensity = value;
		});

		const folderMaterial = gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').onChange((value) => {
			this._cube.children[0].material.color.set(value);
		});

		const folderCubePhysic = gui.addFolder('Cube Physic');
		folderCubePhysic.add(this._properties, 'cubePhysicFriction', 0, 3).step(0.1).onChange((value) => {
			this._cube.userData.collider.setFriction(value);
		});


		const folderSpherePhysic = gui.addFolder('Sphere Physic');
		folderSpherePhysic.add(this._properties, 'spherePhysicImpulse', 0, 100).step(1).onChange((value) => {
		});
		folderSpherePhysic.add(this._properties, 'spherePhysicTorque', 0, 100).step(1).onChange((value) => {
		});
		folderSpherePhysic.add(this._properties, 'spherePhysicLinearDamping', 0, 3).step(0.1).onChange((value) => {
			this._sphere.userData.rigidBody.setLinearDamping(value);
		});
		folderSpherePhysic.add(this._properties, 'spherePhysicAngularDamping', 0, 3).step(0.1).onChange((value) => {
			this._sphere.userData.rigidBody.setAngularDamping(value);
		});
		folderSpherePhysic.add(this._properties, 'spherePhysicFriction', 0, 3).step(0.1).onChange((value) => {
			this._sphere.userData.collider.setFriction(value);
		});
		folderSpherePhysic.add(this._properties, 'spherePhysicRestitution', 0, 3).step(0.1).onChange((value) => {
			this._sphere.userData.collider.setRestitution(value);
		});

		gui.close();
	}

	_createLight() {
		this._ambientLight = new THREE.AmbientLight(
			this._properties.ambientColor,
			this._properties.ambientIntensity
		);
		this._scene.add(this._ambientLight);

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

	_render() {
		requestAnimationFrame(this._render.bind(this));

		const timeDelta = this._clock.getDelta();

		const body = this._sphere.userData.rigidBody;

		const impulse = new THREE.Vector3(0, 0, 0);
		const torque = new THREE.Vector3(0, 0, 0);

		const impulseStrength = this._properties.spherePhysicImpulse * timeDelta;
    	const torqueStrength = this._properties.spherePhysicTorque * timeDelta;

		if (this._keyStatus[87]) {
			impulse.z = -1;
      		torque.x = -1;
		}

		if (this._keyStatus[83]) {
			impulse.z = 1;
      		torque.x = 1;
		}

		if (this._keyStatus[65]) {
			impulse.x = -1;
    		torque.z = 1;
		}

		if (this._keyStatus[68]) {
			impulse.x = 1;
      		torque.z = -1;
		}


		if (body && impulse.length() > 0) {
			impulse.applyMatrix4(this._camera.matrixWorld).sub(this._camera.position);
			impulse.setY(0);
			impulse.normalize().setLength(impulseStrength);

			console.log(impulse);

			body.applyImpulse(impulse, true);
		}

		if (body && torque.length() > 0) {
			torque.applyMatrix4(this._camera.matrixWorld).sub(this._camera.position);
			torque.setY(0);
			torque.normalize().setLength(torqueStrength);

			body.applyTorqueImpulse(torque, true);
		}

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

		if (this._properties.debugHelperActive) {
			const buffers = this._physicsWorld.debugRender();

			this._debugHelper.geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3));
			this._debugHelper.geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 4));
		} else {
			this._debugHelper.geometry.deleteAttribute('position');
			this._debugHelper.geometry.deleteAttribute('color');
		}
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this._keyStatus[event.keyCode] = true;
			} break;
		}
	}

	_onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this._keyStatus[event.keyCode] = false;
			} break;
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
