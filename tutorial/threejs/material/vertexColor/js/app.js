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
		this._circle = null;
		this._plane = null;
		this._texture = null;

		this._raycaster = new THREE.Raycaster();
		this._mouseVector2 = new THREE.Vector2();
		this._rightMouseButton = false;

		this._properties = {
			'axesHelperVisible': false,
			'gridHelperVisible': false,
			'eraserColorStart': '#887777',
			'eraserIntensity': 5
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 1.7, 0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = false;
		this._controls.minDistance = 0.01;
		this._controls.maxDistance = 0.01;
		this._controls.minPolarAngle = 0.5;
		this._controls.maxPolarAngle = 2.6;
		this._controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE };
		this._controls.target = this._camera.position.clone();

		this._renderer.domElement.addEventListener('pointerdown', this._onPointerDownHandler.bind(this), false);
		this._renderer.domElement.addEventListener('pointermove', this._onPointerMoveHandler.bind(this), false);
		this._renderer.domElement.addEventListener('pointerup', this._onPointerUpHandler.bind(this), false);

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

		this._circle = new THREE.Mesh(
			new THREE.RingGeometry(0.15, 0.2, 25),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
		);

		this._circle.visible = false;
		this._circle.rotation.x = Math.PI / -2;

		this._scene.add(this._circle);


		this._texture = new THREE.TextureLoader().load('../../../../resources/texture/parquet_02.jpg');

		this._plane = new THREE.Mesh(
			new THREE.PlaneGeometry(5, 5, 100, 100),
			new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: this._texture, vertexColors: true })
		);
		this._plane.rotation.x = Math.PI / -2;

		this._scene.add(this._plane);

		this._createMaterial(this._properties.eraserColorStart);
	}

	_createMaterial(hex) {
		const color = new THREE.Color(hex);
		const colors = [];

		for (let i = 0; i < this._plane.geometry.attributes.position.count; i++) {
			colors.push(color.r, color.g, color.b);
		}

		this._plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	}

	_updateMaterial(hex) {
		const color = new THREE.Color(hex);

		const pos = this._plane.geometry.attributes.position;
		const col = this._plane.geometry.attributes.color;

		for (let i = 0; i < pos.count; i++) {
			const colorIndex = i * 3;

			col.array[colorIndex] = color.r;
			col.array[colorIndex + 1] = color.g;
			col.array[colorIndex + 2] = color.b;
		}

		this._plane.geometry.attributes.color.needsUpdate = true;
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderEraser = gui.addFolder('Eraser Properties');
		folderEraser.addColor(this._properties, 'eraserColorStart').onChange((value) => {
			this._updateMaterial(value);
		});
		folderEraser.add(this._properties, 'eraserIntensity', 1, 10).step(0.1).onChange((value) => {
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._controls.update(this._clock.getDelta());

		this._renderer.render(this._scene, this._camera);
	}

	_changeColor(intersectPoint) {
		const pos = this._plane.geometry.attributes.position;
		const col = this._plane.geometry.attributes.color;
		const radius = 0.2;

		for (let i = 0; i < pos.count; i++) {
			const vertex = new THREE.Vector3().fromBufferAttribute(pos, i);
			this._plane.localToWorld(vertex);

			if (vertex.distanceTo(intersectPoint) < radius) {
				const colorIndex = i * 3;
				const itensity = this._properties.eraserIntensity / 1000;

				col.array[colorIndex] = Math.min(col.array[colorIndex] + itensity, 0.6); // R
				col.array[colorIndex + 1] = Math.min(col.array[colorIndex + 1] + itensity, 0.5); // G
				col.array[colorIndex + 2] = Math.min(col.array[colorIndex + 2] + itensity, 0.4); // B
			}
		}

		col.needsUpdate = true;
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onPointerDownHandler(event) {
		if (event.button === 2) {
			this._rightMouseButton = true;
		}
	}

	_onPointerUpHandler(event) {
		if (event.button === 2) {
			this._rightMouseButton = false;
		}
	}

	_onPointerMoveHandler(event) {
		this._mouseVector2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this._mouseVector2.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		this._raycaster.setFromCamera(this._mouseVector2, this._camera);

		const intersects = this._raycaster.intersectObject(this._plane);

		if (intersects.length > 0) {
			const circleCenter = new THREE.Vector3();

			circleCenter.copy(intersects[0].face.normal);
			circleCenter.applyMatrix4(new THREE.Matrix4().extractRotation(intersects[0].object.matrixWorld));
			// difference to the ground (height)
			circleCenter.multiplyScalar(0.01);
			circleCenter.add(intersects[0].point);

			// move the circel to the calculated intersection point
			this._circle.position.copy(circleCenter);
			this._circle.visible = true;

			if (this._rightMouseButton) {
				this._changeColor(intersects[0].point);
			}
		} else {
			this._circle.visible = false;
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}
}
