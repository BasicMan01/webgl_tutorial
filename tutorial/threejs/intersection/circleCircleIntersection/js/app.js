import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';

import HelperUtil from '../../../../../resources/js/helperUtil.js';
import Vector3 from '../../../../../resources/js/vector3.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._circle1 = null;
		this._circle2 = null;
		this._circle3 = null;
		this._lineCenterToCenter = null;
		this._lineIntersectToIntersect = [];

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false,
			'circle1CenterX': 4.5,
			'circle1CenterY': 6,
			'circle1Radius': 5,
			'circle1Color': '#FFFFFF',
			'circle2CenterX': 5.5,
			'circle2CenterY': -1,
			'circle2Radius': 5,
			'circle2Color': '#FFFFFF',
			'circle3CenterX': -3.5,
			'circle3CenterY': 2,
			'circle3Radius': 5,
			'circle3Color': '#FFFFFF',
			'circlePoints': 50,
			'circleTolerance': 0
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
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._circle1 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.circle1Color } )
		);
		this._scene.add(this._circle1);

		this._circle2 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.circle2Color } )
		);
		this._scene.add(this._circle2);

		this._circle3 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.circle3Color } )
		);
		this._scene.add(this._circle3);

		this._lineCenterToCenter = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0x00FFFF } )
		);
		this._scene.add(this._lineCenterToCenter);

		for (let i = 0; i < 3; ++i) {
			this._lineIntersectToIntersect[i] = new THREE.Line(
				new THREE.BufferGeometry(),
				new THREE.LineBasicMaterial( { color: 0xFFFF00 } )
			);

			this._scene.add(this._lineIntersectToIntersect[i]);
		}

		this._createGeometry();
	}

	_createGeometry() {
		const intersectionPoints = [];

		this._createCircle(this._circle1, this._properties.circle1CenterX, this._properties.circle1CenterY, this._properties.circle1Radius);
		this._createCircle(this._circle2, this._properties.circle2CenterX, this._properties.circle2CenterY, this._properties.circle2Radius);
		this._createCircle(this._circle3, this._properties.circle3CenterX, this._properties.circle3CenterY, this._properties.circle3Radius);


		this._lineCenterToCenter.geometry.dispose();
		this._lineCenterToCenter.geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(this._properties.circle1CenterX, this._properties.circle1CenterY, 0),
			new THREE.Vector3(this._properties.circle2CenterX, this._properties.circle2CenterY, 0),
			new THREE.Vector3(this._properties.circle3CenterX, this._properties.circle3CenterY, 0),
			new THREE.Vector3(this._properties.circle1CenterX, this._properties.circle1CenterY, 0)
		]);


		HelperUtil.resetOutput();
		HelperUtil.addOutput('<b>Circle 1 - Circle 2</b>');

		intersectionPoints[0] = this._calculateCircleIntersection(
			new Vector3(this._properties.circle1CenterX, this._properties.circle1CenterY, 0),
			this._properties.circle1Radius,
			new Vector3(this._properties.circle2CenterX, this._properties.circle2CenterY, 0),
			this._properties.circle2Radius,
			this._properties.circleTolerance
		);

		HelperUtil.addOutput('<hr>');
		HelperUtil.addOutput('<b>Circle 2 - Circle 3</b>');

		intersectionPoints[1] = this._calculateCircleIntersection(
			new Vector3(this._properties.circle2CenterX, this._properties.circle2CenterY, 0),
			this._properties.circle2Radius,
			new Vector3(this._properties.circle3CenterX, this._properties.circle3CenterY, 0),
			this._properties.circle3Radius,
			this._properties.circleTolerance
		);

		HelperUtil.addOutput('<hr>');
		HelperUtil.addOutput('<b>Circle 3 - Circle 1</b>');

		intersectionPoints[2] = this._calculateCircleIntersection(
			new Vector3(this._properties.circle3CenterX, this._properties.circle3CenterY, 0),
			this._properties.circle3Radius,
			new Vector3(this._properties.circle1CenterX, this._properties.circle1CenterY, 0),
			this._properties.circle1Radius,
			this._properties.circleTolerance
		);
		HelperUtil.addOutput('<hr>');


		for (let i = 0; i < 3; ++i) {
			this._lineIntersectToIntersect[i].geometry.dispose();

			if (intersectionPoints[i].length) {
				this._lineIntersectToIntersect[i].geometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(intersectionPoints[i][0].x, intersectionPoints[i][0].y, 0),
					new THREE.Vector3(intersectionPoints[i][1].x, intersectionPoints[i][1].y, 0)
				]);
			}
		}
	}

	_createCircle(obj, circleCenterX, circleCenterY, circleRadius) {
		const curve = new THREE.EllipseCurve(
			circleCenterX,
			circleCenterY,
			circleRadius,
			circleRadius,
			0,
			2 * Math.PI,
			false,
			0
		);

		obj.geometry.dispose();
		obj.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.circlePoints));
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});
		gui.add(this._properties, 'circleTolerance', 0, 5).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderCircle1 = gui.addFolder('Circle 1');
		folderCircle1.add(this._properties, 'circle1CenterX', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle1.add(this._properties, 'circle1CenterY', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle1.add(this._properties, 'circle1Radius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle1.addColor(this._properties, 'circle1Color').onChange((value) => {
			this._circle1.material.color.set(value);
		});

		const folderCircle2 = gui.addFolder('Circle 2');
		folderCircle2.add(this._properties, 'circle2CenterX', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle2.add(this._properties, 'circle2CenterY', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle2.add(this._properties, 'circle2Radius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle2.addColor(this._properties, 'circle2Color').onChange((value) => {
			this._circle2.material.color.set(value);
		});

		const folderCircle3 = gui.addFolder('Circle 3');
		folderCircle3.add(this._properties, 'circle3CenterX', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle3.add(this._properties, 'circle3CenterY', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle3.add(this._properties, 'circle3Radius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderCircle3.addColor(this._properties, 'circle3Color').onChange((value) => {
			this._circle3.material.color.set(value);
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

	_calculateCircleIntersection(circleCenter1, circleRadius1, circleCenter2, circleRadius2, tolerance) {
		// compute the distance between center of the circle 1 and the circle 2
		const distanceVector = circleCenter2.sub(circleCenter1);

		// compute the length of the distance vector (Pythagorean theorem)
		const distancePow = Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2);
		const distance = Math.sqrt(distancePow);

		HelperUtil.addOutput('Center 1: ' + circleCenter1.toString());
		HelperUtil.addOutput('Center 2: ' + circleCenter2.toString());
		HelperUtil.addOutput('Distance: ' + distanceVector.toString());
		HelperUtil.addOutput('Length  : ' + distance);

		// if the distance is 0, circle 1 and circle 2 have the same center
		if (distance == 0) {
			return [];
		}


		const u = (Math.pow(circleRadius1, 2) - Math.pow(circleRadius2, 2) + distancePow) / (2 * distance);
		const v = (Math.pow(circleRadius2, 2) - Math.pow(circleRadius1, 2) + distancePow) / (2 * distance);

		const hPow = Math.pow(circleRadius1 + tolerance, 2) - Math.pow(u, 2);

		HelperUtil.addOutput('u       : ' + u);
		HelperUtil.addOutput('v       : ' + v);
		HelperUtil.addOutput('hPow    : ' + hPow);

		if (hPow < 0) {
			return [];
		}


		const h = Math.sqrt(hPow);

		let s1 = new Vector3();
		let s2 = new Vector3();

		s1.x = HelperUtil.roundDecimal(circleCenter1.x + ( (u * distanceVector.x) / distance) + ( (h * distanceVector.y) / distance), 5);
		s1.y = HelperUtil.roundDecimal(circleCenter1.y + ( (u * distanceVector.y) / distance) - ( (h * distanceVector.x) / distance), 5);

		s2.x = HelperUtil.roundDecimal(circleCenter1.x + ( (u * distanceVector.x) / distance) - ( (h * distanceVector.y) / distance), 5);
		s2.y = HelperUtil.roundDecimal(circleCenter1.y + ( (u * distanceVector.y) / distance) + ( (h * distanceVector.x) / distance), 5);

		HelperUtil.addOutput('h       : ' + h);
		HelperUtil.addOutput('S1      : ' + s1.toString());
		HelperUtil.addOutput('S2      : ' + s2.toString());

		const distanceIntersection = s2.sub(s1);

		s1 = s1.sub(distanceIntersection);
		s2 = s2.add(distanceIntersection);

		return [s1, s2];
	}
}
