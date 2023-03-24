import * as THREE from 'three';

import { GUI } from '../../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';


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

		Ammo().then((ammoLib) => {
			this._ammo = ammoLib;

			console.log(this._ammo);

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
		const collisionConfiguration = new this._ammo.btDefaultCollisionConfiguration();
		const dispatcher = new this._ammo.btCollisionDispatcher(collisionConfiguration);
		const broadphase = new this._ammo.btDbvtBroadphase();
		const solver = new this._ammo.btSequentialImpulseConstraintSolver();

		this._tmpTrans = new this._ammo.btTransform();

		this._physicsWorld = new this._ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
		this._physicsWorld.setGravity(new this._ammo.btVector3(0, -9.81, 0));
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._createPlane();
		this._createCube1();

		// walls
		this._createBox(new THREE.Vector3(-25, 2.5, 0), 0.2, 5, 50);
		this._createBox(new THREE.Vector3(25, 2.5, 0), 0.2, 5, 50);
		this._createBox(new THREE.Vector3(0, 2.5, -25), 50, 5, 0.2);
		this._createBox(new THREE.Vector3(0, 2.5, 25), 50, 5, 0.2);
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
			new THREE.LineBasicMaterial( { color: this._properties.cube1WireframeColor } )
		));

		this._createBoxPhysic(box, w, h, l);
	}

	_createBoxPhysic(mesh, w, h, l) {
		// static objects have a mass of 0
		const mass = 0;
		const transform = new this._ammo.btTransform();

		transform.setIdentity();
		transform.setOrigin(new this._ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
		transform.setRotation(new this._ammo.btQuaternion(0, 0, 0, 1));

		const motionState = new this._ammo.btDefaultMotionState(transform);
		const colShape = new this._ammo.btBoxShape(new this._ammo.btVector3(w * 0.5, h * 0.5, l * 0.5));

		colShape.setMargin(1);

		const localInertia = new this._ammo.btVector3(0, 0, 0);

		colShape.calculateLocalInertia(mass, localInertia);

		const rbInfo = new this._ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
		const body = new this._ammo.btRigidBody(rbInfo);

		body.setRestitution(0);

		this._physicsWorld.addRigidBody(body);
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


		const mass = 34;
		const transform = new this._ammo.btTransform();

		transform.setIdentity();
		transform.setOrigin(new this._ammo.btVector3(this._properties.cube1PositionX, this._properties.cube1PositionY, this._properties.cube1PositionZ));
		transform.setRotation(new this._ammo.btQuaternion(0, 0, 0, 1));

		const motionState = new this._ammo.btDefaultMotionState(transform);
		//const colShape = new this._ammo.btBoxShape(new this._ammo.btVector3(2.5, 2.5, 2.5));
		const colShape = new this._ammo.btSphereShape(1.0);

		colShape.setMargin(0.05);

		const localInertia = new this._ammo.btVector3(0, 0, 0);

		colShape.calculateLocalInertia(mass, localInertia);

		const rbInfo = new this._ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
		const body = new this._ammo.btRigidBody(rbInfo);

		//body.setCollisionFlags(0) // 0 is static 1 dynamic 2 kinematic
		body.setActivationState(4); // never sleep
		body.setRestitution(0);

		this._physicsWorld.addRigidBody(body);

		this._cube1.userData.physicsBody = body;
		this._rigidBodies.push(this._cube1);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});

		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		const timeDelta = this._clock.getDelta();



		let forward = 0;
		let left = 0;

		if (this._keyStatus[87]) {
			forward = -0.1;
		}

		if (this._keyStatus[83]) {
			forward = 0.1;
		}

		if (this._keyStatus[65]) {
			left = -0.1;
		}

		if (this._keyStatus[68]) {
			left = 0.1;
		}



		const resultantImpulse = new Ammo.btVector3(forward, 0, left)
		resultantImpulse.op_mul(10);

		const physicsBody = this._cube1.userData.physicsBody;
		physicsBody.applyImpulse(resultantImpulse);



		this._updatePhysics(timeDelta);

		this._renderer.render(this._scene, this._camera);
	}

	_updatePhysics(deltaTime) {
		// Step world
		this._physicsWorld.stepSimulation(deltaTime, 10);

		// Update rigid bodies
		for (let i = 0; i < this._rigidBodies.length; ++i) {
			const objThree = this._rigidBodies[i];
			const objAmmo = objThree.userData.physicsBody;
			const ms = objAmmo.getMotionState();

			if (ms) {
				ms.getWorldTransform(this._tmpTrans);

				let p = this._tmpTrans.getOrigin();
				let q = this._tmpTrans.getRotation();

				objThree.position.set(p.x(), p.y(), p.z());
				objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
			}
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



/*
	activate
	applyCentralForce
	applyCentralImpulse
	applyCentralLocalForce
	applyForce
	applyGravity
	applyImpulse
	applyLocalTorque
	applyTorque
	applyTorqueImpulse

	clearForces

	forceActivationState

	getAabb
	getAngularDamping
	getAngularFactor
	getAngularVelocity
	getBroadphaseHandle
	getBroadphaseProxy
	getCenterOfMassTransform
	getCollisionFlags
	getCollisionShape
	getFriction
	getGravity
	getLinearDamping
	getLinearFactor
	getLinearVelocity
	getMotionState
	getRestitution
	getRollingFriction
	getUserIndex
	getUserPointer
	getWorldTransform

	isActive
	isKinematicObject
	isStaticObject
	isStaticOrKinematicObject

	setActivationState
	setAngularFactor
	setAngularVelocity
	setAnisotropicFriction
	setCcdMotionThreshold
	setCcdSweptSphereRadius
	setCenterOfMassTransform
	setCollisionFlags
	setCollisionShape
	setContactProcessingThreshold
	setDamping
	setFriction
	setGravity
	setLinearFactor
	setLinearVelocity
	setMassProps
	setMotionState
	setRestitution
	setRollingFriction
	setSleepingThresholds
	setUserIndex
	setUserPointer
	setWorldTransform

	upcast
	updateInertiaTensor
*/