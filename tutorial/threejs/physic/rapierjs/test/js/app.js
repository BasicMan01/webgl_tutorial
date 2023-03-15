// https://rapier.rs/demos3d/index.html
// https://codesandbox.io/s/tpl-r3f-9cplyk?file=/src/components/Ball.tsx:2349-2355

import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';

import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas) {
		this._canvas = canvas;

		this._ammo = null;
		this._physicsWorld = null;
		this._rigidBodies = [];
		this._tmpTrans = null;

		this._axesHelper = null;
		this._gridHelper = null;
		this._debugHelper = null;
		this._cube1 = null;
		this._cube2 = null;
		this._plane = null;

		this._keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		};

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'debugHelperActive': false,
			'physicImpulse': 50,
			'physicTorque': 30,

			'cube1MaterialColor': '#156289',
			'cube1WireframeColor': '#FFFFFF',
			'cube1PositionX': -4,
			'cube1PositionY': 8,
			'cube1PositionZ': 0,
			'cube1RotationX': 0,
			'cube1RotationY': 0,
			'cube1RotationZ': 0,
			'cube1ScaleX': 1,
			'cube1ScaleY': 1,
			'cube1ScaleZ': 1,
			'cube2MaterialColor': '#891562',
			'cube2WireframeColor': '#FFFFFF',
			'cube2PositionX': 4,
			'cube2PositionY': 8,
			'cube2PositionZ': 0,
			'cube2RotationX': 0,
			'cube2RotationY': 0,
			'cube2RotationZ': 0,
			'cube2ScaleX': 1,
			'cube2ScaleY': 1,
			'cube2ScaleZ': 1
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

		this._render();
	}

	_createPhysics(){
		this._physicsWorld = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
	}

	_createObject() {
		this._createHelper();

		this._createPlane();
		this._createCube1();

		// walls
		this._createBox(new THREE.Vector3(-25, 2.5, 0), 0.2, 5, 50);
		this._createBox(new THREE.Vector3(25, 2.5, 0), 0.2, 5, 50);
		this._createBox(new THREE.Vector3(0, 2.5, -25), 50, 5, 0.2);
		this._createBox(new THREE.Vector3(0, 2.5, 25), 50, 5, 0.2);
	}

	_createHelper(){
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
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
			new THREE.MeshBasicMaterial( { color: 0xAAAAAA, side: THREE.DoubleSide } )
		);

		this._plane.rotation.x = Math.PI / 2;
		this._scene.add(this._plane);

		this._createBoxPhysic(this._plane, 50, 0.001, 50);
	};

	_createBox(position, w, h, l) {
		const box = new THREE.Object3D();
		const geometry = new THREE.BoxGeometry(w, h, l, 1, 1, 1);

		box.position.copy(position);
		this._scene.add(box);

		box.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cube1MaterialColor } )
		));

		box.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial({ color: this._properties.cube1WireframeColor })
		));

		this._createBoxPhysic(box, w, h, l);
	}

	_createBoxPhysic(mesh, w, h, l) {
		const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed);
		const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Cuboid(w, h, l));

		rigidBodyDesc.setTranslation(mesh.position.x, mesh.position.y, mesh.position.z);
		rigidBodyDesc.setRotation({ x: 0.0, y: 0.0, z: 0.0, w: 1.0});

		// All done, actually build the rigid-body.
		const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);

		this._physicsWorld.createCollider(colliderDesc, rigidBody);
	}

	_createCube1() {
		//const geometry = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);
		const geometry = new THREE.SphereGeometry(1.0, 20, 20);

		this._cube1 = new THREE.Object3D();
		this._cube1.position.set(this._properties.cube1PositionX, this._properties.cube1PositionY, this._properties.cube1PositionZ);
		this._scene.add(this._cube1);

		this._cube1.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._properties.cube1MaterialColor } )
		));

		this._cube1.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: this._properties.cube1WireframeColor } )
		));


		const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic);
		const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(1.0));

		rigidBodyDesc.setTranslation(this._properties.cube1PositionX, this._properties.cube1PositionY, this._properties.cube1PositionZ);
		rigidBodyDesc.setRotation({ x: 0.0, y: 0.0, z: 0.0, w: 1.0});
		rigidBodyDesc.setLinearDamping(1.0);
		rigidBodyDesc.setAngularDamping(1.0);
		rigidBodyDesc.setCcdEnabled(true);

		//colliderDesc.setFriction(1.0);
		colliderDesc.setFrictionCombineRule(RAPIER.CoefficientCombineRule.Max);
		colliderDesc.setRestitution(0.6);
		colliderDesc.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max);

		// All done, actually build the rigid-body.
		const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);

		this._physicsWorld.createCollider(colliderDesc, rigidBody);

		this._rigidBodies.push(rigidBody);
		this._cube1.userData.rigidBody = rigidBody;
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

		const folderPhysic = gui.addFolder('Sphere Physic');
		folderPhysic.add(this._properties, 'physicImpulse', 0, 100).step(1).onChange((value) => {
		});
		folderPhysic.add(this._properties, 'physicTorque', 0, 100).step(1).onChange((value) => {
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		const timeDelta = this._clock.getDelta();

		const body = this._cube1.userData.rigidBody;

		const impulse = new THREE.Vector3(0, 0, 0);
		const torque = new THREE.Vector3(0, 0, 0);

		const impulseStrength = this._properties.physicImpulse * timeDelta;
    	const torqueStrength = this._properties.physicTorque * timeDelta;

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

			body.applyImpulse(impulse, true);
		}

		if (body && torque.length() > 0) {
			torque.applyMatrix4(this._camera.matrixWorld).sub(this._camera.position);
			torque.setY(0);
			torque.normalize().setLength(torqueStrength);

			body.applyTorqueImpulse(torque, true);
		}


		//const resultantImpulse = new Ammo.btVector3(forward, 0, left)
		//resultantImpulse.op_mul(10);
		//this._cube1.userData.rigidBody.applyImpulse({ x: forward, y: 0.0, z: left }, true);
		//this._cube1.userData.rigidBody.applyTorqueImpulse({ x: forward, y: 0.0, z: left }, true);

		//const physicsBody = this._cube1.userData.physicsBody;
		//physicsBody.applyImpulse(resultantImpulse);



		this._updatePhysics(timeDelta);

		this._renderer.render(this._scene, this._camera);
	}

	_updatePhysics(deltaTime) {
		// Step world
		this._physicsWorld.step();

		// Update rigid bodies
		for (let i = 0; i < this._rigidBodies.length; ++i) {
			const t = this._rigidBodies[i].translation();
			const r = this._rigidBodies[i].rotation();

			this._cube1.position.set(t.x, t.y, t.z);
			this._cube1.quaternion.set(r.x, r.y, r.z, r.w);
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
